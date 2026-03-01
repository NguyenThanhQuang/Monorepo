import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { UpdateBookingCustomerSchema } from "@obtp/validation";
import type { Booking, UpdateBookingCustomerPayload } from "@obtp/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateBookingCustomerPayload) => void;
  isLoading: boolean;
}

export function EditBookingModal({
  booking,
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
  } = useForm<UpdateBookingCustomerPayload>({
    resolver: zodResolver(
      UpdateBookingCustomerSchema,
    ) as unknown as Resolver<UpdateBookingCustomerPayload>,
  });

  useEffect(() => {
    if (isOpen && booking) {
      reset({
        contactName: booking.contactName,
        contactPhone: booking.contactPhone,
      });
    }
  }, [isOpen, booking, reset]);

  if (!isOpen || !booking) return null;

  const handleFormSubmit = (data: UpdateBookingCustomerPayload) => {
    onSubmit(booking.id || booking._id, data);
  };

  return (
    <div className="obtp-modal-overlay flex items-center justify-center z-50 p-4">
      <div className="obtp-card obtp-card-strong w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold">Sửa thông tin khách</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="edit-booking-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-4">
            <span className="text-slate-500">Mã vé:</span>{" "}
            <span className="font-bold text-blue-600">
              {booking.ticketCode}
            </span>
          </div>

          <div className="obtp-field">
            <label className="obtp-label">Tên khách hàng</label>
            <Input
              {...register("contactName")}
              placeholder="Nhập tên khách hàng"
            />
            {errors.contactName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div className="obtp-field">
            <label className="obtp-label">Số điện thoại liên hệ</label>
            <Input {...register("contactPhone")} placeholder="09xx..." />
            {errors.contactPhone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </form>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" form="edit-booking-form" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
