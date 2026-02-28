// scripts/seed-trips.ts
import "dotenv/config";
import mongoose, { Types } from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Ho_Chi_Minh";
const SEED_TAG = "seed-demo-v2";
const DEMO_PASSWORD = "Demo@1234";

// Schemas + Definitions
import { TripDefinition, TripSchema } from "../src/trips/schemas/trip.schema";
import { CompanyDefinition, CompanySchema } from "../src/companies/schemas/company.schema";
import { VehicleDefinition, VehicleSchema } from "../src/vehicles/schemas/vehicle.schema";
import { LocationDefinition, LocationSchema } from "../src/locations/schemas/location.schema";
import { BookingDefinition, BookingSchema } from "../src/bookings/schemas/booking.schema";
import { UserDefinition, UserSchema } from "../src/users/schemas/user.schema";
import { DriverProfileDefinition, DriverProfileSchema } from "../src/drivers/schemas/driver-profile.schema";
import { DriveFileDefinition, DriveFileSchema } from "../src/users/schemas/drive-file.schema";

import {
  SeatStatus,
  LocationType,
  VehicleStatus,
  CompanyStatus,
  TripStopStatus,
  BookingStatus,
  PaymentStatus,
  UserRole,
} from "@obtp/shared-types";

import { hashPassword } from "@obtp/business-logic";

/** ---------- helpers ---------- */

const valuesOf = (e: any) => Object.values(e ?? {}).filter((v) => typeof v === "string") as string[];

function pickEnumValue(enumObj: any, wantedLower: string, fallback?: any) {
  const vals = valuesOf(enumObj);
  const found = vals.find((v) => String(v).toLowerCase() === wantedLower);
  return found ?? fallback;
}

function seatLabel(row: number, col: number) {
  const rowChar = String.fromCharCode(64 + row);
  return `${rowChar}${col}`;
}

function buildSeats(seatRows: number, seatColumns: number, floors: number) {
  const seats: any[] = [];
  const totalFloors = Math.max(1, floors || 1);

  for (let floor = 1; floor <= totalFloors; floor++) {
    for (let r = 1; r <= seatRows; r++) {
      for (let c = 1; c <= seatColumns; c++) {
        const base = seatLabel(r, c);
        const seatNumber = totalFloors > 1 ? `${floor}-${base}` : base;

        seats.push({
          seatNumber,
          status: SeatStatus.AVAILABLE,
          bookingId: undefined,
          floor: totalFloors > 1 ? floor : undefined,
          position: { row: r, col: c },
        });
      }
    }
  }
  return seats;
}

function countAvailable(seats: any[]) {
  return seats.filter((s) => s.status === SeatStatus.AVAILABLE).length;
}

function randomPhone(prefix = "09") {
  const tail = Math.floor(10000000 + Math.random() * 89999999);
  return `${prefix}${tail}`;
}

async function upsertBy<T>(Model: mongoose.Model<any>, filter: any, doc: any): Promise<any> {
  return Model.findOneAndUpdate(filter, { $set: doc }, { upsert: true, new: true }).exec();
}

/** set seat status inside trip doc */
async function applySeatStatus(
  TripModel: mongoose.Model<any>,
  tripId: Types.ObjectId,
  seatNumbers: string[],
  status: any,
  bookingId?: Types.ObjectId,
) {
  const trip = await TripModel.findById(tripId).exec();
  if (!trip) return;

  const set = new Set(seatNumbers);

  trip.seats = (trip.seats || []).map((s: any) => {
    if (set.has(s.seatNumber)) {
      return { ...s, status, bookingId: bookingId ?? undefined };
    }
    return s;
  });

  trip.availableSeatsCount = trip.seats.filter((s: any) => s.status === SeatStatus.AVAILABLE).length;
  await trip.save();
}

