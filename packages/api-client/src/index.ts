import { adminApi } from "./modules/admin.api";
import { authApi } from "./modules/auth.api";
import { bookingsApi } from "./modules/bookings.api";
import { companiesApi } from "./modules/companies.api";
import { dashboardApi } from "./modules/dashboard.api";
import { locationsApi } from "./modules/locations.api";
import { mapsApi } from "./modules/maps.api";
import { paymentsApi } from "./modules/payments.api";
import { revenueApi } from "./modules/revenueApi";
import { reviewsApi } from "./modules/reviews.api";
import { tripsApi } from "./modules/trips.api";
import { uploadApi } from "./modules/upload.api";
import { usersApi } from "./modules/users.api";
import { vehiclesApi } from "./modules/vehicles.api";

export type {
  CompanyRevenueStats,
  DashboardStats,
  RecentActivity,
  RevenueFilterParams,
} from "./modules/admin.api";

export type { ApiErrorResponse } from "@obtp/shared-types";

export const api = {
  auth: authApi,
  users: usersApi,
  companies: companiesApi,
  locations: locationsApi,
  vehicles: vehiclesApi,
  trips: tripsApi,
  bookings: bookingsApi,
  payments: paymentsApi,
  reviews: reviewsApi,
  dashboard: dashboardApi,
  maps: mapsApi,
  revenueApi: revenueApi,
  admin: adminApi,
  upload: uploadApi,
};

export {
  adminApi,
  authApi,
  bookingsApi,
  companiesApi,
  dashboardApi,
  locationsApi,
  mapsApi,
  paymentsApi,
  revenueApi,
  reviewsApi,
  tripsApi,
  usersApi,
  vehiclesApi,
};

export * from "../src/core/http-client";
