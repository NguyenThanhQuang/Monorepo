import { http } from "../core/http-client";
import {
  Booking,
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

  getCompanyBookings: async (): Promise<Booking[]> => {
    const response = await http.get<Booking[]>("/bookings/company");
    // Response trực tiếp là mảng Booking, không phải ApiResponse
    return response ?? [];
  },

  getById: async (id: string) => {
    const response = await http.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },
};