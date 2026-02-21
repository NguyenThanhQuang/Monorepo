import { http } from "../core/http-client";

export interface SystemDashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
}

export const adminApi = {
  // Dashboard stats cho admin
  getDashboardStats: (): Promise<SystemDashboardStats> => {
    return http.get<SystemDashboardStats>("/admin/dashboard/stats");
  },

  // Lấy danh sách companies (đã có trong companiesApi, nhưng thêm cho đầy đủ)
  getCompanies: (): Promise<any[]> => {
    return http.get<any[]>("/companies");
  },
};