/* eslint-disable no-console */

declare const require: any;
declare const process: any;

const fs: any = require('node:fs');
const path: any = require('node:path');

import mongoose, { Types } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { TripSchema } from '../src/trips/schemas/trip.schema';
import { LocationSchema } from '../src/locations/schemas/location.schema';
import { VehicleSchema } from '../src/vehicles/schemas/vehicle.schema';
import { CompanySchema } from '../src/companies/schemas/company.schema';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Ho_Chi_Minh';
type AnyObj = Record<string, any>;

function loadEnvFromFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return false;

    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = String(raw).split(/\r?\n/);

    for (const line of lines) {
      const trimmed = String(line).trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();

      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      if (!process.env[key]) process.env[key] = val;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Load .env tại nhiều cấp: apps/api/.env, monorepo root .env, ...
 */
function loadEnvCandidates() {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, '.env'),
    path.resolve(cwd, '..', '.env'),
    path.resolve(cwd, '..', '..', '.env'),
    path.resolve(cwd, '..', '..', '..', '.env'),
    path.resolve(cwd, '.env.local'),
    path.resolve(cwd, '..', '..', '.env.local'),
  ];

  const loaded: string[] = [];
  for (const p of candidates) {
    if (loadEnvFromFile(p)) loaded.push(p);
  }
  if (loaded.length) console.log('🔧 Loaded env from:', loaded);
}

function toObjectId(value: unknown): Types.ObjectId {
  if (value instanceof Types.ObjectId) return value;

  const raw =
    value && typeof value === 'object' && '_id' in (value as any)
      ? (value as any)._id
      : value;

  const s = (raw as any)?.toString?.() ?? String(raw ?? '');
  if (!Types.ObjectId.isValid(s)) throw new Error(`Invalid ObjectId: ${s}`);
  return new Types.ObjectId(s);
}

/**
 * Gắn dbName vào uri để tránh truyền option {dbName} (hay bị TS mismatch)
 */
function withDbName(uri: string, dbName: string) {
  if (!dbName) return uri;

  const parts = String(uri).split('?');
  const base = parts[0];
  const query = parts[1];

  const protoIdx = base.indexOf('://');
  const afterProto = protoIdx >= 0 ? protoIdx + 3 : 0;
  const firstSlashAfterHost = base.indexOf('/', afterProto);

  const alreadyHasDb =
    firstSlashAfterHost !== -1 && firstSlashAfterHost < base.length - 1;

  if (alreadyHasDb) return uri;

  const baseNoTrail = base.endsWith('/') ? base.slice(0, -1) : base;
  const next = `${baseNoTrail}/${dbName}`;
  return query ? `${next}?${query}` : next;
}

function initializeTripSeats(vehicle: AnyObj) {
  const available = 'available';
  const generated: AnyObj[] = [];

  const processLayout = (layout: any) => {
    if (!layout) return;
    for (const row of layout) {
      if (!Array.isArray(row)) continue;
      for (const seatLabel of row) {
        if (seatLabel) generated.push({ seatNumber: seatLabel, status: available });
      }
    }
  };

  if (vehicle?.seatMap?.layout) processLayout(vehicle.seatMap.layout);
  if (vehicle?.floors && vehicle.floors > 1 && vehicle?.seatMapFloor2?.layout) {
    processLayout(vehicle.seatMapFloor2.layout);
  }

  if (generated.length === 0 && vehicle?.totalSeats && vehicle.totalSeats > 0) {
    for (let i = 1; i <= vehicle.totalSeats; i++) {
      generated.push({ seatNumber: `G${i}`, status: available });
    }
  }

  return generated;
}

function shiftStops(templateStops: AnyObj[] | undefined, deltaMs: number) {
  if (!Array.isArray(templateStops) || templateStops.length === 0) return [];

  return templateStops.map((s) => {
    const expectedArrivalTime = s.expectedArrivalTime
      ? new Date(new Date(s.expectedArrivalTime).getTime() + deltaMs)
      : undefined;

    const expectedDepartureTime = s.expectedDepartureTime
      ? new Date(new Date(s.expectedDepartureTime).getTime() + deltaMs)
      : undefined;

    return {
      locationId: toObjectId(s.locationId),
      expectedArrivalTime,
      expectedDepartureTime,
      status: s.status ?? 'pending',
    };
  });
}

/**
 * Nếu DB thiếu companies/vehicles thì tự tạo tối thiểu để seed trips chạy được.
 * (dùng collection.insertOne để tránh schema validate “required field” lạ)
 */
