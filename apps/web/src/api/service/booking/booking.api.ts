// src/features/bookings/api/bookings.api.ts

import type { 
  Booking, 
  BookingUI, 
  ConfirmBookingPayload, 
  CreateBookingPayload, 
  LookupBookingPayload 
} from "@obtp/shared-types";
import type { AxiosResponse } from 'axios';
import api from "../api/api";

// Interface cho response từ API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export async function fetchBookings(): Promise<BookingUI[]> {
  try {
    const res = await api.get<BookingUI[]>('/bookings'); 
    return res.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export const bookingsApi = {
  hold(payload: CreateBookingPayload) {
    return api.post<ApiResponse<Booking>>('/bookings/hold', payload);
  },

  confirm(id: string, payload: ConfirmBookingPayload) {
    return api.post<ApiResponse<Booking>>(`/bookings/confirm/${id}`, payload);
  },

  cancel(id: string) {
    return api.delete<ApiResponse<null>>(`/bookings/${id}`);
  },
 
  lookup(payload: LookupBookingPayload) {
    return api.post<ApiResponse<Booking>>('/bookings/lookup', payload);
  },

  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<Booking[] | ApiResponse<Booking[]>>("/users/me/bookings");
      
      console.log('Raw response:', response);
      
      // Xử lý response
      if (!response) return [];
      
      // Nếu response.data là array trực tiếp
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Nếu response.data có cấu trúc ApiResponse với data là array
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const apiResponse = response.data as ApiResponse<Booking[]>;
        if (Array.isArray(apiResponse.data)) {
          return apiResponse.data;
        }
      }
      
      // Nếu response trực tiếp là array (trường hợp hiếm)
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      throw error;
    }
  },

  getCompanyBookings() {
    return api.get<BookingUI[]>('/bookings/company');
  }
};

export async function getCompanyBookings(): Promise<BookingUI[]> {
  try {
    const res = await api.get<BookingUI[]>('/bookings/company');
    return res.data;
  } catch (error) {
    console.error('Error fetching company bookings:', error);
    throw error;
  }
}

export async function cancelBooking(id: string) {
  try {
    return await api.delete<ApiResponse<null>>(`/bookings/${id}`);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}