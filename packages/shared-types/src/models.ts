import { CompanyStatus, LocationType, UserRole } from "./enums";

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
