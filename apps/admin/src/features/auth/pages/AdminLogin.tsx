import { useState } from "react";
import { User, Lock, Shield, ArrowLeft } from "lucide-react";
import { authApi } from "@obtp/api-client";
import { useLanguage } from "../../../../../portal/src/contexts/LanguageContext";
import { UserRole } from "@obtp/shared-types";
import { ForgotPasswordModal } from "../../../../../portal/src/components/auth/ForgotPassword";

interface AdminLoginProps {
  onLoginSuccess: (adminData: {
    name: string;
    id: string;
    email: string;
  }) => void;
  onBack: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setIsLoading(true);

      const res = await authApi.login({
        identifier,
        password,
      });

      const data = res;

      // ❗ Chỉ cho ADMIN hệ thống đăng nhập
      const isAdmin = data.user.roles.includes(UserRole.ADMIN);

      if (!isAdmin) {
        alert("Bạn không có quyền truy cập hệ thống quản trị");
        return;
      }

      // Lưu token
      localStorage.setItem("accessToken", data.accessToken);

      onLoginSuccess({
        name: data.user.name,
        id: data.user.id,
        email: data.user.email,
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center space-x-2 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("backToHome")}</span>
        </button>

        {/* Card */}
        <div className="bg-white/95 dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-3xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl dark:text-white">
              {t("systemAdminTitle")}
            </h1>

            <p className="text-gray-500">
              {t("systemLoginSubtitle")}
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Identifier */}
            <div>
              <label className="text-sm">
                Email / Phone
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm">{t("password")}</label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-slate-500 hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl"
            >
              {isLoading ? t("loggingIn") : t("login")}
            </button>
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal
          userType="system"
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
}
