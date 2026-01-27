import {
  ChangePasswordPayload,
  SanitizedUserResponse,
  UpdateUserPayload,
  UpdateUserStatusPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const usersApi = {
  // Lấy thông tin bản thân (kèm role, companyId)
  getMe: () => {
    return http.get<SanitizedUserResponse>("/users/me");
  },

  // Cập nhật thông tin bản thân
  updateMe: (payload: UpdateUserPayload) => {
    return http.patch<SanitizedUserResponse>("/users/me", payload);
  },

  changePassword: (payload: ChangePasswordPayload) => {
    return http.patch<{ message: string }>(
      "/users/me/change-password",
      payload,
    );
  },

  // --- ADMIN ONLY ---

  getAllUsers: () => {
    return http.get<SanitizedUserResponse[]>("/users/admin/all");
  },

  updateStatus: (userId: string, payload: UpdateUserStatusPayload) => {
    return http.patch<SanitizedUserResponse>(
      `/users/admin/${userId}/status`,
      payload,
    );
  },
};
