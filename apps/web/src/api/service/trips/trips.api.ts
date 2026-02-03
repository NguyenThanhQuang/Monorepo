  import type { Trip } from '@obtp/shared-types';
  import api from '../../api';
  // src/api/service/trip/apiTrip.ts





export const tripApi = {
  async search(fromId: string, toId: string, date: string): Promise<Trip[]> {
    const res = await api.get<Trip[]>('/trips/search', {
      params: { fromId, toId, date },
    });
    return res.data;
  },

  async searchByRoute(fromId: string): Promise<Trip[]> {
    const res = await api.get<Trip[]>('/trips/search/route', {
      params: { fromId },
    });
    return res.data;
  },
  searchByFrom(fromId: string) {
  return api
    .get<Trip[]>('/trips/search/from', {
      params: { fromId },
    })
    .then(res => res.data);
},
};


  
  export const TripsApi = {
    getManagementTrips(companyId: string): Promise<Trip[]> {
      return api
        .get('/trips/management/all', {
          params: { companyId },
        })
        .then(res => res.data);
    },
  };
  export interface TripSearchParams {
    fromId: string;
    toId: string;
    date: string;
  }

  export async function searchTrips(params: TripSearchParams) {
    const res = await api.get('/api/trips/search', {
      params,
    });

    return res.data;
  }