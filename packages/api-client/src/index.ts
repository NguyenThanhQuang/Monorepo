// Export Core HTTP Client (Nếu muốn dùng thủ công)
export * from "./core/http-client";

// Export Type Definition của Error để catch lỗi
export type { ApiErrorResponse } from "@obtp/shared-types";

// Import các modules
import { authApi } from "./modules/auth.api";
import { bookingsApi } from "./modules/bookings.api";
import { companiesApi } from "./modules/companies.api";
import { dashboardApi } from "./modules/dashboard.api";
import { locationsApi } from "./modules/locations.api";
import { mapsApi } from "./modules/maps.api";
import { paymentsApi } from "./modules/payments.api";
import { reviewsApi } from "./modules/reviews.api";
import { tripsApi } from "./modules/trips.api";
import { usersApi } from "./modules/users.api";
import { vehiclesApi } from "./modules/vehicles.api";

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
