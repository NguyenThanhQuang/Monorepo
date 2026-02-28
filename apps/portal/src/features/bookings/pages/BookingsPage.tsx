import { useBookings, useBookingMutations } from "../api/useBookings";
import { BookingTable } from "../components/BookingTable";
import { downloadTicketAsText } from "../utils/ticket-utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function BookingsPage() {
  const user = useCurrentUser();
  const { data: bookings = [], isLoading } = useBookings();
  const { cancelBooking } = useBookingMutations();

  const handleCancel = (id: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác.",
      )
    ) {
      cancelBooking.mutate(id, {
        onSuccess: () => alert("Hủy vé thành công"),
        onError: (err: any) => alert(err.message || "Hủy vé thất bại"),
      });
    }
  };

  const handleDownload = (booking: any) => {
    downloadTicketAsText(booking, user?.companyId || "OBTP Bus Line");
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải danh sách vé...
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Quản lý Đặt vé</h1>
        <p className="text-slate-500 mt-1">
          Theo dõi, in vé và xử lý hủy vé cho khách hàng
        </p>
      </div>

      <BookingTable
        bookings={bookings}
        onCancel={handleCancel}
        onDownload={handleDownload}
      />
    </div>
  );
}
