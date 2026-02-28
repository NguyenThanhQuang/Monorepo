// types/booking.ts

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "held";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface BookingPassenger {
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  seatNumber: string;
  // backend có thể snapshot price theo từng hành khách
  price?: number;
}

export interface Booking {
  _id: string;

  // backend có thể null/undefined nếu booking guest
  userId?: string;

  tripId: string;

  // backend flow hold dùng passengers
  passengers?: BookingPassenger[];

  // một số màn hình cũ của bạn có thể dùng selectedSeats / seats
  selectedSeats?: string[];
  seats?: string[];

  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;

  totalAmount: number;
  status: BookingStatus;

  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  heldUntil?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ Payload đúng với backend: POST /bookings/hold
 * controller + service của bạn đang dùng payload.tripId + payload.passengers + contact*
 */
export interface CreateHoldPayload {
  tripId: string;
  passengers: BookingPassenger[];
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

/**
 * (Tùy bạn có dùng hay không)
 * Payload kiểu "UI legacy" trước đây: selectedSeats + passengerInfo
 * Giữ lại để khỏi vỡ các màn hình cũ đang import CreateBookingPayload.
 */
export interface CreateBookingPayloadLegacy {
  tripId: string;
  selectedSeats: string[];
  passengerInfo: {
    name: string;
    phone: string;
    email: string;
    idNumber: string;
  }[];
}

/**
 * ✅ Alias để giảm đau: nếu codebase bạn đang import CreateBookingPayload,
 * thì cho nó trỏ về CreateHoldPayload (flow hiện tại của backend).
 *
 * Nếu bạn vẫn còn chỗ dùng legacy, đổi import sang CreateBookingPayloadLegacy.
 */
export type CreateBookingPayload = CreateHoldPayload;
