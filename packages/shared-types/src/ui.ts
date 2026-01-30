// src/features/admin-auth/types.ts

import { BookingStatus, UserRole } from "./enums";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
    companyId?: string;
  };
}

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
import type { LucideIcon } from 'lucide-react';

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
