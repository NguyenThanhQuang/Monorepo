import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAssign: () => void;
  isLoading: boolean;
}

export function DriverAssignModal({
  isOpen,
  onClose,
  onAssign,
  isLoading,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="obtp-modal-overlay flex items-center justify-center p-4 z-50">
      <div className="obtp-card obtp-card-strong w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Phân công tài xế</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-slate-500 mb-6">
          Tính năng quản lý danh sách tài xế đang được hoàn thiện. Vui lòng thử
          lại ở phase sau.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={onAssign} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Phân công (Mock)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
