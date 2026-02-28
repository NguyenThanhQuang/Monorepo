import { BookingStatus, PaymentStatus, type Booking } from "@obtp/shared-types";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const formatDate = (dateStr: string | Date) =>
  new Date(dateStr).toLocaleDateString("vi-VN");

export const exportBookingsToExcel = (bookings: Booking[]) => {
  const exportData = bookings.map((b) => {
    const trip = b.tripId as any;
    const routeName = trip?.route
      ? `${trip.route.fromLocationId?.name || ""} → ${trip.route.toLocationId?.name || ""}`
      : "N/A";

    return {
      "Mã vé": b.ticketCode || "N/A",
      "Khách hàng": b.contactName,
      SĐT: b.contactPhone,
      "Số ghế": b.passengers.map((p) => p.seatNumber).join(", "),
      "Số lượng vé": b.passengers.length,
      "Tổng tiền": b.totalAmount,
      "Trạng thái":
        b.status === BookingStatus.CONFIRMED
          ? "Đã xác nhận"
          : b.status === BookingStatus.HELD
            ? "Đang giữ"
            : b.status === BookingStatus.CANCELLED
              ? "Đã hủy"
              : "Chờ xử lý",
      "Thanh toán":
        b.paymentStatus === PaymentStatus.PAID
          ? "Đã thanh toán"
          : b.paymentStatus === PaymentStatus.PENDING
            ? "Chờ thanh toán"
            : "N/A",
      "Ngày đặt": formatDate(b.createdAt),
      "Tuyến đường": routeName,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, "Chi tiết vé");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(
    data,
    `Bao-cao-doanh-thu-${formatDate(new Date()).replace(/\//g, "-")}.xlsx`,
  );
};
