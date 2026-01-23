export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

// AUTH & USERS ENUMS
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  STAFF = "staff",
  COMPANY_ADMIN = "company_admin",
}

export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

export enum LocationType {
  BUS_STATION = "bus_station",
  COMPANY_OFFICE = "company_office",
  PICKUP_POINT = "pickup_point",
  REST_STOP = "rest_stop",
  CITY = "city",
  OTHER = "other",
}

export enum UserAccountStatus {
  ACTIVE = "active",
  BANNED = "banned",
  UNVERIFIED = "unverified",
}

export enum VehicleStatus {
  ACTIVE = "active",
  MAINTENANCE = "maintenance",
  INACTIVE = "inactive",
}

export enum TripStatus {
  SCHEDULED = "scheduled",
  DEPARTED = "departed",
  ARRIVED = "arrived",
  CANCELLED = "cancelled",
}

export enum SeatStatus {
  AVAILABLE = "available",
  HELD = "held", // Đang giữ chỗ (lúc đang thanh toán)
  BOOKED = "booked", // Đã đặt thành công
  LOCKED = "locked", // Khóa bởi admin hoặc không bán
}

export enum TripStopStatus {
  PENDING = "pending",
  ARRIVED = "arrived",
  DEPARTED = "departed",
  SKIPPED = "skipped",
}

export enum BookingStatus {
  PENDING = "pending", // Mới khởi tạo, chưa giữ chỗ xong
  HELD = "held", // Đã giữ ghế thành công (chờ thanh toán)
  CONFIRMED = "confirmed", // Đã thanh toán, xuất vé
  CANCELLED = "cancelled", // Hủy do user hoặc admin
  EXPIRED = "expired", // Hết hạn giữ chỗ mà không thanh toán
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}
