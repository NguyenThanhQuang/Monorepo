import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { authApi } from "@obtp/api-client";
import { ResetPasswordSchema } from "@obtp/validation";
import { Lock, Shield } from "lucide-react";
import toast from "react-hot-toast";

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!data.token) {
      setErrorMessage("Đường dẫn không hợp lệ (Thiếu token).");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      await authApi.resetPassword(data);
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
            <p className="text-gray-500 text-sm">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  {...register("newPassword")}
                  placeholder="Nhập mật khẩu mới"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.newPassword ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  {...register("confirmNewPassword")}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.confirmNewPassword ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmNewPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/30 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}