import type { AxiosResponse } from 'axios';
import api from '../../../api/api';

/* ================= TYPES ================= */

export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

export interface Vehicle {
  _id: string;
  companyId: string;

  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  manufactureYear: number;
  totalSeats: number;

  status: VehicleStatus;
  lastMaintenanceDate?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface VehiclePayload {
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  manufactureYear: number;
  totalSeats: number;
  companyId: string;
}

/* ================= SERVICE ================= */

export const vehiclesService = {
  /* ===== GET ALL VEHICLES BY COMPANY ===== */
  async getByCompany(companyId: string): Promise<Vehicle[]> {
    const res: AxiosResponse<{ data: Vehicle[] }> = await api.get(
      `/vehicles/company/${companyId}`,
    );

    return res.data.data;
  },

  /* ===== CREATE VEHICLE ===== */
  async create(payload: VehiclePayload): Promise<Vehicle> {
    const res: AxiosResponse<{ data: Vehicle }> = await api.post(
      '/vehicles',
      {
        vehicleNumber: payload.vehicleNumber,
        vehicleType: payload.vehicleType,
        brand: payload.brand,
        manufactureYear: payload.manufactureYear,
        totalSeats: payload.totalSeats,
        companyId: payload.companyId,
      },
    );

    return res.data.data;
  },

  /* ===== UPDATE VEHICLE ===== */
  async update(id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> {
    const res: AxiosResponse<{ data: Vehicle }> = await api.patch(
      `/vehicles/${id}`,
      payload,
    );

    return res.data.data;
  },

  /* ===== DELETE VEHICLE ===== */
  async delete(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  /* ===== GET VEHICLE DETAIL ===== */
  async getById(id: string): Promise<Vehicle> {
    const res: AxiosResponse<{ data: Vehicle }> = await api.get(
      `/vehicles/${id}`,
    );

    return res.data.data;
  },
};
