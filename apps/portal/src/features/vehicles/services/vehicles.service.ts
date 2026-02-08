import type { AxiosResponse } from 'axios';
import api from '../../../api/api';
import type { Vehicle } from '@obtp/shared-types';

/* ================= TYPES ================= */

export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

export interface VehiclePayload {
  vehicleNumber: string;
  type: string;
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
        type: payload.type,
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