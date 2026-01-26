import { LucideIcon } from 'lucide-react';

export interface CompanyDashboardStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  change?: string;
}

export type CompanyTripStatus =
  | 'running'
  | 'aboutToDepart'
  | 'completed'
  | 'cancelled';

export interface CompanyDashboardTrip {
  id: string;
  routeName: string;

  departureDate: string;
  departureTime: string;

  vehicleNumber: string;

  bookedSeats: number;
  totalSeats: number;

  status: CompanyTripStatus;
}
