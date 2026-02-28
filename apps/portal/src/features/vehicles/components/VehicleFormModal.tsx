import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import type { Vehicle } from "@obtp/shared-types";
import { VehicleStatus } from "@obtp/shared-types";
import { CreateVehicleSchema } from "@obtp/validation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type z from "zod";

type FormData = z.infer<typeof CreateVehicleSchema>;

// Mock Presets (có thể tách ra file constants)
const PRESETS = [
  { label: "Ghế ngồi 16 chỗ", f: 1, r: 4, c: 4, a: [2] },
  { label: "Giường nằm 40 chỗ", f: 2, r: 5, c: 4, a: [2] },
];

interface Props {
  vehicleToEdit: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  errorMsg?: string | null;
}

export function VehicleFormModal({
  vehicleToEdit,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  errorMsg,
}: Props) {
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(CreateVehicleSchema),
    defaultValues: {
      companyId: user?.companyId || "",
      vehicleNumber: "",
      type: "",
      status: VehicleStatus.ACTIVE,
      floors: 1,
      seatRows: 10,
      seatColumns: 4,
      aislePositions: [2],
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        reset({
          companyId: user?.companyId || "",
          vehicleNumber: vehicleToEdit.vehicleNumber,
          type: vehicleToEdit.type,
          status: vehicleToEdit.status,
          floors: vehicleToEdit.floors,
          seatRows: vehicleToEdit.seatRows,
          seatColumns: vehicleToEdit.seatColumns,
          aislePositions: vehicleToEdit.aislePositions,
        });
      } else {
        reset({
          companyId: user?.companyId || "",
          vehicleNumber: "",
          type: "",
          status: VehicleStatus.ACTIVE,
          floors: 1,
          seatRows: 10,
          seatColumns: 4,
          aislePositions: [2],
        });
      }
    }
  }, [isOpen, vehicleToEdit, reset, user?.companyId]);

  if (!isOpen) return null;

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = PRESETS.find((x) => x.label === e.target.value);
    if (p) {
      setValue("type", p.label);
      setValue("floors", p.f);
      setValue("seatRows", p.r);
      setValue("seatColumns", p.c);
      setValue("aislePositions", p.a);
    }
  };

  return (
    <div className="obtp-modal-overlay flex items-center justify-center p-4 z-50">
      <div className="obtp-card obtp-card-strong w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold">
            {vehicleToEdit ? "Sửa thông tin xe" : "Thêm xe mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 overflow-y-auto max-h-[70vh]"
        >
          {errorMsg && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {!vehicleToEdit && (
              <div className="md:col-span-2">
                <label className="obtp-label">Chọn mẫu xe (Tự động điền)</label>
                <select
                  className="obtp-input"
                  onChange={handlePresetChange}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Chọn mẫu xe --
                  </option>
                  {PRESETS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="obtp-field">
              <label className="obtp-label">Biển số xe *</label>
              <Input
                {...register("vehicleNumber")}
                placeholder="VD: 51B-12345"
                className="pl-3"
              />
              {errors.vehicleNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>

            <div className="obtp-field">
              <label className="obtp-label">Loại xe *</label>
              <Input
                {...register("type")}
                placeholder="VD: Giường nằm 40 chỗ"
                className="pl-3"
              />
              {errors.type && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="obtp-field">
              <label className="obtp-label">Trạng thái</label>
              <select {...register("status")} className="obtp-input">
                <option value={VehicleStatus.ACTIVE}>Hoạt động</option>
                <option value={VehicleStatus.MAINTENANCE}>Bảo trì</option>
                <option value={VehicleStatus.INACTIVE}>Ngưng hoạt động</option>
              </select>
            </div>
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-slate-800">
            Cấu hình Sơ đồ ghế
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="obtp-field">
              <label className="obtp-label">Số tầng</label>
              <Input
                type="number"
                {...register("floors", { valueAsNumber: true })}
                className="pl-3"
              />
            </div>
            <div className="obtp-field">
              <label className="obtp-label">Hàng ghế</label>
              <Input
                type="number"
                {...register("seatRows", { valueAsNumber: true })}
                className="pl-3"
              />
            </div>
            <div className="obtp-field">
              <label className="obtp-label">Cột ghế</label>
              <Input
                type="number"
                {...register("seatColumns", { valueAsNumber: true })}
                className="pl-3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
