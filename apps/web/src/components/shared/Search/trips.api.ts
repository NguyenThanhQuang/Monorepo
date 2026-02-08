import api from "../../../../../portal/src/api/api";



export const tripApi = {
  async searchTrips(fromId: string, toId: string, date: string) {
    const res = await api.get(`/trips/search`, {
      params: { fromId, toId, date },
    });

    return res.data.data || res.data;
  },
};
