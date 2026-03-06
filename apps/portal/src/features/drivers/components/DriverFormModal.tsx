import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Phone, FileBadge, Award } from "lucide-react";
import { CreateDriverSchema } from "@obtp/validation";
import type { CreateDriverPayload, DriverResponse } from "@obtp/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  driverToEdit: DriverResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDriverPayload) => void;
  isLoading: boolean;
}

export function DriverFormModal({
  driverToEdit,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDriverPayload>({
    resolver: zodResolver(
      CreateDriverSchema,
    ) as unknown as Resolver<CreateDriverPayload>,

    defaultValues: {
      name: "",
      phone: "",
      licenseNumber: "",
      idCardNumber: "",
      experienceYears: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (driverToEdit) {
        reset({
          name: driverToEdit.name || "",
          phone: driverToEdit.phone || "",
          licenseNumber: driverToEdit.licenseNumber || "",
          idCardNumber: driverToEdit.idCardNumber || "",
          experienceYears: driverToEdit.experienceYears || 0,
        });
      } else {
        reset({
          name: "",
          phone: "",
          licenseNumber: "",
          idCardNumber: "",
          experienceYears: 0,
        });
      }
    }
  }, [isOpen, driverToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="obtp-modal-overlay">
      <div
        className="obtp-card obtp-card-strong obtp-modal"
        style={{ maxWidth: 500 }}
      >
        {/* Header */}
        <div className="obtp-modal-header">
          <button
            type="button"
            onClick={onClose}
            className="obtp-icon-btn absolute right-3 top-3"
          >
            <X size={18} />
          </button>
          <h2 className="obtp-modal-title">
            {driverToEdit ? "Cập nhật hồ sơ tài xế" : "Thêm tài xế mới"}
          </h2>
        </div>

        {/* Body */}
        <div className="obtp-modal-body">
          <form
            id="driver-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="obtp-field">
              <label className="obtp-label">Họ và tên *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                  <User size={16} />
                </div>
                <Input
                  hasIcon
                  {...register("name")}
                  className="pl-10"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="obtp-field">
              <label className="obtp-label">Số điện thoại *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                  <Phone size={16} />
                </div>
                <Input
                  hasIcon
                  {...register("phone")}
                  className="pl-10"
                  placeholder="0909..."
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="obtp-field">
                <label className="obtp-label">Số Bằng lái (GPLX) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                    <FileBadge size={16} />
                  </div>
                  <Input
                    hasIcon
                    {...register("licenseNumber")}
                    className="pl-10"
                    placeholder="B2-123456"
                  />
                </div>
                {errors.licenseNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.licenseNumber.message}
                  </p>
                )}
              </div>

              <div className="obtp-field">
                <label className="obtp-label">CCCD / CMND *</label>
                <Input {...register("idCardNumber")} placeholder="079..." />
                {errors.idCardNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.idCardNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="obtp-field">
              <label className="obtp-label">Kinh nghiệm (Năm)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 obtp-input-icon top-icon">
                  <Award size={16} />
                </div>
                <Input
                  hasIcon
                  type="number"
                  {...register("experienceYears", { valueAsNumber: true })}
                  className="pl-10"
                  min={0}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="obtp-modal-footer p-6 pt-0 flex justify-end gap-3">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" form="driver-form" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
        </div>
      </div>
    </div>
  );
}
