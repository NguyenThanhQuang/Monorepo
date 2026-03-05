# Seeding (local dev)

Script: `scripts/seed.js`

## What it seeds
- Locations (with slugs used by the mobile app + /trips/search)
- 1 demo company + 1 demo vehicle
- Trips for 5 common routes for the next N days

## Run
```bash
# start MongoDB first
# then:
cd api
npm run seed
```

## Optional env overrides
- `DB_NAME` (default: `bus_ticket_db`)
- `MONGODB_URI` (default: `mongodb://localhost:27017`)
- `SEED_START_DATE` (YYYY-MM-DD, default: today)
- `SEED_DAYS` (default: 30)
- `SEED_TIMES` (comma separated, default: `07:00,09:30,13:00,20:00`)
