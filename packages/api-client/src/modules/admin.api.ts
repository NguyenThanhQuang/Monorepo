import type {
  AdminDashboardStats,
  CompanyRevenueStats,
  FinanceReportQuery,
  FinancialReportResponse,
  RecentActivity,
  RevenueChartData,
  RevenueFilterParams,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await http.get<AdminDashboardStats | any>(
      "/dashboard/stats",
    );
    return response?.data || response;
  },

  getRevenueStats: async (
    params?: RevenueFilterParams,
  ): Promise<CompanyRevenueStats[]> => {
    const financeParams = transformRevenueParams(params);
    const response = await http.get<FinancialReportResponse | any>(
      "/dashboard/finance-report",
      { params: financeParams },
    );
    const reportData: FinancialReportResponse = response?.data || response;

    if (!reportData?.topCompanies) return[];

    return reportData.topCompanies.map((company, index) => ({
      companyId: `company-${index}`,
      companyName: company.name,
      companyCode: company.name.substring(0, 3).toUpperCase(),
      totalRevenue: company.revenue,
      totalBookings: company.bookings,
      totalTrips: Math.round(company.bookings / 10),
      averageRating: 4.5,
      revenueGrowth: 0,
      monthlyData: (reportData.revenueChartData ||[]).map((item) => ({
        month: item.date,
        revenue: item.revenue,
        bookings: item.bookings,
      })),
    }));
  },

  getCompanyRevenueDetail: async (
    companyId: string,
    params?: RevenueFilterParams,
  ): Promise<CompanyRevenueStats | null> => {
    const financeParams = { ...transformRevenueParams(params), companyId };
    const response = await http.get<FinancialReportResponse | any>(
      "/dashboard/finance-report",
      { params: financeParams },
    );
    const reportData: FinancialReportResponse = response?.data || response;

    const companyData = reportData.topCompanies?.[0];
    if (!companyData) return null;

    return {
      companyId,
      companyName: companyData.name,
      companyCode: companyData.name.substring(0, 3).toUpperCase(),
      totalRevenue: companyData.revenue,
      totalBookings: companyData.bookings,
      totalTrips: Math.round(companyData.bookings / 10),
      averageRating: 4.5,
      revenueGrowth: 0,
      monthlyData: (reportData.revenueChartData ||[]).map((item) => ({
        month: item.date,
        revenue: item.revenue,
        bookings: item.bookings,
      })),
    };
  },

  getMonthlyRevenueChart: async (
    year?: number,
  ): Promise<RevenueChartData[]> => {
    const params: FinanceReportQuery = year
      ? { startDate: `${year}-01-01`, endDate: `${year}-12-31` }
      : { period: "12m" };

    const response = await http.get<FinancialReportResponse | any>(
      "/dashboard/finance-report",
      { params },
    );
    const reportData: FinancialReportResponse = response?.data || response;
    return reportData.revenueChartData ||[];
  },

  exportRevenueReport: async (params?: RevenueFilterParams): Promise<Blob> => {
    return http.get<Blob>("/dashboard/finance-report", {
      params: transformRevenueParams(params),
      responseType: "blob",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  },

  getRecentActivities: async (): Promise<RecentActivity[]> =>[],
};

function transformRevenueParams(
  params?: RevenueFilterParams,
): FinanceReportQuery {
  const financeParams: FinanceReportQuery = {};
  
  // FIX: Nếu không có cả fromDate và toDate, gửi period = 'all'
  if (!params?.fromDate && !params?.toDate && !params?.month && !params?.year) {
    financeParams.period = "all" as any; 
  } else {
    if (params?.month && params?.year) {
      financeParams.startDate = new Date(params.year, params.month - 1, 1)
        .toISOString()
        .split("T")[0];
      financeParams.endDate = new Date(params.year, params.month, 0)
        .toISOString()
        .split("T")[0];
    }
    if (params?.fromDate && params?.toDate) {
      financeParams.startDate = params.fromDate;
      financeParams.endDate = params.toDate;
    }
  }
  
  if (params?.companyId) financeParams.companyId = params.companyId;
  return financeParams;
}