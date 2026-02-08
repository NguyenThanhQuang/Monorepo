// src/api/service/vehicles/vehicles.api.ts

import axiosClient from '../../axiosClient';
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleStatus,
} from '@obtp/shared-types';

export interface VehicleResponse {
  _id: string;
  companyId: string;
  vehicleNumber: string;
  type: string;
  description?: string;
  status: VehicleStatus;
  floors: number;
  seatColumns: number;
  seatRows: number;
  aislePositions: number[];
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
}

export const vehiclesApi = {
  getMyCompanyVehicles: async () => {
    const res = await axiosClient.get('/vehicles');
    return res.data;
  },

  createVehicle: async (payload: CreateVehiclePayload) => {
    const res = await axiosClient.post('/vehicles', payload);
    return res.data;
  },

  updateVehicle: async (id: string, payload: UpdateVehiclePayload) => {
    const res = await axiosClient.patch(`/vehicles/${id}`, payload);
    return res.data;
  },

  deleteVehicle: async (id: string) => {
    const res = await axiosClient.delete(`/vehicles/${id}`);
    return res.data;
  },
};
