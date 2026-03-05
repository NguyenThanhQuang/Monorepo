import type { TripCardVM, TripPublicResponse } from '@obtp/shared-types';

export function mapTripToCardVM(trip: TripPublicResponse): TripCardVM {
  return {
    id: trip._id,
    companyName: trip.company.name,
    companyLogo: trip.company.logoUrl,
    departureTime: new Date(trip.departureTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    arrivalTime: new Date(trip.expectedArrivalTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: '', // tính ở UI hoặc BE sau
    from: trip.fromLocation.name,
    to: trip.toLocation.name,
    price: trip.price,
    availableSeats: trip.availableSeatsCount,
    vehicleType: trip.vehicle.type,
  };
}
