import { useState } from "react";
import { useBookings, useBookingMutations } from "../api/useBookings";
import { BookingTable } from "../components/BookingTable";
import { EditBookingModal } from "../components/EditBookingModal";
import { downloadTicketAsText } from "../utils/ticket-utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Booking, UpdateBookingCustomerPayload } from "@obtp/shared-types";
import { toast } from "sonner";

export default function BookingsPage() {
  const user = useCurrentUser();

  const { data: bookings = [], isLoading, isFetching } = useBookings();

  const { cancelBooking, updateCustomerInfo } = useBookingMutations();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  /**
   * Xử lý Hủy vé (Yêu cầu xác nhận trước khi thực hiện)
   */
  const handleCancel = (id: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn hủy vé này? Hành động này sẽ trả lại ghế cho chuyến đi và không thể hoàn tác.",
      )
    ) {
      cancelBooking.mutate(id, {
        onSuccess: () => toast.success("Đã hủy vé thành công"),
        onError: (err: any) => toast.error(err.message || "Hủy vé thất bại"),
      });
    }
  };

  /**
   * Xử lý tải vé định dạng text (.txt)
   */
  const handleDownload = (booking: Booking) => {
    // Ưu tiên dùng tên nhà xe từ object Trip, fallback về thông tin user/mặc định
    const companyName =
      (booking as any).tripId?.companyId?.name || user?.name || "OBTP Bus Line";
    downloadTicketAsText(booking, companyName);
    toast.success("Đã chuẩn bị tệp tải về");
  };

  /**
   * Mở Modal và gán thông tin vé cần chỉnh sửa
   */
  const handleEditInfo = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditModalOpen(true);
  };

  /**
   * Thực hiện gửi yêu cầu cập nhật thông tin khách hàng lên Server
   */
  const handleSubmitEdit = (id: string, data: UpdateBookingCustomerPayload) => {
    updateCustomerInfo.mutate(
      { id, payload: data },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedBooking(null);
        },
      },
    );
  };

  // Trạng thái Loading ban đầu
  if (isLoading)
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">
          Đang tải danh sách đặt vé...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header trang */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Quản lý Đặt vé
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi danh sách khách hàng, hỗ trợ in vé và xử lý các thay đổi
            đơn đặt.
          </p>
        </div>

        {/* Chỉ thị trạng thái background sync */}
        {isFetching && (
          <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-md flex items-center gap-1">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
            Đang đồng bộ...
          </span>
        )}
      </div>

      {/* Bảng dữ liệu chính */}
      <BookingTable
        bookings={bookings}
        onEditInfo={handleEditInfo}
        onCancel={handleCancel}
        onDownload={handleDownload}
      />

      {/* Modal Popup Chỉnh sửa thông tin khách hàng */}
      <EditBookingModal
        isOpen={editModalOpen}
        booking={selectedBooking}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleSubmitEdit}
        isLoading={updateCustomerInfo.isPending}
      />
    </div>
  );
}
