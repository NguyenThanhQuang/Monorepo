import { useState } from "react";
import { X, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { authApi } from "@obtp/api-client";
import { useLanguage } from "../../../../../portal/src/contexts/LanguageContext";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 relative">

          <button
            onClick={handleClose}
            className="absolute top-4 right-4"
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

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-3 bg-gray-50 border-2 rounded-xl"
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
