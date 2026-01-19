import { LocationType, UserRole } from "./enums";
import { GeoJsonPoint } from "./models";

// --- AUTH INFRASTRUCTURE ---
export interface JwtPayload {
  sub: string; // UserId
  email: string;
  roles: UserRole[];
  companyId?: string;
}

// Interface đại diện User sau khi Login/GetProfile (Sanitized)
export interface AuthUserResponse {
  id: string; // Chuyển đổi từ _id
  email: string;
  name: string;
  phone: string;
  roles: UserRole[];
  companyId?: string;
  isEmailVerified: boolean;
  lastLoginDate?: Date;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserResponse;
}

// --- AUTH REQUEST PAYLOADS ---

export interface RegisterPayload {
  email: string;
  phone: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  identifier: string; // Email or Phone
  password: string;
}

export interface ResendVerificationEmailPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ActivateAccountPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Response cho các API xác thực token (Reset pass, verify email...)
export interface TokenValidationResponse {
  isValid: boolean;
  message?: string;
  email?: string; // cho reset pass
  userName?: string; // cho activate account
  companyName?: string; // cho activate account
}

// --- LOCATIONS ---

export interface CreateLocationPayload {
  name: string;
  province: string;
  district?: string;
  fullAddress: string;
  location: GeoJsonPoint;
  type: LocationType;
  images?: string[];
  isActive?: boolean;
}

export interface UpdateLocationPayload extends Partial<CreateLocationPayload> {}

export interface LocationResponse extends Location {}

export interface SearchLocationQuery {
  keyword?: string; // Search theo name hoặc province
  type?: LocationType;
  province?: string;
}

export interface PopularLocationsQuery {
  limit?: number;
}
