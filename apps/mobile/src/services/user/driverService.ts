import apiService from "../common/apiService";

const unwrap = (resData: any) => resData?.data ?? resData;

export type DriverProfile = {
  _id?: string;
  userId: string;
  licenseNumber: string;
  idCardNumber: string;
  experienceYears?: number;
  status?: string;
};

class DriverService {
  async register(payload: {
    licenseNumber: string;
    idCardNumber: string;
    experienceYears?: number;
  }) {
    const res = await apiService.post<any>("/drivers/register", payload);
    return unwrap(res.data);
  }

  async getMyProfile(): Promise<DriverProfile | null> {
    const res = await apiService.get<any>("/drivers/me");
    const data = unwrap(res.data);
    return data?.data ?? data ?? null;
  }
}

export const driverService = new DriverService();
