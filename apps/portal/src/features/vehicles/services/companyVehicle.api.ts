import type { AxiosError } from "axios";
import api from "../../../api/api";
import type { VehiclePayload } from "../types/vehicle.types";
import type { CreateVehiclePayload, UpdateVehiclePayload, Vehicle } from "@obtp/shared-types";

/* ================= COMMON RESPONSE ================= */

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const handleApiError = (error: AxiosError<any>): never => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Unknown error";

  throw new Error(message);
};

// API calls without auth context (for hooks)
export const vehiclesApi = {
  getMyCompanyVehicles: async () => {
    const res = await api.get('/vehicles');
    return res.data;
  },

  createVehicle: async (payload: CreateVehiclePayload) => {
    const res = await api.post('/vehicles', payload);
    return res.data;
  },

  updateVehicle: async (id: string, payload: UpdateVehiclePayload) => {
    const res = await api.patch(`/vehicles/${id}`, payload);
    return res.data;
  },

  deleteVehicle: async (id: string) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },
};

/* ================= VEHICLE API (with companyId) ================= */

export const companyVehicleApi = {
  async getVehicles(companyId: string): Promise<Vehicle[]|any> {
    try {
      const res = await api.get<ApiResponse<Vehicle[]>>(
        `/vehicles/company/${companyId}`
      );

      return res.data.data;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },

  async createVehicle(payload: VehiclePayload): Promise<Vehicle|any> {
    try {
      const res = await api.post<ApiResponse<Vehicle>>(
        `/vehicles`,
        payload
      );

      return res.data.data;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },

  async updateVehicle(
    id: string,
    payload: VehiclePayload
  ): Promise<Vehicle|any> {
    try {
      const res = await api.patch<ApiResponse<Vehicle>>(
        `/vehicles/${id}`,
        payload
      );

      return res.data.data;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },

  async deleteVehicle(id: string): Promise<boolean|any> {
    try {
      await api.delete(`/vehicles/${id}`);
      return true;
    } catch (error) {
      handleApiError(error as AxiosError);
    }
  },
};