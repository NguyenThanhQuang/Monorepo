// src/features/admin-auth/AdminLogin.container.tsx
import { useState } from "react";
import {  UserRole, type LoginResponse } from "@obtp/shared-types";
import { loginAdmin } from "../../api/service/auth/auth.api";
import { AdminLogin } from "../../pages/admin/AdminLogin";

interface Props {
  adminType: "company" | "system";
  onLoginSuccess: (data: LoginResponse["user"]) => void;
  onBack: () => void;
}

export function AdminLoginContainer({
  adminType,
  onLoginSuccess,
  onBack,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginAdmin({ identifier, password });

      const roles = result.user.roles;

      // 🔐 ROLE CHECK
      if (
        adminType === "system" &&
        !roles.includes(UserRole.ADMIN)
      ) {
        throw new Error("Bạn không có quyền Admin hệ thống");
      }

      if (
        adminType === "company" &&
        !roles.includes(UserRole.COMPANY_ADMIN)
      ) {
        throw new Error("Bạn không có quyền Quản lý nhà xe");
      }

      localStorage.setItem("accessToken", result.accessToken);
      onLoginSuccess(result.user);
    } catch (err: any) {
      alert(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLogin
      adminType={adminType}
      isLoading={loading}
      onSubmit={handleLogin}
      onBack={onBack}
    />
  );
}