async function ensureBaseData() {
  const db = mongoose.connection.db;
  const companiesCol = db.collection('companies');
  const vehiclesCol = db.collection('vehicles');

  const companiesCount = await companiesCol.countDocuments();
  const vehiclesCount = await vehiclesCol.countDocuments();

  if (companiesCount > 0 && vehiclesCount > 0) {
    return {
      companyId: null as Types.ObjectId | null,
      vehicleId: null as Types.ObjectId | null,
      companiesCount,
      vehiclesCount,
      createdBase: false,
    };
  }

  console.log('⚠️ Base data missing. Creating minimal company + vehicle...');

  const now = new Date();
  const companyId = new Types.ObjectId();
  const vehicleId = new Types.ObjectId();

  if (companiesCount === 0) {
    await companiesCol.insertOne({
      _id: companyId,
      name: 'Demo Bus Company',
      email: 'demo-company@example.com',
      phone: '0900000000',
      address: 'Seed address',
      status: 'active',
      isActive: true,
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // nếu đã có companies nhưng vehicles thiếu, lấy 1 company bất kỳ
    const anyCompany = await companiesCol.findOne({}, { projection: { _id: 1 } });
    if (anyCompany?._id) (companyId as any) = anyCompany._id;
  }

  if (vehiclesCount === 0) {
    // seat map đơn giản 36 ghế
    const layout = [
      ['A1', 'A2', null, 'A3', 'A4'],
      ['B1', 'B2', null, 'B3', 'B4'],
      ['C1', 'C2', null, 'C3', 'C4'],
      ['D1', 'D2', null, 'D3', 'D4'],
      ['E1', 'E2', null, 'E3', 'E4'],
      ['F1', 'F2', null, 'F3', 'F4'],
      ['G1', 'G2', null, 'G3', 'G4'],
      ['H1', 'H2', null, 'H3', 'H4'],
      ['I1', 'I2', null, 'I3', 'I4'],
    ];

    await vehiclesCol.insertOne({
      _id: vehicleId,
      companyId: companyId,
      name: 'Demo Coach',
      licensePlate: 'SEED-0001',
      type: 'coach',
      floors: 1,
      totalSeats: 36,
      seatMap: { layout },
      status: 'active',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const anyVehicle = await vehiclesCol.findOne({}, { projection: { _id: 1 } });
  const finalVehicleId = anyVehicle?._id ? anyVehicle._id : vehicleId;

  return {
    companyId: companyId as Types.ObjectId,
    vehicleId: finalVehicleId as Types.ObjectId,
    companiesCount,
    vehiclesCount,
    createdBase: true,
  };
}

async function main() {
  loadEnvCandidates();

  // ✅ Cho phép override bằng env để trỏ đúng DB backend
  const mongoUriBase =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017';

  const dbName = process.env.DB_NAME || 'bus_ticket_db';
  const mongoUri = withDbName(mongoUriBase, dbName);

  const days = Math.max(1, parseInt(process.env.SEED_DAYS || '30', 10));
  const startDateStr =
    process.env.SEED_START_DATE || dayjs().tz(TZ).format('YYYY-MM-DD');

  const timesStr = process.env.SEED_TIMES || '07:00,09:30,13:00,20:00';
  const times = String(timesStr)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  console.log('🧪 seed:trips config =', {
    mongoUri,
    startDate: startDateStr,
    days,
    times,
  });

  await mongoose.connect(mongoUri as any);

  // Ép any để tránh type “unknown”
  const Trip: any = mongoose.model('Trip', TripSchema as any, 'trips');
  const Location: any = mongoose.model('Location', LocationSchema as any, 'locations');
  const Vehicle: any = mongoose.model('Vehicle', VehicleSchema as any, 'vehicles');
  const Company: any = mongoose.model('Company', CompanySchema as any, 'companies');

  const baseInfo = await ensureBaseData();

  // nếu bạn seed nhầm DB (khác DB backend), ít nhất log ra count để bạn thấy
  console.log('📦 DB snapshot:', {
    companies: await mongoose.connection.db.collection('companies').countDocuments(),
    vehicles: await mongoose.connection.db.collection('vehicles').countDocuments(),
    locations: await mongoose.connection.db.collection('locations').countDocuments(),
    trips: await mongoose.connection.db.collection('trips').countDocuments(),
    createdBase: baseInfo.createdBase,
  });

  const ROUTES = [
    { key: 'HN_HCM', fromSlug: 'ben-xe-nuoc-ngam', toSlug: 'ben-xe-mien-djong-moi', durationHours: 34, price: 450000 },
    { key: 'HN_DN',  fromSlug: 'ben-xe-nuoc-ngam', toSlug: 'ben-xe-trung-tam-dja-nang', durationHours: 16, price: 320000 },
    { key: 'DN_HCM', fromSlug: 'ben-xe-trung-tam-dja-nang', toSlug: 'ben-xe-mien-djong-moi', durationHours: 18, price: 360000 },
    { key: 'HP_HN',  fromSlug: 'ben-xe-thuong-ly', toSlug: 'ben-xe-nuoc-ngam', durationHours: 3,  price: 160000 },
    { key: 'HCM_CT', fromSlug: 'ben-xe-mien-djong-moi', toSlug: 'ben-xe-trung-tam-can-tho', durationHours: 4,  price: 180000 },
  ];

  const seatAvailable = 'available';
  const statusScheduled = 'scheduled';

  let created = 0;
  let skipped = 0;
  let missingRoutes = 0;

  const locCache = new Map<string, AnyObj>();
  async function getLocationBySlug(slug: string): Promise<AnyObj | null> {
    if (locCache.has(slug)) return locCache.get(slug)!;
    const loc = (await Location.findOne({ slug }).lean()) as AnyObj | null;
    if (loc) locCache.set(slug, loc);
    return loc;
  }

  // fallback company/vehicle: lấy từ templateTrip hoặc lấy bất kỳ trong DB
  const anyVehicle = (await Vehicle.findOne({}).lean()) as AnyObj | null;
  const anyCompany = (await Company.findOne({}).lean()) as AnyObj | null;

  if (!anyVehicle || !anyCompany) {
    console.error('❌ Still missing companies/vehicles after ensureBaseData. Check MONGODB_URI/DB_NAME.');
    process.exit(1);
  }

  for (const route of ROUTES) {
    const fromLoc = await getLocationBySlug(route.fromSlug);
    const toLoc = await getLocationBySlug(route.toSlug);

    if (!fromLoc || !toLoc) {
      console.warn(`⚠️ Skip route ${route.key}: missing location slug(s)`, {
        fromSlug: route.fromSlug,
        toSlug: route.toSlug,
      });
      missingRoutes += 1;
      continue;
    }

    const fromId = toObjectId(fromLoc._id);
    const toId = toObjectId(toLoc._id);

    const templateTrip = (await Trip.findOne({
      'route.fromLocationId': fromId,
      'route.toLocationId': toId,
      isRecurrenceTemplate: false,
    }).sort({ departureTime: -1 }).lean()) as AnyObj | null;

    let companyId = templateTrip?.companyId
      ? toObjectId(templateTrip.companyId)
      : toObjectId(anyCompany._id);

    let vehicleId = templateTrip?.vehicleId
      ? toObjectId(templateTrip.vehicleId)
      : toObjectId(anyVehicle._id);

    const vehicleDoc = (await Vehicle.findById(vehicleId).lean()) as AnyObj | null;
    if (!vehicleDoc) vehicleId = toObjectId(anyVehicle._id);

    const vehicleForSeats: AnyObj =
      ((await Vehicle.findById(vehicleId).lean()) as AnyObj) || (anyVehicle as AnyObj);

    const durationMs =
      templateTrip?.departureTime && templateTrip?.expectedArrivalTime
        ? new Date(templateTrip.expectedArrivalTime).getTime() -
          new Date(templateTrip.departureTime).getTime()
        : route.durationHours * 60 * 60 * 1000;

    const basePrice = Number(templateTrip?.price ?? route.price);

    const templateSeats = Array.isArray(templateTrip?.seats) ? templateTrip!.seats : [];
    const baseSeats =
      templateSeats.length > 0
        ? templateSeats.map((s: AnyObj) => ({
            seatNumber: String(s.seatNumber),
            status: seatAvailable,
            floor: s.floor,
            position: s.position,
          }))
        : initializeTripSeats(vehicleForSeats);

    const tplRoute = templateTrip?.route || {};

    for (let d = 0; d < days; d++) {
      const dateStr = dayjs.tz(startDateStr, TZ).add(d, 'day').format('YYYY-MM-DD');

      for (const hhmm of times) {
        const [hh, mm] = hhmm.split(':').map((x) => parseInt(x, 10));

        const depart = dayjs
          .tz(dateStr, TZ)
          .hour(Number.isFinite(hh) ? hh : 0)
          .minute(Number.isFinite(mm) ? mm : 0)
          .second(0)
          .millisecond(0);

        const departureTime = depart.toDate();
        const expectedArrivalTime = new Date(departureTime.getTime() + durationMs);

        const existing = (await Trip.findOne({
          'route.fromLocationId': fromId,
          'route.toLocationId': toId,
          departureTime: {
            $gte: new Date(departureTime.getTime() - 2 * 60 * 1000),
            $lt: new Date(departureTime.getTime() + 2 * 60 * 1000),
          },
          isRecurrenceTemplate: false,
        }).lean()) as AnyObj | null;

        if (existing) {
          skipped += 1;
          continue;
        }

        const deltaMs = templateTrip?.departureTime
          ? departureTime.getTime() - new Date(templateTrip.departureTime).getTime()
          : 0;

        const seats = baseSeats.map((s: AnyObj) => ({ ...s, status: seatAvailable }));
        const availableSeatsCount = seats.length;

        const newTripDoc: AnyObj = {
          companyId,
          vehicleId,
          route: {
            fromLocationId: fromId,
            toLocationId: toId,
            stops: shiftStops(tplRoute?.stops, deltaMs),
            duration: tplRoute?.duration,
            distance: tplRoute?.distance,
            polyline: tplRoute?.polyline,
          },
          departureTime,
          expectedArrivalTime,
          price: basePrice,
          status: statusScheduled,
          seats,
          availableSeatsCount,
          isRecurrenceTemplate: false,
          isRecurrenceActive: false,
          recurrenceParentId: undefined,
          driverId: undefined,
        };

        await Trip.create(newTripDoc);
        created += 1;
      }
    }

    console.log(`✅ Seeded route ${route.key}: ${route.fromSlug} -> ${route.toSlug}`);
  }

  console.log('🎉 Done seed:trips', { created, skipped, missingRoutes });
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('❌ seed:trips failed:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});