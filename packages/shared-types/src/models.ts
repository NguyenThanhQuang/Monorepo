import { LocationType } from "./enums";

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
