import type { Trip } from '@obtp/shared-types';
import api from '../../api';
// src/api/service/trip/apiTrip.ts


export const tripApi = {
  search(fromId: string, toId: string, date: string) {
    return api
      .get<Trip[]>('/trips/search', {
        params: { from: fromId, to: toId, date },
      })
      .then(res => res.data);
  },
   searchByRoute(fromId: string, toId: string) {
    return api.get('/trips/search/route', {
      params: { fromId, toId },
    });
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