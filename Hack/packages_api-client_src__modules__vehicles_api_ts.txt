import {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  Vehicle,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const vehiclesApi = {
  findAll: (companyId?: string) => {
    return http.get<Vehicle[]>("/vehicles", { params: { companyId } });
  },

  getOne: (id: string) => {
    return http.get<Vehicle>(`/vehicles/${id}`);
  },

  create: (payload: CreateVehiclePayload) => {
    return http.post<Vehicle>("/vehicles", payload);
  },

  update: (id: string, payload: UpdateVehiclePayload) => {
    return http.patch<Vehicle>(`/vehicles/${id}`, payload);
  },

  delete: (id: string) => {
    return http.delete<{ message: string }>(`/vehicles/${id}`);
  },
};
