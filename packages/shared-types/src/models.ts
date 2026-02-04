import { CompanyStatus, LocationType, UserRole, VehicleStatus } from "./enums";

/**
 * Interface chuẩn GeoJSON cho tọa độ không gian.
 * Theo chuẩn MongoDB: [longitude, latitude]
 */
export interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number];
}
// src/pages/ticket-lookup/types.ts

export interface TicketLookupForm {
  identifier: string;
  contactPhone: string;
}

export interface TripSeat {
  seatNumber: string;
  status: SeatStatus;
  floor?: number;
  bookingId?: string;
  position?: { row: number; col: number; x?: number; y?: number };
}

export interface TripDetailResponse {
  _id: string;
  price: number;
  departureTime: string;
  expectedArrivalTime: string;
  companyId: {
    name: string;
  };
  vehicleId: {
    type: string;
    totalSeats: number;
  };
  route: {
    fromLocationId: { name: string };
    toLocationId: { name: string };
  };
  seats: TripSeat[];
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
}

export interface TicketLookupResponse {
  _id: string;
  ticketCode: string;
  status: "HELD" | "CONFIRMED" | "CANCELLED";

  contactName: string;
  contactPhone: string;

  totalAmount: number;

  passengers: {
    seatNumber: string;
    price: number;
  }[];

  tripId: {
    departureTime: string;
    route: {
      fromLocationId: {
        name: string;
      };
      toLocationId: {
        name: string;
      };
    };
    companyId: {
      name: string;
      logoUrl?: string;
    };
  };
}

export interface Location {
  _id: string;
  id: string;
  name: string;

  slug: string;
  province: string;
  district?: string;
  fullAddress: string;
  location: GeoJsonPoint;
  type: LocationType;
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  nameVi: string;
  nameEn: string;
  image: string;
  routes: number;
  popular: boolean;
  description?: string;
  popularRoutes?: Array<{
    from: string;
    to: string;
    duration: string;
    price: string;
    trips: number;
  }>;
}

export interface User {
  id: string; // Mapping from _id via repository wrapper
  _id: string; // Mongoose original ID

  name: string;
  email: string;
  phone: string;
  passwordHash?: string; // Internal usage only (select: false)

  roles: UserRole[];
  companyId?: string; // Reference ID stored as string

  isEmailVerified: boolean;
  isBanned: boolean;

  // Timestamps
  lastLoginDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Tokens (Internal - Should usually be selected false)
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  accountActivationToken?: string;
  accountActivationExpires?: Date;
}

export interface Company {
  id: string; // ObjectId
  name: string;
  code: string; // Unique identifier (VD: FUTA, THANHBUOI)
  address?: string;
  phone?: string;
  email?: string; // Email liên hệ chung của công ty
  description?: string;
  logoUrl?: string;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SeatMapLayout = (string | null)[][];

export interface SeatMap {
  rows: number;
  cols: number;
  layout: SeatMapLayout;
}

export interface Vehicle {
  id: string;
  _id: string;
amenities?: string[]; // 
  companyId: string;
  vehicleNumber: string;
  type: string;
  description?: string;
  status: VehicleStatus;
  vehicle?: Pick<
    Vehicle,
    'id' | '_id' | 'vehicleNumber' | 'amenities' | 'type'
  >;
  floors: number;
  seatRows: number;
  seatColumns: number;
  aislePositions: number[];

  totalSeats: number;
  seatMap?: SeatMap;
  seatMapFloor2?: SeatMap;

  createdAt: Date;
  updatedAt: Date;
}

import { SeatStatus, TripStatus, TripStopStatus } from "./enums";

export interface TripStopInfo {
  locationId: string; // Ref Location
  expectedArrivalTime: Date;
  expectedDepartureTime?: Date;
  status: TripStopStatus;
}

export interface RouteInfo {
  fromLocationId: string;
  toLocationId: string;
  stops: TripStopInfo[];
  duration?: number; // Minutes
  distance?: number; // Meters or KM
  // ✅ FIX: dùng cho UI
  from?: Location;
  to?: Location;
}

export interface Trip {
  id: string;
  _id: string;