/** build stops with time distributed */
function buildStops(dep: Date, durationMin: number, stopIds: Types.ObjectId[], stopStatusSeed?: { pending: string; passed?: string }) {
  const stopsCount = stopIds.length;
  if (!stopsCount) return [];

  const pending = stopStatusSeed?.pending ?? pickEnumValue(TripStopStatus, "pending", "pending");

  const base = dayjs(dep);
  const total = Math.max(1, durationMin);
  const stops: any[] = [];

  for (let i = 0; i < stopIds.length; i++) {
    const frac = (i + 1) / (stopsCount + 1);
    const arr = base.add(Math.round(total * frac), "minute");
    const dep2 = arr.add(15, "minute");

    stops.push({
      locationId: stopIds[i],
      expectedArrivalTime: arr.toDate(),
      expectedDepartureTime: dep2.toDate(),
      status: pending,
    });
  }
  return stops;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in .env");

  await mongoose.connect(uri);
  console.log("✅ Connected MongoDB");

  // Models used by Nest + populate aliases
  const CompanyDefModel =
    (mongoose.models[CompanyDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(CompanyDefinition.name, CompanySchema);
  const CompanyModel =
    (mongoose.models.Company as mongoose.Model<any>) ||
    mongoose.model<any>("Company", CompanySchema);

  const VehicleDefModel =
    (mongoose.models[VehicleDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(VehicleDefinition.name, VehicleSchema);
  const VehicleModel =
    (mongoose.models.Vehicle as mongoose.Model<any>) ||
    mongoose.model<any>("Vehicle", VehicleSchema);

  const LocationDefModel =
    (mongoose.models[LocationDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(LocationDefinition.name, LocationSchema);
  const LocationModel =
    (mongoose.models.Location as mongoose.Model<any>) ||
    mongoose.model<any>("Location", LocationSchema);

  const TripModel =
    (mongoose.models[TripDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(TripDefinition.name, TripSchema);

  const BookingModel =
    (mongoose.models[BookingDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(BookingDefinition.name, BookingSchema);
  if (!mongoose.models.Booking) mongoose.model<any>("Booking", BookingSchema);

  const UserModel =
    (mongoose.models[UserDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(UserDefinition.name, UserSchema);

  const DriverProfileModel =
    (mongoose.models[DriverProfileDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(DriverProfileDefinition.name, DriverProfileSchema);

  const DriveFileModel =
    (mongoose.models[DriveFileDefinition.name] as mongoose.Model<any>) ||
    mongoose.model<any>(DriveFileDefinition.name, DriveFileSchema);

  // ---- resolve enum values robustly ----
  const ROLE_DRIVER =
    valuesOf(UserRole).find((v) => v.toLowerCase() === "driver") ??
    valuesOf(UserRole).find((v) => v.toLowerCase().includes("company_admin")) ??
    valuesOf(UserRole)[0];

  const ROLE_USER =
    valuesOf(UserRole).find((v) => v.toLowerCase() === "user") ?? valuesOf(UserRole)[0];

  const BK_PENDING =
    valuesOf(BookingStatus).find((v) => v.toLowerCase().includes("pending")) ?? "PENDING";
  const BK_HELD =
    valuesOf(BookingStatus).find((v) => v.toLowerCase().includes("held")) ?? "HELD";
  const BK_CONFIRMED =
    valuesOf(BookingStatus).find((v) => v.toLowerCase().includes("confirmed")) ?? "CONFIRMED";
  const BK_CANCELLED =
    valuesOf(BookingStatus).find((v) => v.toLowerCase().includes("cancel")) ?? "CANCELLED";
  const BK_COMPLETED =
    valuesOf(BookingStatus).find((v) => v.toLowerCase().includes("completed"));

  const PAY_PENDING =
    valuesOf(PaymentStatus).find((v) => v.toLowerCase().includes("pending")) ?? "PENDING";
  const PAY_PAID =
    valuesOf(PaymentStatus).find((v) => v.toLowerCase().includes("paid")) ?? "PAID";
  const PAY_FAILED =
    valuesOf(PaymentStatus).find((v) => v.toLowerCase().includes("failed")) ?? "FAILED";

  const STOP_PENDING =
    valuesOf(TripStopStatus).find((v) => v.toLowerCase() === "pending") ?? "pending";

  console.log("ℹ️ Enum picks:", {
    ROLE_DRIVER,
    ROLE_USER,
    BK_PENDING,
    BK_HELD,
    BK_CONFIRMED,
    BK_CANCELLED,
    BK_COMPLETED,
    PAY_PENDING,
    PAY_PAID,
    PAY_FAILED,
    STOP_PENDING,
  });

  // ---- cleanup ONLY seed demo data ----
  await Promise.all([
    BookingModel.deleteMany({
      $or: [
        { ticketCode: new RegExp(`^${SEED_TAG}`, "i") },
        { contactEmail: new RegExp(`@${SEED_TAG}\\.demo$`, "i") },
      ],
    } as any),
    TripModel.deleteMany({ "route.polyline": SEED_TAG } as any),
    DriverProfileModel.deleteMany({ licenseNumber: new RegExp(`^${SEED_TAG}`, "i") } as any),
    DriveFileModel.deleteMany({ originalName: new RegExp(`^${SEED_TAG}`, "i") } as any),
    UserModel.deleteMany({ email: { $in: [`user@${SEED_TAG}.demo`, `driver@${SEED_TAG}.demo`] } } as any),
    VehicleDefModel.deleteMany({ vehicleNumber: { $in: ["SEED-51A-999.01", "SEED-29B-888.02"] } } as any),
    CompanyDefModel.deleteMany({ code: { $in: ["PTD", "TBD"] } } as any),
    LocationDefModel.deleteMany({
      slug: { $in: ["ha-noi", "ho-chi-minh", "da-nang", "da-lat", "nha-trang", "can-tho", "hai-phong", "hue"] },
    } as any),
  ]);

  // ---- locations (upsert) ----
  const locationsSeed: any[] = [
    { name: "Hà Nội", province: "Hà Nội", slug: "ha-noi", fullAddress: "Hà Nội, Việt Nam", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [105.8342, 21.0278] } },
    { name: "TP. Hồ Chí Minh", province: "TP. Hồ Chí Minh", slug: "ho-chi-minh", fullAddress: "TP. Hồ Chí Minh, Việt Nam", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [106.6297, 10.8231] } },
    { name: "Đà Nẵng", province: "Đà Nẵng", slug: "da-nang", fullAddress: "Đà Nẵng, Việt Nam", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [108.2022, 16.0544] } },
    { name: "Huế", province: "Thừa Thiên Huế", slug: "hue", fullAddress: "Huế, Thừa Thiên Huế", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [107.5909, 16.4637] } },
    { name: "Nha Trang", province: "Khánh Hòa", slug: "nha-trang", fullAddress: "Nha Trang, Khánh Hòa", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [109.1967, 12.2388] } },
    { name: "Đà Lạt", province: "Lâm Đồng", slug: "da-lat", fullAddress: "Đà Lạt, Lâm Đồng", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [108.4583, 11.9404] } },
    { name: "Cần Thơ", province: "Cần Thơ", slug: "can-tho", fullAddress: "Cần Thơ, Việt Nam", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [105.7469, 10.0452] } },
    { name: "Hải Phòng", province: "Hải Phòng", slug: "hai-phong", fullAddress: "Hải Phòng, Việt Nam", isActive: true, type: LocationType.CITY, location: { type: "Point", coordinates: [106.6822, 20.8449] } },
  ];

  const locationDocs: any[] = [];
  for (const loc of locationsSeed) {
    const doc = await upsertBy(LocationDefModel, { slug: loc.slug }, loc);
    locationDocs.push(doc);
  }
  const byName = (name: string) => locationDocs.find((l) => l.name === name)!;

  // ---- companies (upsert) ----
  const pt = await upsertBy(CompanyDefModel, { code: "PTD" }, {
    name: "Phương Trang (Demo)",
    code: "PTD",
    status: CompanyStatus.ACTIVE, // tạm, sẽ ép string "active" ngay dưới
    address: "VN",
    phone: "1900-PTD",
    email: `pt@${SEED_TAG}.demo`,
    logoUrl: "",
    description: "Seed demo company",
  });

  const tb = await upsertBy(CompanyDefModel, { code: "TBD" }, {
    name: "Thành Bưởi (Demo)",
    code: "TBD",
    status: CompanyStatus.ACTIVE,
    address: "VN",
    phone: "1900-TBD",
    email: `tb@${SEED_TAG}.demo`,
    logoUrl: "",
    description: "Seed demo company",
  });

  // ✅ IMPORTANT: backend bạn check string 'active'
  await CompanyDefModel.updateMany({ _id: { $in: [pt._id, tb._id] } }, { $set: { status: "active" } });

  // ensure populate aliases
  await CompanyModel.findOneAndUpdate({ _id: pt._id }, { $set: {} }, { upsert: false }).exec();
  await CompanyModel.findOneAndUpdate({ _id: tb._id }, { $set: {} }, { upsert: false }).exec();

  // ---- vehicles (upsert) ----
  const v1 = await upsertBy(VehicleDefModel, { companyId: pt._id, vehicleNumber: "SEED-51A-999.01" }, {
    companyId: pt._id,
    vehicleNumber: "SEED-51A-999.01",
    type: "Giường nằm",
    status: VehicleStatus.ACTIVE,
    floors: 1,
    seatColumns: 4,
    seatRows: 11,
    aislePositions: [3],
    totalSeats: 44,
  });

  const v2 = await upsertBy(VehicleDefModel, { companyId: tb._id, vehicleNumber: "SEED-29B-888.02" }, {
    companyId: tb._id,
    vehicleNumber: "SEED-29B-888.02",
    type: "Limousine",
    status: VehicleStatus.ACTIVE,
    floors: 1,
    seatColumns: 3,
    seatRows: 9,
    aislePositions: [2],
    totalSeats: 27,
  });

  // ---- trips templates ----
  const routeTemplates = [
    { from: "Hà Nội", to: "TP. Hồ Chí Minh", durationMin: 32 * 60, distanceKm: 1700, basePrice: 650000, stops: ["Huế", "Đà Nẵng", "Nha Trang"] },
    { from: "TP. Hồ Chí Minh", to: "Đà Nẵng", durationMin: 18 * 60, distanceKm: 950, basePrice: 450000, stops: ["Nha Trang", "Huế"] },
    { from: "TP. Hồ Chí Minh", to: "Đà Lạt", durationMin: 7 * 60, distanceKm: 310, basePrice: 280000, stops: [] },
    { from: "Đà Nẵng", to: "Huế", durationMin: 3 * 60, distanceKm: 100, basePrice: 140000, stops: [] },
    { from: "TP. Hồ Chí Minh", to: "Nha Trang", durationMin: 9 * 60, distanceKm: 430, basePrice: 320000, stops: [] },
  ];

  const startOfTodayVN = dayjs().tz(TZ).startOf("day");
  const nowVN = dayjs().tz(TZ);

  // ✅ Today always future time: now + 2h (rounded to hour, max 22)
  const todayFutureHour = Math.min(nowVN.add(2, "hour").hour(), 22);
  const timesFutureDays = [7, 13]; // giữ như bạn

  const tripsToInsert: any[] = [];
  const days = 6;

  for (let d = 0; d <= days; d++) {
    const hours = d === 0 ? [todayFutureHour] : timesFutureDays;

    for (const r of routeTemplates) {
      for (let i = 0; i < hours.length; i++) {
        const dep = startOfTodayVN.add(d, "day").hour(hours[i]).minute(0).second(0).millisecond(0).toDate();
        const arr = dayjs(dep).add(r.durationMin, "minute").toDate();

        const company = (i + d) % 2 === 0 ? pt : tb;
        const vehicle = company.code === "PTD" ? v1 : v2;

        const seats = buildSeats(vehicle.seatRows, vehicle.seatColumns, vehicle.floors);
        const availableSeatsCount = countAvailable(seats);

        const stopIds = (r.stops || [])
          .map((nm) => byName(nm)?._id)
          .filter(Boolean)
          .map((id) => new Types.ObjectId(id));

        const stops = buildStops(dep, r.durationMin, stopIds, { pending: STOP_PENDING });

        tripsToInsert.push({
          companyId: new Types.ObjectId(company._id),
          vehicleId: new Types.ObjectId(vehicle._id),
          route: {
            fromLocationId: new Types.ObjectId(byName(r.from)._id),
            toLocationId: new Types.ObjectId(byName(r.to)._id),
            stops,
            polyline: SEED_TAG,
            duration: r.durationMin,
            distance: r.distanceKm,
          },
          departureTime: dep,
          expectedArrivalTime: arr,
          price: r.basePrice + (d % 2 === 0 ? 0 : 20000),

          // ✅ IMPORTANT: backend thường check status === "scheduled"
          status: "scheduled",

          seats,
          availableSeatsCount,
          isRecurrenceTemplate: false,
          isRecurrenceActive: false,
        });
      }
    }
  }

  const insertedTrips = await TripModel.insertMany(tripsToInsert);
  console.log(`✅ Trips inserted = ${insertedTrips.length}`);

  // ---- demo users ----
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const demoUser = await UserModel.create({
    email: `user@${SEED_TAG}.demo`,
    phone: randomPhone("09"),
    name: "Demo User",
    passwordHash,
    roles: [ROLE_USER],
    isEmailVerified: true,
  });

  const demoDriver = await UserModel.create({
    email: `driver@${SEED_TAG}.demo`,
    phone: randomPhone("08"),
    name: "Demo Driver",
    passwordHash,
    roles: [ROLE_DRIVER],
    companyId: pt._id,
    isEmailVerified: true,
  });

  await DriverProfileModel.create({
    userId: demoDriver._id,
    licenseNumber: `${SEED_TAG}-LIC-001`,
    idCardNumber: `${SEED_TAG}-ID-001`,
    experienceYears: 3,
    status: "approved",
  });

  await DriveFileModel.create({
    userId: demoUser._id,
    originalName: `${SEED_TAG}-gioi-thieu.pdf`,
    mimeType: "application/pdf",
    size: 245_760,
    storagePath: `/uploads/${SEED_TAG}/gioi-thieu.pdf`,
  });

  // ---- demo bookings ----
  const findTrip = (from: string, to: string, dayOffset: number) => {
    const dayStart = startOfTodayVN.add(dayOffset, "day");
    const dayEnd = dayStart.add(1, "day");
    return insertedTrips.find((tr: any) => {
      const dep = dayjs(tr.departureTime).tz(TZ);
      const okDay = dep.isAfter(dayStart) && dep.isBefore(dayEnd);
      if (!okDay) return false;

      const fromDoc = locationDocs.find((l) => String(l._id) === String(tr.route?.fromLocationId));
      const toDoc = locationDocs.find((l) => String(l._id) === String(tr.route?.toLocationId));
      return fromDoc?.name === from && toDoc?.name === to;
    });
  };

  // chọn chắc chuyến tương lai
  const tripConfirmed = findTrip("Hà Nội", "TP. Hồ Chí Minh", 1) ?? insertedTrips[0];
  const tripHeld = findTrip("TP. Hồ Chí Minh", "Đà Nẵng", 2) ?? insertedTrips[1];
  const tripCancelled = findTrip("TP. Hồ Chí Minh", "Đà Lạt", 3) ?? insertedTrips[2];

  const ticket1 = `${SEED_TAG}-TICKET-001`;

  const b1 = await BookingModel.create({
    userId: demoUser._id,
    tripId: tripConfirmed._id,
    companyId: tripConfirmed.companyId,
    bookingTime: new Date(),
    status: BK_CONFIRMED,
    paymentStatus: PAY_PAID,
    paymentMethod: "demo",
    totalAmount: Number(tripConfirmed.price || 650000),
    passengers: [{ name: demoUser.name, phone: demoUser.phone, seatNumber: "A1", price: Number(tripConfirmed.price || 650000) }],
    contactName: demoUser.name,
    contactPhone: demoUser.phone,
    contactEmail: demoUser.email,
    ticketCode: ticket1,
  });

  await applySeatStatus(TripModel, tripConfirmed._id, ["A1"], SeatStatus.BOOKED, b1._id);

  const heldUntil = dayjs().add(25, "minute").toDate();

  const b2 = await BookingModel.create({
    userId: demoUser._id,
    tripId: tripHeld._id,
    companyId: tripHeld.companyId,
    bookingTime: new Date(),
    status: BK_HELD,
    heldUntil,
    paymentStatus: PAY_PENDING,
    totalAmount: Number(tripHeld.price || 450000),
    passengers: [{ name: demoUser.name, phone: demoUser.phone, seatNumber: "A2", price: Number(tripHeld.price || 450000) }],
    contactName: demoUser.name,
    contactPhone: demoUser.phone,
    contactEmail: demoUser.email,
  });

  await applySeatStatus(TripModel, tripHeld._id, ["A2"], SeatStatus.HELD, b2._id);

  await BookingModel.create({
    userId: demoUser._id,
    tripId: tripCancelled._id,
    companyId: tripCancelled.companyId,
    bookingTime: new Date(),
    status: BK_CANCELLED,
    paymentStatus: PAY_FAILED,
    totalAmount: Number(tripCancelled.price || 280000),
    passengers: [{ name: demoUser.name, phone: demoUser.phone, seatNumber: "A3", price: Number(tripCancelled.price || 280000) }],
    contactName: demoUser.name,
    contactPhone: demoUser.phone,
    contactEmail: demoUser.email,
  });

  if (BK_COMPLETED) {
    await BookingModel.create({
      userId: demoUser._id,
      tripId: tripConfirmed._id,
      companyId: tripConfirmed.companyId,
      bookingTime: new Date(),
      status: BK_COMPLETED,
      paymentStatus: PAY_PAID,
      totalAmount: Number(tripConfirmed.price || 650000),
      passengers: [{ name: demoUser.name, phone: demoUser.phone, seatNumber: "A4", price: Number(tripConfirmed.price || 650000) }],
      contactName: demoUser.name,
      contactPhone: demoUser.phone,
      contactEmail: demoUser.email,
      ticketCode: `${SEED_TAG}-TICKET-002`,
      checkedInAt: new Date(),
      checkedInBy: demoDriver.name,
      checkedInByDriverId: demoDriver._id,
    } as any);
  }

  console.log("✅ DEMO ACCOUNTS");
  console.log(`   USER  : user@${SEED_TAG}.demo / ${DEMO_PASSWORD}`);
  console.log(`   DRIVER: driver@${SEED_TAG}.demo / ${DEMO_PASSWORD}`);
  console.log("✅ DEMO TICKET:", ticket1);

  const sample = insertedTrips[0];
  console.log("🧪 sample departureTime VN =", dayjs(sample.departureTime).tz(TZ).format("YYYY-MM-DD HH:mm"));

  await mongoose.disconnect();
  console.log("✅ Done.");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});