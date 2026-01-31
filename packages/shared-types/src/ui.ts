import type { LucideIcon } from "lucide-react";
import { BookingStatus } from "./enums";

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

export interface CompanyDashboardStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  change?: string;
}

export type CompanyTripStatus =
  | "running"
  | "aboutToDepart"
  | "completed"
  | "cancelled";

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
