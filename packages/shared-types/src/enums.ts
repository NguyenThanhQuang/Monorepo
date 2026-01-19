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

// Bổ sung Company Status cho login logic check
export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  REJECTED = "rejected",
}

export enum LocationType {
  BUS_STATION = "bus_station",
  COMPANY_OFFICE = "company_office",
  PICKUP_POINT = "pickup_point",
  REST_STOP = "rest_stop",
  CITY = "city",
  OTHER = "other",
}
