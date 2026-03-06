import apiService from "../common/apiService";
import { API_ENDPOINTS } from "../common/configService";

const unwrap = (resData: any) => resData?.data ?? resData;

export type LiveLocation = {
  lat: number | null;
  lng: number | null;
  heading?: number | null;
  speed?: number | null;
  updatedAt?: string | null;
};

export const trackingService = {
  async getTripRoute(tripId: string) {
    const url = API_ENDPOINTS.TRIPS.ROUTE.replace(":id", String(tripId));
    const res = await apiService.get(url);
    const payload = unwrap(res.data);
    return (payload?.data ?? payload) as {
      polyline: string;
      distance: number;
      duration: number;
    };
  },

  async getTripLocation(tripId: string): Promise<LiveLocation> {
    const url = API_ENDPOINTS.TRIPS.LOCATION.replace(":id", String(tripId));
    const res = await apiService.get(url);
    const payload = unwrap(res.data);
    return (payload?.data ?? payload) as LiveLocation;
  },

  async updateTripLocation(
    tripId: string,
    payload: { lat: number; lng: number; heading?: number; speed?: number },
  ) {
    const url = API_ENDPOINTS.TRIPS.LOCATION.replace(":id", String(tripId));
    const res = await apiService.post(url, payload);
    const data = unwrap(res.data);
    return data?.data ?? data;
  },
};
