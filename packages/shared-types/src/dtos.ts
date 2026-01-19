import { UserRole } from "./enums";

// --- Auth Object Definitions ---
export interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: UserRole[];
  companyId?: string;
}

export interface AuthenticatedUser {
  userId: string;
  _id: string; // Giữ cả 2 để tương thích backward hoặc frontend cũ
  email: string;
  name: string;
  roles: UserRole[];
  companyId?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

// --- Request Payloads ---

export interface LoginPayload {
  identifier: string; // Email hoặc Phone
  password: string;
}

export interface RegisterPayload {
  email: string;
  phone: string;
  password: string;
  name: string;
}

export interface ActivateAccountPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResendVerificationPayload {
  email: string;
}
