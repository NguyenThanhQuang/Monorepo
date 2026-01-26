// src/api/admin.api.ts
import type { SystemDashboardStats } from "../../../features/system-dashboard/types";
import api from "../../api";

export const adminApi = {
  getDashboardStats(): Promise<SystemDashboardStats> {
    return api.get("/admin/dashboard/stats").then(res => res.data);
  },

  getCompanies(): Promise<any[]> {
    return api.get("/companies").then(res => res.data);
  },
};
