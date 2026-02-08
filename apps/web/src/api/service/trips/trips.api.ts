  import type { Trip, TripResponse } from '@obtp/shared-types';
  // src/api/service/trip/apiTrip.ts




import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
} from 'axios';
import api from '../../../../../portal/src/api/api';

const API_URL = import.meta.env.VITE_API_URLv1 as string;

if (!API_URL) {
  throw new Error('❌ Missing VITE_API_URL in .env');
}

const api1: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================= AUTH INTERCEPTOR ================= */
api1.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('access_token');

  const token = adminToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= RESPONSE INTERCEPTOR ================= */
api1.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
      }
      console.error(
        'API Error:',
        error.response.status,
        error.response.data,
      );
    } else {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api1;

export const tripApi = {
  async search(fromId: string, toId: string, date: string): Promise<Trip[]> {
    const res = await api1.get<Trip[]>('/trips/search', {
      params: { fromId, toId, date },
    });
    return res.data;
  },
 async searchTrips(
    from: string,
    to: string,
    date?: string,
  ): Promise<Trip[]> {
    if (!from || !to) {
      throw new Error('Missing from or to');
    }

    const res = await api1.get<Trip[]>('/trips', {
      params: {
        from,
        to,
        date,
      },
    });

    return res.data;
  },
  async searchByRoute(fromId: string): Promise<Trip[]> {
    const res = await api1.get<Trip[]>('/trips/search/route', {
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
  
  getManagementTrips(companyId?: string) {
    return api.get('/trips/management/all', {
      params: companyId ? { companyId } : {},
    });
  },

  createTrip(payload: any) {
    return api.post('/trips', payload);
  },

  cancelTrip(id: string) {
    return api.patch(`/trips/${id}/cancel`);
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