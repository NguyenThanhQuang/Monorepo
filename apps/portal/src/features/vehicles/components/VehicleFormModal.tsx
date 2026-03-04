import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Info } from "lucide-react";
import {
  VehicleStatus,
  type CreateVehiclePayload,
  type Vehicle,
} from "@obtp/shared-types";
import { CreateVehicleSchema } from "@obtp/validation";
import { BUS_PRESETS, calculateVehicleConfig } from "@obtp/business-logic";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafetyConfirmModal } from "@/components/ui/SafetyConfirmModal";

interface Props {
  vehicleToEdit: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVehiclePayload) => void;
  isLoading: boolean;
}

export function VehicleFormModal({
  vehicleToEdit,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateVehiclePayload>({
    resolver: zodResolver(
      CreateVehicleSchema,
    ) as unknown as Resolver<CreateVehiclePayload>,
    defaultValues: {
      companyId: user?.companyId || "",
      vehicleNumber: "",
      type: "",
      status: VehicleStatus.ACTIVE,
      floors: 1,
      seatRows: 7,
      seatColumns: 3,
      aislePositions: [2],
      description: "",
    },
  });

  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingData, setPendingData] = useState<CreateVehiclePayload | null>(
    null,
  );

  const handleFormSubmit = (data: CreateVehiclePayload) => {
    setPendingData(data);
    setShowSafetyModal(true);
  };

  const handleFinalConfirm = () => {
    if (pendingData) {
      onSubmit(pendingData);
      setShowSafetyModal(false);
    }
  };

  const floors = watch("floors");
  const seatRows = watch("seatRows");
  const seatColumns = watch("seatColumns");
  const aislePositions = watch("aislePositions");

  const previewMap = useMemo(() => {
    try {
      if (seatRows > 0 && seatColumns > 0) {
        return calculateVehicleConfig(
          seatRows,
          seatColumns,
          aislePositions || [],
          floors,
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [floors, seatRows, seatColumns, aislePositions]);

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
          description: vehicleToEdit.description || "",
        });
      } else {
        reset({
          companyId: user?.companyId || "",
          vehicleNumber: "",
          type: "",
          status: VehicleStatus.ACTIVE,
          floors: 1,
          seatRows: 7,
          seatColumns: 3,
          aislePositions: [2],
          description: "",
        });
      }
    }
  }, [isOpen, vehicleToEdit, reset, user?.companyId]);

  if (!isOpen) return null;

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = BUS_PRESETS.find((x) => x.label === e.target.value);
    if (p) {
      setValue("type", p.type, { shouldValidate: true });
      setValue("floors", p.f, { shouldValidate: true });
      setValue("seatRows", p.r, { shouldValidate: true });
      setValue("seatColumns", p.c, { shouldValidate: true });
      setValue("aislePositions", p.a, { shouldValidate: true });
    }
  };

  const renderFloor = (title: string, layout: (string | null)[][]) => (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase">
        {title}
      </h4>
      <div className="inline-grid gap-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        {layout.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-2 justify-center">
            {row.map((seat, cIdx) =>
              seat === null ? (
                <div
                  key={`aisle-${rIdx}-${cIdx}`}
                  className="w-12 h-10 flex items-center justify-center text-slate-300 text-xs"
                >
                  ---
                </div>
              ) : (
                <div
                  key={seat}
                  className="w-12 h-10 bg-green-500 text-white rounded flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  {seat}
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="obtp-modal-overlay flex justify-center items-center p-4 z-50">
      <div className="obtp-card obtp-card-strong w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <h2 className="text-xl font-bold">
            {vehicleToEdit ? "Chỉnh sửa phương tiện" : "Thêm xe mới"}
          </h2>
          <button
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form
          id="vehicle-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CỘT TRÁI: Nhập liệu */}
            <div className="space-y-4">
              {!vehicleToEdit && (
                <div className="obtp-field bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <label className="obtp-label text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Info size={16} /> Chọn mẫu xe chuẩn (Khuyên dùng)
                  </label>
                  <select
                    className="obtp-input bg-white mt-2"
                    onChange={handlePresetChange}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Chọn mẫu xe --
                    </option>
                    {BUS_PRESETS.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="obtp-field">
                  <label className="obtp-label">Biển số xe *</label>
                  <Input
                    {...register("vehicleNumber")}
                    placeholder="51B-12345"
                    className="uppercase"
                  />
                  {errors.vehicleNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {(errors.vehicleNumber as any).message}
                    </p>
                  )}
                </div>
                <div className="obtp-field">
                  <label className="obtp-label">Loại xe (Mô tả) *</label>
                  <Input
                    {...register("type")}
                    placeholder="Giường nằm 40 chỗ"
                  />
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">
                      {(errors.type as any).message}
                    </p>
                  )}
                </div>
              </div>

              <div className="obtp-field border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <label className="obtp-label text-lg">Cấu hình Sơ đồ ghế</label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="obtp-field">
                    <label className="text-xs text-slate-500 font-medium">
                      Số tầng (1-2)
                    </label>
                    <Input
                      type="number"
                      {...register("floors", { valueAsNumber: true })}
                      min={1}
                      max={2}
                    />
                  </div>
                  <div className="obtp-field">
                    <label className="text-xs text-slate-500 font-medium">
                      Số cột (Dọc)
                    </label>
                    <Input
                      type="number"
                      {...register("seatColumns", { valueAsNumber: true })}
                      min={1}
                    />
                  </div>
                  <div className="obtp-field">
                    <label className="text-xs text-slate-500 font-medium">
                      Số hàng (Ngang)
                    </label>
                    <Input
                      type="number"
                      {...register("seatRows", { valueAsNumber: true })}
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Nhập vị trí lối đi */}
              <div className="obtp-field">
                <label className="text-xs text-slate-500 font-medium">
                  Cột nào là lối đi? (Nhập số cột, cách nhau bằng dấu phẩy)
                </label>
                <Controller
                  name="aislePositions"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Ví dụ: 2, 4"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) => {
                        const vals = e.target.value
                          .split(",")
                          .map((v) => parseInt(v.trim()))
                          .filter((v) => !isNaN(v));
                        field.onChange(vals);
                      }}
                    />
                  )}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mẹo: Với xe giường nằm 3 dãy (3 cột ghế), lối đi thường nằm ở
                  cột 2 và 4 (Tổng 5 cột)
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: Xem trước Live Preview */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  Xem trước Sơ đồ ({previewMap?.totalSeats || 0} ghế)
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col items-center">
                {previewMap ? (
                  <>
                    {renderFloor("Tầng dưới", previewMap.seatMapFloor1.layout)}
                    {previewMap.seatMapFloor2 &&
                      renderFloor("Tầng trên", previewMap.seatMapFloor2.layout)}
                  </>
                ) : (
                  <div className="text-slate-400 italic text-sm my-auto">
                    Vui lòng nhập số liệu hợp lệ để xem sơ đồ
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-24"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="vehicle-form"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {isLoading
              ? "Đang lưu..."
              : vehicleToEdit
                ? "Cập nhật"
                : "Lưu phương tiện"}
          </Button>

          <SafetyConfirmModal
            isOpen={showSafetyModal}
            title="Kiểm tra thông tin xe"
            variant="primary"
            confirmText="Xác nhận tạo phương tiện"
            description={`Bạn đang tạo xe: ${pendingData?.vehicleNumber} (${pendingData?.type}). Vui lòng kiểm tra kỹ sơ đồ ghế bên phải trước khi lưu vào hệ thống.`}
            onConfirm={handleFinalConfirm}
            onCancel={() => setShowSafetyModal(false)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
