import type { BookingUI } from "../../../features/BookingManagement/types";
import api from "../../api";


export async function fetchBookings(): Promise<BookingUI[]> {
  const res = await api.get('/bookings'); 
  return res.data;
}

export async function cancelBooking(id: string) {
  return api.delete(`/bookings/${id}`);
}
