import { http } from "../core/http-client";
import {
  Booking,
  BookingUI,
  ConfirmBookingPayload,
  CreateBookingPayload,
  LookupBookingPayload,
} from "@obtp/shared-types";

// Interface cho response chuẩn của API
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const bookingsApi = {
  // Lấy tất cả bookings (admin)
  getAll: async (): Promise<BookingUI[]> => {
    const response = await http.get<BookingUI[]>("/bookings");
    return response ?? [];
  },

  // Lấy bookings của user hiện tại
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await http.get<Booking[]>("/users/me/bookings");
    return response ?? [];
  },

  // Lấy bookings của company (company admin)
  getCompanyBookings: async (): Promise<Booking[]> => {
    const response = await http.get<Booking[]>("/bookings/company");
    return response ?? [];
  },

  createHold: async (payload: CreateBookingPayload) => {
    const response = await http.post<ApiResponse<Booking>>("/bookings/hold", payload);
    return response.data;
  },

  manualConfirm: async (id: string, payload: ConfirmBookingPayload) => {
    const response = await http.post<ApiResponse<Booking>>(
      `/bookings/confirm/${id}`,
      payload
    );
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await http.delete<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  lookup: async (payload: LookupBookingPayload) => {
    const response = await http.post<ApiResponse<Booking>>(
      "/bookings/lookup",
      payload
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await http.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },
};