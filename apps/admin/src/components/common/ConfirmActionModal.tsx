import React, { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type ModalType = "danger" | "warning" | "success" | "info";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  loading?: boolean;
  countdownSeconds?: number; // Bổ sung prop đếm ngược
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "danger",
  loading = false,
  countdownSeconds = 0,
}) => {
  const { t } = useLanguage();
  const [timer, setTimer] = useState(0);

  // Xử lý đếm ngược khi modal mở
  useEffect(() => {
    if (isOpen && countdownSeconds > 0) {
      setTimer(countdownSeconds);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimer(0);
    }
  }, [isOpen, countdownSeconds]);

  if (!isOpen) return null;

  const config = {
    danger: {
      Icon: AlertCircle,
      iconClass: "text-red-600",
      bgIcon: "bg-red-100 dark:bg-red-900/30",
      btnClass: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    },
    warning: {
      Icon: AlertTriangle,
      iconClass: "text-yellow-600",
      bgIcon: "bg-yellow-100 dark:bg-yellow-900/30",
      btnClass: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20",
    },
    success: {
      Icon: CheckCircle,
      iconClass: "text-green-600",
      bgIcon: "bg-green-100 dark:bg-green-900/30",
      btnClass: "bg-green-600 hover:bg-green-700 shadow-green-500/20",
    },
    info: {
      Icon: AlertCircle,
      iconClass: "text-blue-600",
      bgIcon: "bg-blue-100 dark:bg-blue-900/30",
      btnClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    },
  };

  const { Icon, iconClass, bgIcon, btnClass } = config[type];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all dark:bg-gray-800">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-xl p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${bgIcon}`}
          >
            <Icon className={`h-8 w-8 ${iconClass}`} />
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {message}
          </p>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {cancelText || t("cancel")}
            </button>
            <button
              type="button"
              disabled={loading || timer > 0}
              onClick={async () => {
                await onConfirm();
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${btnClass} ${timer > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>
                {timer > 0 
                  ? `${confirmText || t("confirm")} (${timer}s)` 
                  : (loading ? t("processing") : confirmText || t("confirm"))}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};