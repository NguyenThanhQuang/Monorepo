import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { authApi } from "@obtp/api-client";
import { ActivateAccountSchema } from "@obtp/validation";
import { useAuth } from "@/contexts/AuthContext";

type ActivateAccountValues = z.infer<typeof ActivateAccountSchema>;

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = params.get("token") || "";
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateAccountValues>({
    resolver: zodResolver(ActivateAccountSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: ActivateAccountValues) => {
    if (!data.token) {
      setErrorMessage("Đường dẫn kích hoạt không hợp lệ (Thiếu token).");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await authApi.activateAccount({
        token: data.token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      login(res.accessToken, res.user);

      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Kích hoạt tài khoản quản trị
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              {...register("newPassword")}
              placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.newPassword
                  ? "border-red-500"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              {...register("confirmNewPassword")}
              placeholder="Nhập lại mật khẩu"
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.confirmNewPassword
                  ? "border-red-500"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            />
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3.5 bg-linear-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              "Kích hoạt tài khoản"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
