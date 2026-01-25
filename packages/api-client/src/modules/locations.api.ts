import {
  CreateLocationPayload,
  LocationResponse,
  SearchLocationQuery,
  UpdateLocationPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const locationsApi = {
  // Lấy địa điểm phổ biến
  getPopular: () => {
    return http.get<LocationResponse[]>("/locations/popular");
  },

  // Tìm kiếm theo từ khóa (Dùng cho autocomplete)
  search: (keyword: string) => {
    return http.get<LocationResponse[]>("/locations/search", {
      params: { q: keyword },
    });
  },

  // Lấy danh sách (Có filter province, type)
  findAll: (query?: SearchLocationQuery) => {
    return http.get<LocationResponse[]>("/locations", { params: query });
  },

  getOne: (id: string) => {
    return http.get<LocationResponse>(`/locations/${id}`);
  },

  // --- ADMIN ONLY ---

  create: (payload: CreateLocationPayload) => {
    return http.post<LocationResponse>("/locations", payload);
  },

  update: (id: string, payload: UpdateLocationPayload) => {
    return http.patch<LocationResponse>(`/locations/${id}`, payload);
  },

  delete: (id: string) => {
    return http.delete<void>(`/locations/${id}`);
  },
};
