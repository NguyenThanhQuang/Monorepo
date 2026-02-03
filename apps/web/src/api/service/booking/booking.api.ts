import type { BookingUI, ConfirmBookingPayload, CreateBookingPayload, LookupBookingPayload } from "@obtp/shared-types";
import api from "../../api";


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

  getMyBookings() {
    return api.get('/users/me/bookings');
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
