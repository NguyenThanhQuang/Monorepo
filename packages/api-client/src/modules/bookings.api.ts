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

  // Lấy bookings của company (company admin)
  getCompanyBookings: async (): Promise<Booking[]> => {
    const response = await http.get<Booking[]>("/bookings/company");
    return response ?? [];
  },

  // Lấy bookings của user hiện tại
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await http.get<any>("/users/me/bookings");
      
      console.log('Raw response:', response);
      
      // Xử lý response
      if (!response) return [];
      
      // Nếu response có cấu trúc { data: [...] }
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Nếu response trực tiếp là array
      if (Array.isArray(response)) {
        return response;
      }
      
      // Nếu response có cấu trúc { statusCode, message, data }
      if (response.statusCode && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      throw error;
    }
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