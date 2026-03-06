import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useModal } from "@/hooks/useModal";
import {
  type Booking,
  type UpdateBookingCustomerPayload,
} from "@obtp/shared-types";
import { toast } from "sonner";
import { useBookingMutations, useBookings } from "../api/useBookings";
import { downloadTicketAsText } from "../utils/ticket-utils";

export function useBookingsViewModel() {
  const user = useCurrentUser();
  const { data: bookings = [], isLoading, isFetching } = useBookings();
  const { cancelBooking, updateCustomerInfo } = useBookingMutations();

  const editModal = useModal<Booking>();

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

  const handleDownload = (booking: Booking) => {
    const companyName =
      (booking as any).tripId?.companyId?.name || user?.name || "OBTP Bus Line";

    try {
      downloadTicketAsText(booking, companyName);
      toast.success("Đã chuẩn bị tệp tải về");
    } catch (error) {
      toast.error("Lỗi khi tạo file vé");
    }
  };

  const handleSubmitEdit = (id: string, data: UpdateBookingCustomerPayload) => {
    updateCustomerInfo.mutate(
      { id, payload: data },
      {
        onSuccess: () => {
          editModal.close();
        },
      },
    );
  };

  return {
    state: {
      bookings,
      isLoading,
      isFetching,
      isMutating: cancelBooking.isPending || updateCustomerInfo.isPending,
    },
    modals: {
      edit: editModal,
    },
    actions: {
      cancel: handleCancel,
      download: handleDownload,
      openEdit: editModal.open,
      submitEdit: handleSubmitEdit,
    },
  };
}
