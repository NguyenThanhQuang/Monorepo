import { http } from "@/core/http-client";

export interface RevenueStats {
  companyName: string;
  totalRevenue: number;
  totalBookings: number;
}

export const revenueApi = {
  getRevenue: (month?: number) =>
    http.get<RevenueStats[]>(`/companies/stats/revenue`, {
      params: { month },
    }),
};
