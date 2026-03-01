import { useState, useEffect } from "react";
import { X, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrivers } from "../../drivers/api/useDrivers";

interface Props {
  isOpen: boolean;
  tripId: string | null;
  onClose: () => void;
  onAssign: (driverId: string) => void;
  isLoading: boolean;
}

export function DriverAssignModal({
  isOpen,
  onClose,
  onAssign,
  isLoading,
}: Props) {
  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers();
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  useEffect(() => {
    if (isOpen) setSelectedDriverId("");
  }, [isOpen]);

  if (!isOpen) return null;

  const activeDrivers = drivers.filter((d) => d.status === "active");

  const handleSubmit = () => {
    if (!selectedDriverId) return;
    onAssign(selectedDriverId);
  };

  return (
    <div className="obtp-modal-overlay flex items-center justify-center p-4 z-50">
      <div className="obtp-card obtp-card-strong w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="text-green-600" /> Chọn Tài Xế
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isLoadingDrivers ? (
          <p className="text-slate-500 text-center py-4">
            Đang tải danh sách tài xế...
          </p>
        ) : activeDrivers.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed border-red-100 bg-red-50 text-red-600 rounded-lg">
            Bạn chưa có Tài xế nào đang rảnh / hoạt động. Hãy thêm Tài xế ở Tab
            "Tài xế" trước.
          </div>
        ) : (
          <div className="obtp-field mb-6">
            <label className="obtp-label text-sm font-semibold">
              Tài xế sẽ chạy chuyến này:
            </label>
            <select
              className="obtp-input mt-2 cursor-pointer h-12"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              <option value="" disabled>
                -- Nhấp để chọn tài xế --
              </option>
              {activeDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="w-24">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedDriverId}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {isLoading ? "Đang xử lý..." : "Phân công ngay"}
          </Button>
        </div>
      </div>
    </div>
  );
}
