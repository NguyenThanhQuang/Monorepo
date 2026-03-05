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
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { useLanguage } from "@/contexts/LanguageContext";

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

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
        setErrorMessage(t("unauthorizedAdmin"));
        return;
      }

      login(accessToken, user);
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || t("loginFailed"));
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

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("adminPanel")}</h1>
            <p className="text-gray-500">{t("loginToManage")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 text-red-600 text-sm p-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("email")} / {t("phone")}
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  {...register("identifier")}
                  placeholder={t("identifierPlaceholder")}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">{t("password")}</label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                  {t("forgotPassword")}?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  {...register("password")}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t("processing")}
                </span>
              ) : (
                t("login")
              )}
            </button>
          </form>
        </div>
      </div>
      
      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </div>
  );
}