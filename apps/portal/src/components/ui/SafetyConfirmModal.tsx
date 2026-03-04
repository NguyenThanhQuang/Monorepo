import { useState, useEffect } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "danger" | "primary";
  seconds?: number;
}

export function SafetyConfirmModal({
  isOpen,
  title,
  description,
  confirmText,
  onConfirm,
  onCancel,
  isLoading,
  variant = "danger",
  seconds = 10,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(10);
  const isFinished = timeLeft === 0;

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(seconds);
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="obtp-modal-overlay flex items-center justify-center z-110 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        <div className="p-8 flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              variant === "danger"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isFinished ? (
              <CheckCircle2 size={36} />
            ) : (
              <Clock size={36} className="animate-pulse" />
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {description}
          </p>

          {!isFinished && (
            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Yêu cầu kiểm tra lại thông tin</span>
                <span>{timeLeft}s</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${variant === "danger" ? "bg-red-600" : "bg-blue-600"}`}
                  style={{ width: `${(timeLeft / seconds) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>

          {isFinished ? (
            <Button
              variant={variant === "danger" ? "danger" : "default"}
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 shadow-lg animate-in slide-in-from-bottom-2 ${
                variant === "primary" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
            >
              {isLoading ? "Đang xử lý..." : confirmText}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1 opacity-50 cursor-not-allowed bg-slate-200"
              disabled
            >
              Vui lòng đợi {timeLeft}s
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
