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
    month: string;      // Tháng (VD: "2024-01")
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

// API response wrapper interface
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Interface cho dashboard stats từ backend
export interface AdminDashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  newCompaniesToday: number;
  todayBookings: number;
}

// Interface cho finance report từ backend
export interface FinanceReportQuery {
  period?: '7d' | '30d' | '90d' | '12m';
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

// Interface đúng với dữ liệu từ backend
export interface RevenueChartData {
  date: string;        // Backend trả về "date"
  revenue: number;
  bookings: number;
}

export interface TopCompanyData {
  name: string;
  revenue: number;
  bookings: number;
}

export interface RecentTransactionData {
  id: string;
  date: string;
  companyName: string;
  type: 'booking' | 'refund' | 'commission';
  description: string;
  amount: number;
}

export interface FinancialReportResponse {
  overview: {
    totalRevenue: number;
    periodRevenue: number;
    totalBookings: number;
    averageOrderValue: number;
    commission: number;
    refunds: number;
  };
  revenueChartData: RevenueChartData[];  // Dùng interface đúng
  topCompanies: TopCompanyData[];
  recentTransactions: RecentTransactionData[];
}

export const adminApi = {
  // Dashboard stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    try {
      const response = await http.get<AdminDashboardStats | ApiResponse<AdminDashboardStats>>("/dashboard/stats");
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object') {
          return response.data as AdminDashboardStats;
        }
        return response as AdminDashboardStats;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('API Error - getDashboardStats:', error);
      throw error;
    }
  },

  // Recent activities - API không có, trả về mảng rỗng
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    console.warn('getRecentActivities API is not implemented in backend');
    return [];
  },

  // Revenue stats từ finance report
  getRevenueStats: async (params?: RevenueFilterParams): Promise<CompanyRevenueStats[]> => {
    try {
      const financeParams: FinanceReportQuery = {};
      
      if (params?.month && params?.year) {
        const startDate = new Date(params.year, params.month - 1, 1);
        const endDate = new Date(params.year, params.month, 0);
        
        financeParams.startDate = startDate.toISOString().split('T')[0];
        financeParams.endDate = endDate.toISOString().split('T')[0];
      }
      
      if (params?.fromDate && params?.toDate) {
        financeParams.startDate = params.fromDate;
        financeParams.endDate = params.toDate;
      }
      
      if (params?.companyId) {
        financeParams.companyId = params.companyId;
      }
      
      const response = await http.get<FinancialReportResponse | ApiResponse<FinancialReportResponse>>(
        "/dashboard/finance-report", 
        { params: financeParams }
      );
      
      let reportData: FinancialReportResponse;
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object') {
          reportData = response.data as FinancialReportResponse;
        } else {
          reportData = response as FinancialReportResponse;
        }
      } else {
        return [];
      }
      
      // Chuyển đổi từ topCompanies sang CompanyRevenueStats
      const revenueStats: CompanyRevenueStats[] = reportData.topCompanies.map((company, index) => ({
        companyId: `company-${index}`,
        companyName: company.name,
        companyCode: company.name.substring(0, 3).toUpperCase(),
        logoUrl: undefined,
        totalRevenue: company.revenue,
        totalBookings: company.bookings,
        totalTrips: Math.round(company.bookings / 10),
        averageRating: 4.5,
        revenueGrowth: 0,
        // Chuyển đổi từ revenueChartData (có date) sang monthlyData (có month)
        monthlyData: reportData.revenueChartData.map(item => ({
          month: item.date,  // Chuyển date thành month
          revenue: item.revenue,
          bookings: item.bookings
        }))
      }));
      
      return revenueStats;
    } catch (error) {
      console.error('API Error - getRevenueStats:', error);
      return [];
    }
  },

  // Get revenue detail for a specific company
  getCompanyRevenueDetail: async (companyId: string, params?: RevenueFilterParams): Promise<CompanyRevenueStats | null> => {
    try {
      const financeParams: FinanceReportQuery = { companyId };
      
      if (params?.month && params?.year) {
        const startDate = new Date(params.year, params.month - 1, 1);
        const endDate = new Date(params.year, params.month, 0);
        
        financeParams.startDate = startDate.toISOString().split('T')[0];
        financeParams.endDate = endDate.toISOString().split('T')[0];
      }
      
      const response = await http.get<FinancialReportResponse | ApiResponse<FinancialReportResponse>>(
        "/dashboard/finance-report", 
        { params: financeParams }
      );
      
      let reportData: FinancialReportResponse;
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object') {
          reportData = response.data as FinancialReportResponse;
        } else {
          reportData = response as FinancialReportResponse;
        }
      } else {
        return null;
      }
      
      const companyData = reportData.topCompanies[0]; // Lấy company đầu tiên (vì đã filter)
      
      if (!companyData) return null;
      
      return {
        companyId,
        companyName: companyData.name,
        companyCode: companyData.name.substring(0, 3).toUpperCase(),
        logoUrl: undefined,
        totalRevenue: companyData.revenue,
        totalBookings: companyData.bookings,
        totalTrips: Math.round(companyData.bookings / 10),
        averageRating: 4.5,
        revenueGrowth: 0,
        monthlyData: reportData.revenueChartData.map(item => ({
          month: item.date,  // Chuyển date thành month
          revenue: item.revenue,
          bookings: item.bookings
        }))
      };
    } catch (error) {
      console.error(`API Error - getCompanyRevenueDetail ${companyId}:`, error);
      return null;
    }
  },

  // Export revenue report
  exportRevenueReport: async (params?: RevenueFilterParams): Promise<Blob> => {
    try {
      const financeParams: FinanceReportQuery = {};
      
      if (params?.month && params?.year) {
        const startDate = new Date(params.year, params.month - 1, 1);
        const endDate = new Date(params.year, params.month, 0);
        
        financeParams.startDate = startDate.toISOString().split('T')[0];
        financeParams.endDate = endDate.toISOString().split('T')[0];
      }
      
      const response = await http.get<Blob>("/dashboard/finance-report", {
        params: financeParams,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      } as any);
      
      return response;
    } catch (error) {
      console.error('API Error - exportRevenueReport:', error);
      throw error;
    }
  },

  // Get monthly revenue chart - SỬA ĐÚNG KIỂU TRẢ VỀ
  getMonthlyRevenueChart: async (year?: number): Promise<RevenueChartData[]> => {
    try {
      const params: FinanceReportQuery = {};
      
      if (year) {
        params.startDate = `${year}-01-01`;
        params.endDate = `${year}-12-31`;
      } else {
        params.period = '12m';
      }
      
      const response = await http.get<FinancialReportResponse | ApiResponse<FinancialReportResponse>>(
        "/dashboard/finance-report", 
        { params }
      );
      
      let reportData: FinancialReportResponse;
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object') {
          reportData = response.data as FinancialReportResponse;
        } else {
          reportData = response as FinancialReportResponse;
        }
      } else {
        return [];
      }
      
      return reportData.revenueChartData; // Trả về đúng kiểu RevenueChartData[]
    } catch (error) {
      console.error('API Error - getMonthlyRevenueChart:', error);
      return [];
    }
  },

  // Helper functions
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  formatCompactCurrency: (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return amount.toLocaleString('vi-VN') + 'đ';
  },

  formatNumber: (num: number): string => {
    return num.toLocaleString('vi-VN');
  },

  getCurrentMonthParams: (): RevenueFilterParams => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  },

  // Format date từ API (yyyy-mm-dd) sang tên tháng
  formatMonthFromDate: (dateStr: string): string => {
    const date = new Date(dateStr);
    return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
  },

  // Group chart data theo tháng
  groupChartDataByMonth: (data: RevenueChartData[]): { month: string; revenue: number; bookings: number }[] => {
    const monthMap = new Map<string, { revenue: number; bookings: number }>();
    
    data.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      
      const existing = monthMap.get(monthKey);
      if (existing) {
        existing.revenue += item.revenue;
        existing.bookings += item.bookings;
      } else {
        monthMap.set(monthKey, { 
          revenue: item.revenue, 
          bookings: item.bookings 
        });
      }
    });
    
    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({
        month: key,
        revenue: value.revenue,
        bookings: value.bookings
      }));
  }
};

// Export default
export default adminApi;