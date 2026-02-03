// src/api/users.api.ts
import type {
  AdminUserListItem,
  SanitizedUserResponse,
 
} from "@obtp/shared-types";
import api from "../../api";

export const usersApi = {
  getAllForAdmin(): Promise<SanitizedUserResponse[]> {
    return api.get("/users/admin/all").then(res => res.data);
  },

  

};
export const UsersApi = {
  getAllForAdmin(): Promise<AdminUserListItem[]> {
    return api.get('/users/admin/all').then(res => res.data);
  },

  updateStatus(userId: string, isBanned: boolean) {
    return api.patch(`/users/admin/${userId}/status`, { isBanned });
  }


  
};