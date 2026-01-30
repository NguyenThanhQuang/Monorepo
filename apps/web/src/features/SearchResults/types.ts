export interface TripCardVM {
  id: string;
  companyName: string;
  companyLogo?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  from: string;
  to: string;
  price: number;
  availableSeats: number;
  vehicleType: string;
}
