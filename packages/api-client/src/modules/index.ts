// Export Core HTTP Client (Nếu muốn dùng thủ công)
export * from "../core/http-client";

// Export Type Definition của Error để catch lỗi
export type { ApiErrorResponse } from "@obtp/shared-types";

// Import các modules
import { authApi } from "./auth.api";
import { bookingsApi } from "./bookings.api";
import { companiesApi } from "./companies.api";
import { dashboardApi } from "./dashboard.api";
import { locationsApi } from "./locations.api";
import { mapsApi } from "./maps.api";
import { paymentsApi } from "./payments.api";
import { reviewsApi } from "./reviews.api";
import { tripsApi } from "./trips.api";
import { usersApi } from "./users.api";
import { vehiclesApi } from "./vehicles.api";

// Export dạng Single Namespace 'api'
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
};

// Hoặc export lẻ từng cái nếu thích tree-shaking (Optional)
export {
  authApi,
  bookingsApi,
  companiesApi,
  dashboardApi,
  locationsApi,
  mapsApi,
  paymentsApi,
  reviewsApi,
  tripsApi,
  usersApi,
  vehiclesApi,
};
