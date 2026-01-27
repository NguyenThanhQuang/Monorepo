import {
  AdminDashboardStats,
  FinanceReportQuery,
  FinancialReportResponse,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const dashboardApi = {
  getStats: () => {
    return http.get<AdminDashboardStats>("/dashboard/stats");
  },

  getFinancialReport: (query: FinanceReportQuery) => {
    return http.get<FinancialReportResponse>("/dashboard/finance-report", {
      params: query,
    });
  },
};
