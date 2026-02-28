// src/components/layout/LoginPage.tsx
import { useState } from "react";
import { User, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@obtp/api-client";
import { useAuth } from "../../../contexts/AuthContext";
import { UserRole } from "@obtp/shared-types";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setErrorMessage("");
      setIsLoading(true);

      const res = await authApi.login({
        identifier,
        password,
      });

      const { accessToken, user } = res;

      // ✅ CHỈ CHO PHÉP ADMIN
      if (!user.roles?.includes(UserRole.ADMIN)) {
        setErrorMessage("Tài khoản không có quyền quản trị hệ thống.");
        return;
      }

      // ✅ Login và redirect
      login(accessToken, {
        name: user.name,
        id: user.id,
        email: user.email,
        roles: user.roles,
      });

      navigate("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản trị hệ thống
            </h1>

            <p className="text-gray-500">
              Đăng nhập để quản lý hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Identifier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email / Số điện thoại
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập email hoặc số điện thoại"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}