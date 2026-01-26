
/**
 * ===============================
 * Company Dashboard Types (UI)
 * ===============================
 * ❗ Chỉ dùng cho frontend
 * ❗ Shape theo API dashboard
 * ❗ Không map 1-1 entity backend
 */

import type { CompanyStatus, TripStatus } from "@obtp/shared-types";

/* ---------- Company Summary ---------- */
export interface CompanyDashboardCompany {
  id: string;
  name: string;
  code: string;
  status: CompanyStatus;

  stats: {
    totalTrips: number;
    totalVehicles: number;
    totalBookings: number;
    totalRevenue: number;
  };
}

/* ---------- Vehicle Card ---------- */
export interface CompanyDashboardVehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  totalSeats: number;
  activeTrips: number;
}

/* ---------- Trip Table ---------- */
export interface CompanyDashboardTrip {
  id: string;

  routeName: string;        // "TP.HCM → Đà Lạt"
  departureTime: string;    // ISO string
  vehicleNumber: string;

  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;

  status: TripStatus;
}

/* ---------- Revenue Chart ---------- */
export interface CompanyDashboardRevenuePoint {
  date: string;   // yyyy-mm-dd
  revenue: number;
  bookings: number;
}

/* ---------- API Response ---------- */
export interface CompanyDashboardResponse {
  company: CompanyDashboardCompany;

  vehicles: CompanyDashboardVehicle[];

  upcomingTrips: CompanyDashboardTrip[];

  revenueChart: CompanyDashboardRevenuePoint[];
}
