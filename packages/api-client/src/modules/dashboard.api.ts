import {
  AdminDashboardStats,
  FinanceReportQuery,
  FinancialReportResponse,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

// Types cho company dashboard
export interface DashboardStatsResponse {
  totalTrips: number;
  activeVehicles: number;
  todayPassengers: number;
  revenue: number;
}

export interface DashboardTripResponse {
  id: string;
  routeName: string;
  departureDate: string;
  departureTime: string;
  vehicleNumber: string;
  bookedSeats: number;
  totalSeats: number;
  status: 'running' | 'aboutToDepart' | 'completed' | 'cancelled';
}

export const dashboardApi = {
  // Admin dashboard stats
  getStats: () => {
    return http.get<AdminDashboardStats>("/dashboard/stats");
  },

  // System dashboard stats (admin)
  getSystemStats: () => {
    return http.get<any>("/admin/dashboard/stats");
  },

  // Company dashboard stats
  getCompanyStats: (): Promise<DashboardStatsResponse> => {
    return http.get<DashboardStatsResponse>("/admin/dashboard/stats");
  },

  // Company dashboard trips
  getCompanyTrips: (): Promise<DashboardTripResponse[]> => {
    return http.get<DashboardTripResponse[]>("/admin/dashboard/trips");
  },

  getFinancialReport: (query: FinanceReportQuery) => {
    return http.get<FinancialReportResponse>("/dashboard/finance-report", {
      params: query,
    });
  },
};