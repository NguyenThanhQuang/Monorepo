import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@obtp/api-client";
import { UserRole } from "@obtp/shared-types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAccessToken, setAccessToken } from "@/lib/auth";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";

export function AdminLoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    // If already logged in, go straight to admin.
    if (getAccessToken()) navigate("/admin", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setIsLoading(true);

      const data = await authApi.login({ identifier, password });

      // Only system ADMIN can login to admin app
      const isAdmin = data.user.roles.includes(UserRole.ADMIN);
      if (!isAdmin) {
        alert("Bạn không có quyền truy cập hệ thống quản trị");
        return;
      }

      setAccessToken(data.accessToken);
      navigate("/admin", { replace: true });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center space-x-2 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("backToHome")}</span>
        </button>

        <div className="bg-white/95 dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-3xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl dark:text-white">{t("systemAdminTitle")}</h1>
            <p className="text-gray-500">{t("systemLoginSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm">Email / Phone</label>
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-slate-500 hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>

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
        <ForgotPasswordModal userType="system" onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
