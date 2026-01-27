import {
  CreateTripPayload,
  SearchTripQuery,
  Trip,
  UpdateTripPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const tripsApi = {
  // PUBLIC: Tìm chuyến đi (quan trọng cho người dùng cuối)
  searchPublic: (query: SearchTripQuery) => {
    return http.get<Trip[]>("/trips", { params: query });
  },

  getDetail: (id: string) => {
    return http.get<Trip>(`/trips/${id}`);
  },

  // MANAGEMENT (Admin & Company Admin)
  // Query param `companyId` optional cho Super Admin lọc
  getAllManagement: (companyId?: string) => {
    return http.get<Trip[]>("/trips/management/all", {
      params: { companyId },
    });
  },

  create: (payload: CreateTripPayload) => {
    return http.post<Trip>("/trips", payload);
  },

  // Không có Update Full, thường là cancel hoặc update specific fields
  cancel: (id: string) => {
    return http.patch<Trip>(`/trips/${id}/cancel`);
  },

  update: (id: string, payload: UpdateTripPayload) => {
    // Lưu ý: Cần thêm method update trong Controller backend nếu chưa export route này.
    // Ở file trips.controller.ts bạn gửi có ghi comment "4. UPDATE TRIP ... logic similar", giả sử route là PATCH /:id
    return http.patch<Trip>(`/trips/${id}`, payload);
  },
};
