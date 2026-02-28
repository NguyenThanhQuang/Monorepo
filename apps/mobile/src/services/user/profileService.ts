import { API_ENDPOINTS } from "../common/configService";
import apiService from "../common/apiService";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  avatar?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  async updateProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    try {
      // FE uses PATCH /users/me
      const response = await apiService.patch<UserProfile>(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    try {
      // ✅ Backend expects PATCH /users/me/change-password
      await apiService.patch(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // NOTE: For React Native, file upload usually uses `FormData` with `uri`, `name`, `type`.
  // This method is kept for compatibility; you may want to refactor it later.
  async uploadAvatar(file: any): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiService.post<{ avatarUrl: string }>(
        API_ENDPOINTS.USER.UPLOAD_AVATAR,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  }

  async deleteAvatar(): Promise<void> {
    try {
      await apiService.delete(API_ENDPOINTS.USER.UPLOAD_AVATAR);
    } catch (error) {
      console.error("Delete avatar error:", error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
