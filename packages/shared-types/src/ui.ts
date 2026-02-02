import type { LucideIcon } from "lucide-react";
import { BookingStatus, CompanyStatus, TripStatus, UserAccountStatus, UserRole } from "./enums";


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
export interface CompanyUI {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;

  vehicles: number; // tạm 0 nếu backend chưa có
  trips: number;
  rating: number;
  revenue: number;

  status: CompanyStatus,
  joinDate: string;
}
// src/features/admin-auth/types.ts

// src/features/system-dashboard/types.ts
export interface SystemDashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalTrips: number;
  totalRevenue: number;
}

export interface CompanyRow {
  id: string;
  name: string;
  vehicles: number;
  trips: number;
  revenue: string;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
}



export type SettingsTab =
  | 'general'
  | 'company'
  | 'notifications'
  | 'security'
  | 'payment';

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxCode?: string;
  website?: string;
  logo?: string;
}

export interface PricingSettings {
  baseRate: number;
  perKmRate: number;
  cancellationFee: number;
  lateCancellationHours: number;
  childDiscountPercent: number;
  studentDiscountPercent: number;
}

export interface PaymentSettings {
  vnpayEnabled: boolean;
  momoEnabled: boolean;
  zalopayEnabled: boolean;
  bankTransferEnabled: boolean;
  cashEnabled: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
}


export type UserRoleUI = UserRole | "driver";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalTrips: number;
  totalSpent: number;
  status: UserAccountStatus;
  role: UserRoleUI;
}

/* ---------- Company Summary ---------- */
export interface CompanyDashboardCompany {
  id: string;
  name: string;
  code: string;
  status: CompanyStatus;

  stats: {
    totalTrips: number;
    totalVehicles: number;
    totalBookings: number;
    totalRevenue: number;
  };
}

/* ---------- Vehicle Card ---------- */
export interface CompanyDashboardVehicle {
  id: string;
  vehicleNumber: string;
  type: string;
  totalSeats: number;
  activeTrips: number;
}

/* ---------- Trip Table ---------- */

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

/* ---------- Revenue Chart ---------- */
export interface CompanyDashboardRevenuePoint {
  date: string;   // yyyy-mm-dd
  revenue: number;
  bookings: number;
}

/* ---------- API Response ---------- */
export interface CompanyDashboardResponse {
  company: CompanyDashboardCompany;

  vehicles: CompanyDashboardVehicle[];

  upcomingTrips: CompanyDashboardTrip[];

  revenueChart: CompanyDashboardRevenuePoint[];
}
export type ReviewStatus = 'published' | 'hidden';

export interface ReviewDTO {
  _id: string;
  displayName: string;
  companyName?: string;
  routeName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  tripDate?: string;
  isVisible: boolean;
  likeCount?: number;
}

export interface ReviewUI {
  id: string;
  userName: string;
  companyName: string;
  route: string;
  rating: number;
  comment: string;
  date: string;
  tripDate?: string;
  status: ReviewStatus;
  likes: number;
}
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
export interface RouteCardVM {
  from: string;
  to: string;
  tripsPerDay: number;
  minPrice: number;
  durationText: string;
  image: string;
  gradient: string;
}
