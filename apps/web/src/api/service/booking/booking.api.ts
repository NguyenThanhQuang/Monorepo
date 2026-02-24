import type { Booking, BookingUI, ConfirmBookingPayload, CreateBookingPayload, LookupBookingPayload } from "@obtp/shared-types";
import api from "../../../../../portal/src/api/api";


export async function fetchBookings(): Promise<BookingUI[]> {
  const res = await api.get('/bookings'); 
  return res.data;
}



export const bookingsApi = {
  hold(payload: CreateBookingPayload) {
    return api.post('/bookings/hold', payload);
  },

  confirm(id: string, payload: ConfirmBookingPayload) {
    return api.post(`/bookings/confirm/${id}`, payload);
  },

  cancel(id: string) {
    return api.delete(`/bookings/${id}`);
  },
 
  lookup(payload: LookupBookingPayload) {
    return api.post('/bookings/lookup', payload);
  },

getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get<any>("/users/me/bookings");
      
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
  getCompanyBookings() {
  return api.get('/bookings/company');
}

};
export async function getCompanyBookings(): Promise<BookingUI[]> {
  const res = await api.get('/bookings/company');
  return res.data;
}

export async function cancelBooking(id: string) {
  return api.delete(`/bookings/${id}`);
}
