import { useState } from "react";
import { X, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { authApi } from "@obtp/api-client";
import { useLanguage } from "../../../contexts/LanguageContext";

interface ForgotPasswordModalProps {
  onClose: () => void;
  userType: "system";
}

export function ForgotPasswordModal({
  onClose,
}: ForgotPasswordModalProps) {

  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      await authApi.forgotPassword({
        email,
      });

      setIsSuccess(true);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Lỗi gửi email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 relative">

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="text-white" />
          </button>

          <h2 className="text-2xl text-white">
            {t("forgotPasswordSystem")}
          </h2>

          <p className="text-white/80">
            {t("enterEmailToReset")}
          </p>
        </div>

        {/* BODY */}
        <div className="p-6">

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">

              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">{t("registeredEmail")}</label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("emailPlaceholder")}
className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl"
              >
                {isLoading
                  ? t("sendingEmail")
                  : t("sendResetLinkButton")}
              </button>

            </form>
          ) : (
            <div className="text-center space-y-4">

              <CheckCircle className="mx-auto text-green-500" />

              <p>{t("emailSentSuccess")}</p>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 rounded-xl"
              >
                <ArrowLeft className="inline mr-2" />
                {t("backToLogin")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
