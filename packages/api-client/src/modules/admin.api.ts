// api-client/modules/admin.api.ts
import { http } from "../core/http-client";

export interface CompanyRevenueStats {
  companyId: string;
  companyName: string;
  companyCode: string;
  logoUrl?: string;
  totalRevenue: number;
  totalBookings: number;
  totalTrips: number;
  averageRating: number;
  revenueGrowth: number;
  monthlyData?: {
    month: string;
    revenue: number;
    bookings: number;
  }[];
}

export interface RevenueFilterParams {
  month?: number;
  year?: number;
  companyId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalCompanies: number;
  totalVehicles: number;
  totalUsers: number;
  totalTrips: number;
  revenueGrowth: number;
  bookingGrowth: number;
  userGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'company' | 'user';
  description: string;
  amount?: number;
  time: string;
  createdAt: string;
}

export const adminApi = {
  // Dashboard stats
  getDashboardStats: (): Promise<DashboardStats> => {
    return http.get<DashboardStats>("/admin/dashboard/stats").then(response => response);
  },

  // Recent activities
  getRecentActivities: (limit?: number): Promise<RecentActivity[]> => {
    return http.get<RecentActivity[]>("/admin/dashboard/activities", {
      params: { limit }
    }).then(response => response);
  },

  // Revenue stats for all companies
  getRevenueStats: (params?: RevenueFilterParams): Promise<CompanyRevenueStats[]> => {
    return http.get<CompanyRevenueStats[]>("/admin/revenue/companies", { params })
      .then(response => response);
  },

  // Get revenue detail for a specific company
  getCompanyRevenueDetail: (companyId: string, params?: RevenueFilterParams): Promise<CompanyRevenueStats> => {
    return http.get<CompanyRevenueStats>(`/admin/revenue/companies/${companyId}`, { params })
      .then(response => response);
  },

  // Export revenue report
  exportRevenueReport: async (params?: RevenueFilterParams): Promise<Blob> => {
    const response = await http.get<Blob>("/admin/revenue/export", {
      params,
      responseType: 'blob'
    } as any);
    return response;
  },

  // Get monthly revenue chart data
  getMonthlyRevenueChart: (year?: number): Promise<{ month: string; revenue: number; companies: number }[]> => {
    return http.get<{ month: string; revenue: number; companies: number }[]>("/admin/revenue/chart", {
      params: { year }
    }).then(response => response);
  }
};