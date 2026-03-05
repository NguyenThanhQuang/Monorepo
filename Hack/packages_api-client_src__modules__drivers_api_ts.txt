import type {
  CreateDriverPayload,
  DriverResponse,
  UpdateDriverPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export const driversApi = {
  getCompanyDrivers: () => {
    return http.get<DriverResponse[]>("/drivers/company");
  },

  createDriver: (payload: CreateDriverPayload) => {
    return http.post<DriverResponse>("/drivers/company", payload);
  },

  updateDriver: (id: string, payload: UpdateDriverPayload) => {
    return http.patch<DriverResponse>(`/drivers/company/${id}`, payload);
  },

  deleteDriver: (id: string) => {
    return http.delete<{ message: string }>(`/drivers/company/${id}`);
  },
};
