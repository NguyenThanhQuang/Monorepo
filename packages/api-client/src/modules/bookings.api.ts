import {
  Booking,
  ConfirmBookingPayload,
  CreateBookingPayload,
  LookupBookingPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const bookingsApi = {
  // Step 1: Giữ chỗ (Tạo Booking Status: HELD)
  createHold: (payload: CreateBookingPayload) => {
    return http.post<Booking>("/bookings/hold", payload);
  },

  // Step 2: Confirm (Thường gọi nội bộ sau Payment hoặc Admin xác nhận tay)
  manualConfirm: (id: string, payload: ConfirmBookingPayload) => {
    return http.post<Booking>(`/bookings/confirm/${id}`, payload);
  },

  cancel: (id: string) => {
    return http.delete<Booking>(`/bookings/${id}`);
  },

  // Tra cứu vé cho khách vãng lai
  lookup: (payload: LookupBookingPayload) => {
    return http.post<Booking>("/bookings/lookup", payload);
  },
};
