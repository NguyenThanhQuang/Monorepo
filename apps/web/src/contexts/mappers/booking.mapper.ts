import type { BookingUI } from "../../features/BookingManagement/types";

export function mapBookingFromApi(raw: any): BookingUI {
  return {
    id: raw._id,
    ticketCode: raw.ticketCode,

    passengerName: raw.contactName,
    phone: raw.contactPhone,

    route: `${raw.tripId?.route?.fromLocationId?.name} → ${raw.tripId?.route?.toLocationId?.name}`,

    departureTime: new Date(
      raw.tripId?.departureTime,
    ).toLocaleString('vi-VN'),

    seatNumber: raw.passengers.map((p: any) => p.seatNumber).join(', '),
    price: raw.totalAmount,

    status: raw.status,
    bookingDate: new Date(raw.createdAt).toLocaleString('vi-VN'),

    vehiclePlate: raw.tripId?.vehicleId?.vehicleNumber,
  };
}
