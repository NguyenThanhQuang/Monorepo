// [CONTRACT] Entity models – PURE TS

import { LocationType } from './enums';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Location {
  id: string; // ✅ BẮT BUỘC
  name: string;
  slug?: string;
  province: string;
  district?: string;
  fullAddress: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  type: LocationType;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

