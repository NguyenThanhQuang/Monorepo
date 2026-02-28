import { apiFetch } from "@/lib/http";

export type FinanceReportQuery = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  period?: string;    // e.g. 30d
  companyId?: string;
};

export type TopCompany = {
  name: string;
  revenue: number;
  bookings: number;
};

export type FinancialReportResponse = {
  overview: {
    totalRevenue: number;
    periodRevenue: number;
    totalBookings: number;
    averageOrderValue: number;
    commission: number;
    refunds: number;
  };
  revenueChartData: Array<{ date: string; revenue: number; bookings: number }>;
  topCompanies: TopCompany[];
  recentTransactions: Array<{
    id: string;
    date: string;
    companyName: string;
    type: string;
    description: string;
    amount: number;
  }>;
};

export function getFinanceReport(query: FinanceReportQuery) {
  const params = new URLSearchParams();
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (query.period) params.set("period", query.period);
  if (query.companyId) params.set("companyId", query.companyId);

  const qs = params.toString();
  return apiFetch<FinancialReportResponse>(`/dashboard/finance-report${qs ? `?${qs}` : ""}`);
}
