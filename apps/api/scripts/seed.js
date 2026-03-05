/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

const mongoose = require("mongoose");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Ho_Chi_Minh";

/**
 * Minimal .env loader (no extra deps like dotenv)
 */
function loadEnvFromFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;

    const raw = fs.readFileSync(filePath, "utf8");
    const lines = String(raw).split(/\r?\n/);

    for (const line of lines) {
      const trimmed = String(line).trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");
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

function loadEnvCandidates() {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, ".env"),
    path.resolve(cwd, "..", ".env"),
    path.resolve(cwd, "..", "..", ".env"),
    path.resolve(cwd, "..", "..", "..", ".env"),
    path.resolve(cwd, ".env.local"),
    path.resolve(cwd, "..", "..", ".env.local"),
  ];

  const loaded = [];
  for (const p of candidates) {
    if (loadEnvFromFile(p)) loaded.push(p);
  }
  if (loaded.length) console.log("🔧 Loaded env from:", loaded);
}

function withDbName(uri, dbName) {
  // supports:
  // - mongodb://host:27017
  // - mongodb://host:27017/
  // - mongodb://host:27017/db
  // - mongodb://host:27017/db?opts...
  // - mongodb+srv://...
  if (!uri) return `mongodb://localhost:27017/${dbName}`;

  const hasDb = /\/[^/?]+(\?|$)/.test(uri); // crude but works for our use
  if (hasDb) return uri;

  const normalized = uri.endsWith("/") ? uri.slice(0, -1) : uri;
  return `${normalized}/${dbName}`;
}

function oid(v) {
  if (v && v._id) v = v._id;
  if (v instanceof mongoose.Types.ObjectId) return v;
  if (typeof v === "string" && mongoose.Types.ObjectId.isValid(v)) {
    return new mongoose.Types.ObjectId(v);
  }
  return new mongoose.Types.ObjectId();
}

function buildSeatLayout36() {
  const layout = [
    ["A1", "A2", null, "A3", "A4"],
    ["B1", "B2", null, "B3", "B4"],
    ["C1", "C2", null, "C3", "C4"],
    ["D1", "D2", null, "D3", "D4"],
    ["E1", "E2", null, "E3", "E4"],
    ["F1", "F2", null, "F3", "F4"],
    ["G1", "G2", null, "G3", "G4"],
    ["H1", "H2", null, "H3", "H4"],
    ["I1", "I2", null, "I3", "I4"],
  ];

  const seats = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      const seatNumber = layout[r][c];
      if (!seatNumber) continue;
      seats.push({
        seatNumber,
        status: "available",
        floor: 1,
        position: { row: r, col: c },
      });
    }
  }
  return { layout, seats };
}

async function upsertBySlug(col, slug, doc) {
  const existing = await col.findOne({ slug });
  if (existing) return existing;
  await col.insertOne(doc);
  return doc;
}

