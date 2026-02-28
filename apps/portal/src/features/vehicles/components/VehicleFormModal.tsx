import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type { CreateVehiclePayload, Vehicle } from "@obtp/shared-types";
import { VehicleStatus } from "@obtp/shared-types";
import { CreateVehicleSchema } from "@obtp/validation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "Ghế ngồi 16 chỗ", f: 1, r: 4, c: 4, a: [2] },
  { label: "Giường nằm 40 chỗ", f: 2, r: 5, c: 4, a: [2] },
];

interface Props {
  vehicleToEdit: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVehiclePayload) => void;
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
      seatRows: 10,
      seatColumns: 4,
      aislePositions: [2],
      description: "",
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
          description: vehicleToEdit.description || "",
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
          description: "",
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
    <div className="obtp-modal-overlay">
      <div
        className="obtp-card obtp-card-strong obtp-modal"
        style={{ maxWidth: 600 }}
      >
        <div className="obtp-modal-header">
          <button
            type="button"
            onClick={onClose}
            className="obtp-icon-btn"
            style={{ position: "absolute", right: 12, top: 12 }}
          >
            <X size={18} />
          </button>
          <h2 className="obtp-modal-title">
            {vehicleToEdit ? "Chỉnh sửa thông tin xe" : "Thêm xe mới"}
          </h2>
        </div>

        <div className="obtp-modal-body">
          <form
            id="vehicle-form"
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "grid", gap: 14 }}
          >
            {errorMsg && <div className="obtp-error">{errorMsg}</div>}

            {!vehicleToEdit && (
              <div className="obtp-field">
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div className="obtp-field">
                <label className="obtp-label">Biển số xe *</label>
                <input
                  {...register("vehicleNumber")}
                  placeholder="51B-12345"
                  className="obtp-input"
                />
                {errors.vehicleNumber && (
                  <p className="obtp-error-text">
                    {errors.vehicleNumber.message}
                  </p>
                )}
              </div>

              <div className="obtp-field">
                <label className="obtp-label">Loại xe *</label>
                <input
                  {...register("type")}
                  placeholder="Xe giường nằm..."
                  className="obtp-input"
                />
                {errors.type && (
                  <p className="obtp-error-text">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="obtp-field">
              <label className="obtp-label">Trạng thái</label>
              <select {...register("status")} className="obtp-input">
                <option value={VehicleStatus.ACTIVE}>Hoạt động</option>
                <option value={VehicleStatus.MAINTENANCE}>Bảo trì</option>
                <option value={VehicleStatus.INACTIVE}>Ngưng hoạt động</option>
              </select>
            </div>

            <div
              style={{
                margin: "10px 0",
                borderTop: "1px solid var(--obtp-border)",
                paddingTop: 14,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>
                Cấu hình Sơ đồ ghế
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                <div className="obtp-field">
                  <label className="obtp-label">Số tầng</label>
                  <input
                    type="number"
                    {...register("floors", { valueAsNumber: true })}
                    className="obtp-input"
                  />
                </div>
                <div className="obtp-field">
                  <label className="obtp-label">Hàng ghế</label>
                  <input
                    type="number"
                    {...register("seatRows", { valueAsNumber: true })}
                    className="obtp-input"
                  />
                </div>
                <div className="obtp-field">
                  <label className="obtp-label">Cột ghế</label>
                  <input
                    type="number"
                    {...register("seatColumns", { valueAsNumber: true })}
                    className="obtp-input"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER: Nằm trong card nhưng tách biệt body */}
        <div
          className="obtp-modal-footer"
          style={{
            padding: "0 24px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button
            type="button"
            className="obtp-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
            style={{ padding: "10px 20px" }}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="vehicle-form"
            className="obtp-btn"
            disabled={isLoading}
            style={{ padding: "10px 20px", minWidth: 140 }}
          >
            {isLoading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
}
