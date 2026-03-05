// src/api/companies.api.ts
import {
  CompanyResponse,
  CompanyStatsResponse,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const companiesApi = {
  // Lấy danh sách nhà xe kèm thống kê
  getAllWithStats: () => {
    return http.get<CompanyStatsResponse[]>("/companies").then(response => response);
  },

  // Lấy chi tiết 1 nhà xe (theo ID)
  getOne: (id: string) => {
    return http.get<CompanyResponse>(`/companies/${id}`).then(response => response);
  },

  // Dành cho Company Admin (Lấy thông tin công ty mình đang quản lý)
  getMyCompany: () => {
    return http.get<CompanyResponse>("/companies/my-company").then(response => response);
  },

  // --- ADMIN ONLY ---
  create: (payload: CreateCompanyPayload) => {
    return http.post<CompanyResponse>("/companies", payload).then(response => response);
  },

  update: (id: string, payload: UpdateCompanyPayload) => {
    return http.patch<CompanyResponse>(`/companies/${id}`, payload).then(response => response);
  },

  delete: (id: string) => {
    return http.delete<{ message: string }>(`/companies/${id}`).then(response => response);
  },
};