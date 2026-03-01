import { useState } from "react";
import { User, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { authApi } from "@obtp/api-client";
import { UserRole } from "@obtp/shared-types";
import { LoginSchema } from "@obtp/validation";
import { useAuth } from "@/contexts/AuthContext";

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const res = await authApi.login({
        identifier: data.identifier,
        password: data.password,
      });

      const { accessToken, user } = res;

      if (!user.roles?.includes(UserRole.ADMIN)) {
        setErrorMessage("Tài khoản không có quyền quản trị hệ thống.");
        return;
      }

      login(accessToken, user);

      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-600 to-pink-500 rounded-3xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản trị hệ thống
            </h1>
            <p className="text-gray-500">Đăng nhập để quản lý hệ thống</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ERROR MESSAGE TỪ API */}
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
                  placeholder="Nhập email hoặc số điện thoại"
                  {...register("identifier")}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.identifier
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.identifier.message}
                </p>
              )}
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
                  placeholder="Nhập mật khẩu"
                  {...register("password")}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-linear-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang đăng nhập...
                </>
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
