import { CompanyStatus, LocationType, UserRole, VehicleStatus } from "./enums";

/**
 * Interface chuẩn GeoJSON cho tọa độ không gian.
 * Theo chuẩn MongoDB: [longitude, latitude]
 */
export interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number];
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

  companyId: string;
  vehicleNumber: string;
  type: string;
  description?: string;
  status: VehicleStatus;

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

// Sub-Interface cho ghế trong chuyến đi
export interface TripSeat {
  seatNumber: string; // A01, B02...
  status: SeatStatus;
  bookingId?: string; // Ref ID nếu đã book
}

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
}

export interface Trip {
  id: string;
  _id: string;

  companyId: string;
  vehicleId: string;

  route: RouteInfo;

  departureTime: Date;
  expectedArrivalTime: Date;

  price: number;
  status: TripStatus;

  seats: TripSeat[]; // Mảng phẳng chứa trạng thái ghế
  availableSeatsCount: number; // Field computed hoặc cached (quan trọng cho search)

  // Recurrence logic fields
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

  userId?: string; // Nếu là user đã login
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
