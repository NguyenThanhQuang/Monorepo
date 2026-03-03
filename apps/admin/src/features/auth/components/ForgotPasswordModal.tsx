import { useState } from "react";
import { X, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";

import { authApi } from "@obtp/api-client";
import { ForgotPasswordSchema } from "@obtp/validation";
import { useLanguage } from "@/contexts/LanguageContext";

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

interface ForgotPasswordModalProps {
  onClose: () => void;
  userType?: "system" | "company";
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword({ email: data.email });
      setIsSuccess(true);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Lỗi gửi email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="text-white" />
          </button>
          <h2 className="text-2xl text-white font-bold">{t("forgotPasswordSystem")}</h2>
          <p className="text-white/80 mt-1">{t("enterEmailToReset")}</p>
        </div>

        {/* BODY */}
        <div className="p-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("registeredEmail")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder={t("emailPlaceholder")}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition-all ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("sendingEmail")}
                  </>
                ) : (
                  t("sendResetLinkButton")
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto text-green-500 w-16 h-16" />
              <p className="font-medium text-gray-900 dark:text-white text-lg">{t("emailSentSuccess")}</p>
              <p className="text-gray-500 text-sm">
                {t("emailSentMessage")} <strong>{getValues("email")}</strong>.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl hover:bg-gray-200 transition-colors mt-4"
              >
                <ArrowLeft className="inline mr-2 w-4 h-4" />
                {t("backToLogin")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}