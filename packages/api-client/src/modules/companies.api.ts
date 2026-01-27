import {
  CompanyResponse,
  CompanyStatsResponse,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const companiesApi = {
  // Public hoặc Admin list đơn giản
  // Lưu ý: Controller admin getAll là findStats
  getAllWithStats: () => {
    return http.get<CompanyStatsResponse[]>("/companies");
  },

  // Lấy chi tiết 1 nhà xe (theo ID hoặc CompanyAdmin xem chính mình)
  getOne: (id: string) => {
    return http.get<CompanyResponse>(`/companies/${id}`);
  },

  // Dành cho Company Admin (Lấy thông tin công ty mình đang quản lý)
  getMyCompany: () => {
    return http.get<CompanyResponse>("/companies/my-company");
  },

  // --- ADMIN ONLY ---

  create: (payload: CreateCompanyPayload) => {
    return http.post<CompanyResponse>("/companies", payload);
  },

  update: (id: string, payload: UpdateCompanyPayload) => {
    return http.patch<CompanyResponse>(`/companies/${id}`, payload);
  },

  delete: (id: string) => {
    return http.delete<{ message: string }>(`/companies/${id}`);
  },
};
