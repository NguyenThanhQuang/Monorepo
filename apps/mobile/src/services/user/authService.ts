import { API_ENDPOINTS } from "../common/configService";
import apiService from "../common/apiService";

export interface LoginCredentials {
  identifier: string; // ✅ email hoặc phone
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  private unwrap(resData: any) {
    return resData?.data ?? resData;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        identifier: credentials.identifier,
        password: credentials.password,
      },
    );
    return this.unwrap(response.data) as AuthResponse;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data,
      );
      return this.unwrap(response.data) as AuthResponse;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const response = await apiService.post<{ accessToken: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        {
          refreshToken,
        },
      );
      return this.unwrap(response.data) as { accessToken: string };
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
      // Don't throw error on logout failure
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>(
        API_ENDPOINTS.USER.PROFILE,
      );
      return this.unwrap(response.data) as UserProfile;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiService.patch<UserProfile>(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        profileData,
      );
      return this.unwrap(response.data) as UserProfile;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await apiService.put(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // Backend: GET /auth/verify-email-api?token=...
      await apiService.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        params: { token },
      });
    } catch (error) {
      console.error("Verify email error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