  companyId: string;

  vehicleId: string; // backend ref
  vehicle?: {
    id: string;
    vehicleNumber: string;
  }; // ✅ UI dùng

  route: RouteInfo;

  departureTime: Date;
  expectedArrivalTime: Date;

  price: number;
  status: TripStatus;

  seats: TripSeat[];
  availableSeatsCount: number;
  totalSeats: number;

  isRecurrenceTemplate: boolean;
  isRecurrenceActive: boolean;
  recurrenceParentId?: string;

  createdAt: Date;
  updatedAt: Date;
}

import { BookingStatus, PaymentStatus } from "./enums";

export interface PassengerInfo {
  name: string;
  phone: string;
  seatNumber: string; // Số ghế (A01, B02...)
  price: number; // Giá vé tại thời điểm đặt (Snapshot)
}

export interface Booking {
  id: string;
  _id: string;

  userId?: string;
  companyId: string;
  tripId: string;

  // Thông tin liên hệ đặt vé
  contactName: string;
  contactPhone: string;
  contactEmail?: string;

  // Chi tiết vé
  passengers: PassengerInfo[];
  totalAmount: number;

  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;

  ticketCode?: string; // Mã vé (khi đã confirm)
  paymentOrderCode?: number; // Mã đơn hàng payment gateway
  paymentGatewayTransactionId?: string;

  // TTL Management
  bookingTime: Date;
  heldUntil?: Date; // Thời hạn giữ ghế

  // Reference Review (Sau khi hoàn thành chuyến đi)
  reviewId?: string;
  isReviewed?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

import { PaymentMethod } from "./enums";

export interface PaymentTransaction {
  id: string;
  _id: string;

  orderCode: number; // Unique int required by PayOS
  bookingId: string;
  amount: number;

  paymentMethod: string | PaymentMethod;
  status: PaymentStatus;

  // Data thô từ gateway để debug
  gatewayTransactionId?: string;
  transactionDateTime?: string; // string ISO/Format from gateway
  rawResponse?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

// Review Entity
export interface Review {
  id: string;
  _id: string;

  userId?: string; // Có thể null nếu Guest review hoặc logic xóa user

  bookingId: string; // Unique
  tripId: string; // Reference
  companyId: string; // Reference (Denormalized)

  displayName: string; // Tên hiển thị (User thật hoặc Tên khách)

  rating: number; // 1-5
  comment?: string;

  isAnonymous: boolean; // Nếu true -> Frontend tự mask tên

  editCount: number;
  lastEditedAt?: Date;

  isVisible: boolean; // Moderation flag

  createdAt: Date;
  updatedAt: Date;
}
/// bổ sung ui
export interface LocationSuggestion {
  id: string;
  name: string;
  province: string;
  type: string;
}
// @obtp/shared-types

export interface AdminBookingResponse {
  id: string;
  ticketCode?: string;

  contactName: string;
  contactPhone: string;

  routeName: string; // "TP.HCM → Đà Lạt"
  departureDate: string; // ISO
  departureTime: string; // "05:00"

  seatNumbers: string[]; // ["A15", "A16"]

  vehiclePlate?: string;

  totalAmount: number;

  status: BookingStatus;

  createdAt: Date;
}
export interface CompanyStats {
  totalTrips: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue?: number;
}
// Trong shared-types.ts hoặc ngay trong component
export interface SimpleVehicle {
  _id: string;
  id: string;
  licensePlate: string;    // Biển số xe
  vehicleNumber?: string;  // Có thể là biển số
  name?: string;          // Tên xe (nếu có)
  brand?: string;         // Hãng xe
  model?: string;         // Dòng xe
  type?: string;          // Loại xe: sleeper, seater, vip
  capacity: number;       // Số ghế
  totalSeats?: number;    // Cũng là số ghế
  companyId: string;
  status: string;
}
export interface Company {
  _id:string;
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  logoUrl?: string;
  status: CompanyStatus;

  stats?: CompanyStats; // ✅ FIX

  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  isBanned: boolean;
  createdAt: string;

  // FE computed (optional)
  totalTrips?: number;
  totalSpent?: number;
}
