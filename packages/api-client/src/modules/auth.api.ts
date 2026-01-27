import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResendVerificationEmailPayload,
  ResetPasswordPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const authApi = {
  login: (payload: LoginPayload) => {
    return http.post<LoginResponse>("/auth/login", payload);
  },

  register: (payload: RegisterPayload) => {
    return http.post<{ message: string }>("/auth/register", payload);
  },

  // GET /verify-email thực tế là link redirect từ email,
  // nhưng nếu FE cần gọi tay để kiểm tra token
  verifyEmail: (token: string) => {
    return http.get<LoginResponse>(`/auth/verify-email?token=${token}`);
  },

  resendVerificationEmail: (payload: ResendVerificationEmailPayload) => {
    return http.post<{ message: string }>(
      "/auth/resend-verification-email",
      payload,
    );
  },

  forgotPassword: (payload: ForgotPasswordPayload) => {
    return http.post<{ message: string }>("/auth/forgot-password", payload);
  },

  resetPassword: (payload: ResetPasswordPayload) => {
    return http.post<{ message: string }>("/auth/reset-password", payload);
  },
};
