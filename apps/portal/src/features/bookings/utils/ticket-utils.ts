import type { Booking } from "@obtp/shared-types";
import { saveAs } from "file-saver";

export const downloadTicketAsText = (booking: Booking, companyName: string) => {
  const trip = booking.tripId as any;
  const routeName = trip?.route
    ? `${trip.route.fromLocationId?.name} → ${trip.route.toLocationId?.name}`
    : "N/A";
  const departureTime = trip?.departureTime
    ? new Date(trip.departureTime).toLocaleString("vi-VN")
    : "N/A";
  const seats = booking.passengers
    .map((p) => `${p.seatNumber} (${p.name})`)
    .join(", ");

  const content = `
=========================================
          VÉ XE KHÁCH ĐIỆN TỬ
          NHÀ XE: ${companyName.toUpperCase()}
=========================================
MÃ VÉ       : ${booking.ticketCode}
TRẠNG THÁI  : ${booking.status}
-----------------------------------------
HÀNH KHÁCH  : ${booking.contactName}
SỐ ĐIỆN THOẠI: ${booking.contactPhone}
-----------------------------------------
TUYẾN ĐƯỜNG : ${routeName}
KHỞI HÀNH   : ${departureTime}
BIỂN SỐ XE  : ${trip?.vehicleId?.vehicleNumber || "Đang cập nhật"}
-----------------------------------------
GHẾ ĐÃ CHỌN : ${seats}
TỔNG TIỀN   : ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalAmount)}
-----------------------------------------
Cảm ơn quý khách đã sử dụng dịch vụ!
=========================================
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `VeXe-${booking.ticketCode}.txt`);
};
