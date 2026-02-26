import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateVehicleSchema } from "@obtp/validation";
import {
  type CreateVehiclePayload,
  VehicleStatus,
  type Vehicle,
} from "@obtp/shared-types";
import { calculateVehicleConfig } from "@obtp/business-logic";
import { useMemo, useEffect } from "react";
import { useAuthStore } from "../../../core/auth/auth-store";
import { Button } from "../../../shared/components/ui/button";
import { FormControl } from "../../../shared/components/ui/form-control";
import { Input } from "../../../shared/components/ui/input";

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSubmit: (data: CreateVehiclePayload) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const VehicleForm = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: VehicleFormProps) => {
  const companyId = useAuthStore((s) => s.user?.companyId);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateVehiclePayload>({
    resolver: zodResolver(CreateVehicleSchema as any),
    defaultValues: {
      companyId: companyId || "",
      vehicleNumber: "",
      type: "",
      seatRows: 10,
      seatColumns: 4,
      floors: 1,
      aislePositions: [2],
      status: VehicleStatus.ACTIVE,
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        companyId: companyId || "",
        aislePositions: initialData.aislePositions || [2],
      });
    } else {
      reset({
        companyId: companyId || "",
        vehicleNumber: "",
        type: "",
        seatRows: 10,
        seatColumns: 4,
        floors: 1,
        aislePositions: [2],
        status: VehicleStatus.ACTIVE,
      });
    }
  }, [initialData, companyId, reset]);

  const [rows, cols, aisles, floors] = watch([
    "seatRows",
    "seatColumns",
    "aislePositions",
    "floors",
  ]);

  const previewConfig = useMemo(() => {
    try {
      return calculateVehicleConfig(
        Number(rows),
        Number(cols),
        aisles || [],
        Number(floors),
      );
    } catch (e) {
      return null;
    }
  }, [rows, cols, aisles, floors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cột trái: Thông tin cơ bản */}
        <div className="space-y-4">
          <FormControl label="Biển số xe" error={errors.vehicleNumber?.message}>
            <Input {...register("vehicleNumber")} placeholder="59A-123.45" />
          </FormControl>

          <FormControl label="Loại xe" error={errors.type?.message}>
            <Input {...register("type")} placeholder="Giường nằm Limousine" />
          </FormControl>

          <FormControl label="Trạng thái">
            <select
              {...register("status")}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value={VehicleStatus.ACTIVE}>Hoạt động</option>
              <option value={VehicleStatus.MAINTENANCE}>Bảo trì</option>
              <option value={VehicleStatus.INACTIVE}>Ngưng hoạt động</option>
            </select>
          </FormControl>

          <div className="grid grid-cols-3 gap-2">
            <FormControl label="Số hàng" error={errors.seatRows?.message}>
              <Input
                type="number"
                {...register("seatRows", { valueAsNumber: true })}
              />
            </FormControl>
            <FormControl label="Số cột" error={errors.seatColumns?.message}>
              <Input
                type="number"
                {...register("seatColumns", { valueAsNumber: true })}
              />
            </FormControl>
            <FormControl label="Số tầng" error={errors.floors?.message}>
              <Input
                type="number"
                max={2}
                min={1}
                {...register("floors", { valueAsNumber: true })}
              />
            </FormControl>
          </div>
        </div>

        {/* Cột phải: Preview Sơ đồ ghế */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Xem trước: {previewConfig?.totalSeats || 0} ghế
          </h4>

          <div className="flex gap-4 justify-center overflow-x-auto py-2">
            {/* Tầng 1 */}
            <div className="border p-2 bg-white rounded shadow-sm">
              <p className="text-xs text-center mb-1 text-slate-500">Tầng 1</p>
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              >
                {previewConfig?.seatMapFloor1.layout.map((row, rIdx) =>
                  row.map((seat, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-6 h-6 rounded text-[10px] flex items-center justify-center ${seat ? "bg-blue-500 text-white" : "bg-slate-100"}`}
                    >
                      {seat || ""}
                    </div>
                  )),
                )}
              </div>
            </div>

            {/* Tầng 2 (Nếu có) */}
            {floors > 1 && previewConfig?.seatMapFloor2 && (
              <div className="border p-2 bg-white rounded shadow-sm">
                <p className="text-xs text-center mb-1 text-slate-500">
                  Tầng 2
                </p>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                  {previewConfig.seatMapFloor2.layout.map((row, rIdx) =>
                    row.map((seat, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-6 h-6 rounded text-[10px] flex items-center justify-center ${seat ? "bg-indigo-500 text-white" : "bg-slate-100"}`}
                      >
                        {seat || ""}
                      </div>
                    )),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy bỏ
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Lưu thay đổi" : "Thêm xe mới"}
        </Button>
      </div>
    </form>
  );
};
