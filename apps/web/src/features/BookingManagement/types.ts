export type BookingStatus = 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface BookingUI {
  id: string;
  ticketCode?: string;

  passengerName: string;
  phone: string;

  route: string;
  departureTime: string;

  seatNumber: string;
  price: number;

  status: BookingStatus;
  bookingDate: string;
  vehiclePlate?: string;
}
