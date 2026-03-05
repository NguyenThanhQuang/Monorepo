import { http } from "../core/http-client";
import { ActivateAccountPayload, ForgotPasswordPayload, LoginPayload, LoginResponse, RegisterPayload, ResendVerificationEmailPayload, ResetPasswordPayload } from "@obtp/shared-types";

export const authApi = {
  login: (payload: LoginPayload) => {
    return http.post<LoginResponse>("/auth/login", payload);
  },

  register: (payload: RegisterPayload) => {
    return http.post<{ message: string }>("/auth/register", payload);
  },

  validateActivationToken: (token: string) => {
    return http.get<{
      isValid: boolean;
      userName?: string;
      companyName?: string;
    }>(`/auth/validate-activation-token?token=${token}`);
  },

 activateAccount: (payload: ActivateAccountPayload) => {
  return http.post<LoginResponse>('/auth/activate-account', payload);
},

  verifyEmail: (token: string) => {
    return http.get<LoginResponse>(`/auth/verify-email?token=${token}`);
  },

  resendVerificationEmail: (payload: ResendVerificationEmailPayload) => {
    return http.post<{ message: string }>(
      "/auth/resend-verification-email",
      payload
    );
  },

  forgotPassword: (payload: ForgotPasswordPayload) => {
    return http.post<{ message: string }>("/auth/forgot-password", payload);
  },

  resetPassword: (payload: ResetPasswordPayload) => {
    return http.post<{ message: string }>("/auth/reset-password", payload);
  },
};