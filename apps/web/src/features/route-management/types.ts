export type TripStatusUI = 'scheduled' | 'running' | 'completed' | 'cancelled';

export interface RouteManagementTrip {
  id: string;

  fromName: string;
  toName: string;

  departureTime: string; // HH:mm
  arrivalTime: string;   // HH:mm
  date: string;          // yyyy-mm-dd

  vehiclePlate: string;

  price: number;
  totalSeats: number;
  availableSeats: number;

  status: TripStatusUI;
}