async function ensureLocations(db) {
  const locationsCol = db.collection("locations");
  const now = new Date();

  // GeoJSON: [lng, lat]
  const LOCATIONS = [
    {
      slug: "ben-xe-nuoc-ngam",
      name: "Bến xe Nước Ngầm",
      province: "Hà Nội",
      district: "Hoàng Mai",
      fullAddress: "Bến xe Nước Ngầm, Hoàng Mai, Hà Nội",
      address: "Bến xe Nước Ngầm, Hoàng Mai, Hà Nội",
      location: { type: "Point", coordinates: [105.842, 20.982] },
      type: "bus_station",
      popular: true,
      routes: 120,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "ben-xe-mien-djong-moi",
      name: "Bến xe Miền Đông Mới",
      province: "Hồ Chí Minh",
      district: "TP Thủ Đức",
      fullAddress: "Bến xe Miền Đông Mới, TP Thủ Đức, Hồ Chí Minh",
      address: "Bến xe Miền Đông Mới, TP Thủ Đức, Hồ Chí Minh",
      location: { type: "Point", coordinates: [106.796, 10.879] },
      type: "bus_station",
      popular: true,
      routes: 180,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "ben-xe-trung-tam-dja-nang",
      name: "Bến xe Trung tâm Đà Nẵng",
      province: "Đà Nẵng",
      district: "Cẩm Lệ",
      fullAddress: "Bến xe Trung tâm Đà Nẵng, Cẩm Lệ, Đà Nẵng",
      address: "Bến xe Trung tâm Đà Nẵng, Cẩm Lệ, Đà Nẵng",
      location: { type: "Point", coordinates: [108.177, 16.033] },
      type: "bus_station",
      popular: true,
      routes: 90,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "ben-xe-thuong-ly",
      name: "Bến xe Thượng Lý",
      province: "Hải Phòng",
      district: "Hồng Bàng",
      fullAddress: "Bến xe Thượng Lý, Hồng Bàng, Hải Phòng",
      address: "Bến xe Thượng Lý, Hồng Bàng, Hải Phòng",
      location: { type: "Point", coordinates: [106.674, 20.854] },
      type: "bus_station",
      popular: false,
      routes: 40,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "ben-xe-trung-tam-can-tho",
      name: "Bến xe Trung tâm Cần Thơ",
      province: "Cần Thơ",
      district: "Ninh Kiều",
      fullAddress: "Bến xe Trung tâm Cần Thơ, Ninh Kiều, Cần Thơ",
      address: "Bến xe Trung tâm Cần Thơ, Ninh Kiều, Cần Thơ",
      location: { type: "Point", coordinates: [105.782, 10.047] },
      type: "bus_station",
      popular: false,
      routes: 55,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const inserted = [];
  for (const loc of LOCATIONS) {
    const _id = new mongoose.Types.ObjectId();
    const doc = { _id, ...loc };
    const saved = await upsertBySlug(locationsCol, loc.slug, doc);
    inserted.push(saved);
  }

  console.log("✅ Locations ready:", inserted.map((x) => ({ slug: x.slug, id: String(x._id) })));
  return inserted;
}

async function ensureCompanyAndVehicle(db) {
  const companiesCol = db.collection("companies");
  const vehiclesCol = db.collection("vehicles");
  const now = new Date();

  let company = await companiesCol.findOne({ code: "DEMO" });
  if (!company) {
    company = {
      _id: new mongoose.Types.ObjectId(),
      name: "Demo Bus Company",
      code: "DEMO",
      address: "Seed address",
      phone: "0900000000",
      email: "demo-company@example.com",
      description: "Seed company for local development",
      logoUrl: "",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    await companiesCol.insertOne(company);
    console.log("✅ Inserted company DEMO");
  } else {
    console.log("ℹ️ Company DEMO already exists");
  }

  let vehicle = await vehiclesCol.findOne({
    companyId: oid(company._id),
    vehicleNumber: "SEED-0001",
  });

  if (!vehicle) {
    const { layout } = buildSeatLayout36();
    vehicle = {
      _id: new mongoose.Types.ObjectId(),
      companyId: oid(company._id),
      vehicleNumber: "SEED-0001",
      type: "coach",
      status: "active",
      floors: 1,
      seatColumns: 5,
      seatRows: 9,
      aislePositions: [2],
      totalSeats: 36,
      seatMap: { layout },
      amenities: ["wifi", "water", "charging"],
      createdAt: now,
      updatedAt: now,
    };
    await vehiclesCol.insertOne(vehicle);
    console.log("✅ Inserted vehicle SEED-0001");
  } else {
    console.log("ℹ️ Vehicle SEED-0001 already exists");
  }

  return { company, vehicle };
}

async function seedTrips(db, locations, company, vehicle) {
  const tripsCol = db.collection("trips");

  const locBySlug = new Map(locations.map((l) => [l.slug, l]));
  const now = new Date();

  const days = Math.max(1, parseInt(process.env.SEED_DAYS || "30", 10));
  const startDateStr = process.env.SEED_START_DATE || dayjs().tz(TZ).format("YYYY-MM-DD");
  const timesStr = process.env.SEED_TIMES || "07:00,09:30,13:00,20:00";
  const times = String(timesStr)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const ROUTES = [
    { key: "HN_HCM", fromSlug: "ben-xe-nuoc-ngam", toSlug: "ben-xe-mien-djong-moi", durationHours: 34, price: 450000 },
    { key: "HN_DN",  fromSlug: "ben-xe-nuoc-ngam", toSlug: "ben-xe-trung-tam-dja-nang", durationHours: 16, price: 320000 },
    { key: "DN_HCM", fromSlug: "ben-xe-trung-tam-dja-nang", toSlug: "ben-xe-mien-djong-moi", durationHours: 18, price: 360000 },
    { key: "HP_HN",  fromSlug: "ben-xe-thuong-ly", toSlug: "ben-xe-nuoc-ngam", durationHours: 3,  price: 160000 },
    { key: "HCM_CT", fromSlug: "ben-xe-mien-djong-moi", toSlug: "ben-xe-trung-tam-can-tho", durationHours: 4,  price: 180000 },
  ];

  const { seats } = buildSeatLayout36();

  console.log("🧪 seed config:", { startDateStr, days, times, db: db.databaseName });

  let created = 0;
  let skipped = 0;

  for (const route of ROUTES) {
    const fromLoc = locBySlug.get(route.fromSlug);
    const toLoc = locBySlug.get(route.toSlug);

    if (!fromLoc || !toLoc) {
      console.warn("⚠️ Missing location for route", route);
      continue;
    }

    for (let d = 0; d < days; d++) {
      const date = dayjs.tz(startDateStr, TZ).add(d, "day");
      for (const t of times) {
        const [hh, mm] = t.split(":").map((x) => parseInt(x, 10));
        if (Number.isNaN(hh) || Number.isNaN(mm)) continue;

        const departureTime = date.hour(hh).minute(mm).second(0).millisecond(0).toDate();
        const expectedArrivalTime = dayjs(departureTime).add(route.durationHours, "hour").toDate();

        const exists = await tripsCol.findOne({
          "route.fromLocationId": oid(fromLoc._id),
          "route.toLocationId": oid(toLoc._id),
          departureTime,
          isRecurrenceTemplate: false,
        });

        if (exists) {
          skipped++;
          continue;
        }

        await tripsCol.insertOne({
          _id: new mongoose.Types.ObjectId(),
          companyId: oid(company._id),
          vehicleId: oid(vehicle._id),
          route: {
            fromLocationId: oid(fromLoc._id),
            toLocationId: oid(toLoc._id),
            stops: [],
            duration: route.durationHours * 60,
          },
          departureTime,
          expectedArrivalTime,
          price: route.price,
          status: "scheduled",
          seats: seats.map((s) => ({ ...s, bookingId: undefined })),
          availableSeatsCount: seats.length,
          isRecurrenceTemplate: false,
          isRecurrenceActive: false,
          recurrenceParentId: undefined,
          driverId: undefined,
          createdAt: now,
          updatedAt: now,
        });

        created++;
      }
    }

    console.log(`✅ Seeded route ${route.key}: ${route.fromSlug} -> ${route.toSlug}`);
  }

  console.log("🎉 Done seed", { created, skipped });
}

async function main() {
  loadEnvCandidates();

  const mongoBase =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017";

  const dbName = process.env.DB_NAME || "bus_ticket_db";
  const mongoUri = withDbName(mongoBase, dbName);

  console.log("🔌 Connecting:", { mongoUri });

  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;

  const locations = await ensureLocations(db);
  const { company, vehicle } = await ensureCompanyAndVehicle(db);
  await seedTrips(db, locations, company, vehicle);

  console.log("📦 DB snapshot:", {
    companies: await db.collection("companies").countDocuments(),
    vehicles: await db.collection("vehicles").countDocuments(),
    locations: await db.collection("locations").countDocuments(),
    trips: await db.collection("trips").countDocuments(),
  });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("❌ seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
