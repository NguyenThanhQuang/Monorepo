import { authApi } from "@obtp/api-client";
import {
  type AuthUserResponse,
  type LoginPayload,
  UserRole,
} from "@obtp/shared-types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../core/auth/auth-store";

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await authApi.login(payload);
      return res;
    },
    onSuccess: (data) => {
      const roles = data.user.roles || [];
      if (!roles.includes(UserRole.COMPANY_ADMIN)) {
        throw new Error("Tài khoản này không có quyền quản lý nhà xe.");
      }

      const safeUser: AuthUserResponse = {
        ...data.user,

        userId: data.user.id || (data.user as any)._id,

        phone: (data.user as any).phone || "",
        isEmailVerified: (data.user as any).isEmailVerified ?? true,

        companyId: data.user.companyId,
        roles: data.user.roles,
      };

      setAuth(safeUser, data.accessToken);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("Login Failed:", error);
    },
  });
};
