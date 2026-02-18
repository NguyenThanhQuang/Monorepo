// src/api/service/trips/trips.api.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
} from 'axios';
import type { Trip, Location, Company, Vehicle } from '@obtp/shared-types';

/* ================= BASE URL ================= */

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
  throw new Error('❌ Missing VITE_API_URL in .env');
}

/* ================= TYPES ================= */

export interface TripResponse {
  success: boolean;
  data: Trip[];
  count?: number;
  message?: string;
}

export interface TripDetailResponse {
  success: boolean;
  data: Trip;
  message?: string;
}

export interface TripSearchParams {
  fromId: string;
  toId: string;
  date: string;
}

export interface TripSearchByProvincesParams {
  from: string;
  to: string;
  date: string;
}

/* ================= AXIOS INSTANCE ================= */

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('access_token');
  const token = adminToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      console.error(
        'API Error:',
        error.response.status,
        error.response.data,
      );

      if (error.response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }

      // Log chi tiết lỗi 500 để debug
      if (error.response.status === 500) {
        console.error('Server Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          data: error.config?.data,
          responseData: error.response.data
        });
      }
    } else {
      console.error('Network Error:', error.message);
    }

    return Promise.reject(error);
  },
);

/* ================= VALIDATION FUNCTIONS ================= */

/**
 * Kiểm tra ID có hợp lệ không (MongoDB ObjectId)
 * MongoDB ObjectId là 24 ký tự hex (0-9, a-f)
 */
const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // ObjectId chuẩn là 24 ký tự hex
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  
  // Kiểm tra nếu ID có dấu gạch ngang (UUID format)
  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  
  return objectIdPattern.test(id) || uuidPattern.test(id);
};

/**
 * Fix ID nếu thiếu ký tự (thêm '0' vào cuối nếu cần)
 * Chỉ dùng cho debug, không nên dùng trong production
 */
const fixPossibleObjectId = (id: string): string | null => {
  if (!id) return null;
  
  // Nếu ID có 23 ký tự, thử thêm '0' vào cuối
  if (id.length === 23 && /^[0-9a-fA-F]{23}$/.test(id)) {
    console.warn('ID has 23 characters, trying with appended "0":', id + '0');
    return id + '0';
  }
  
  // Nếu ID có 22 ký tự, thử thêm '00' vào cuối
  if (id.length === 22 && /^[0-9a-fA-F]{22}$/.test(id)) {
    console.warn('ID has 22 characters, trying with appended "00":', id + '00');
    return id + '00';
  }
  
  return null;
};

/* ================= API ================= */

export const tripApi = {
  /* ===== SEARCH BY LOCATION IDS ===== */
  async search(params: TripSearchParams): Promise<Trip[]> {
    try {
      const res = await api.get<TripResponse>('/trips/search', {
        params,
      });
      return res.data.data || [];
    } catch (error) {
      console.error('Error searching trips by location IDs:', error);
      return [];
    }
  },

  /* ===== SEARCH BY PROVINCES (USED IN SEARCH PAGE) ===== */
  async searchByProvinces(fromProvince: string, toProvince: string, date: string): Promise<Trip[]> {
    try {
      const res = await api.get<TripResponse>('/trips', {
        params: {
          from: fromProvince,
          to: toProvince,
          date,
        },
      });
      return res.data.data || [];
    } catch (error) {
      console.error('Error searching trips by provinces:', error);
      return [];
    }
  },

  /* ===== SEARCH BY FROM ===== */
  async searchByFrom(fromId: string): Promise<Trip[]> {
    try {
      // Validate fromId
      if (!fromId || !isValidObjectId(fromId)) {
        console.error('Invalid fromId format:', fromId);
        return [];
      }
      
      const res = await api.get<TripResponse>('/trips/search/from', {
        params: { fromId },
      });
      return res.data.data || [];
    } catch (error) {
      console.error('Error searching trips by from:', error);
      return [];
    }
  },

  /* ===== SEARCH BY ROUTE ===== */
  async searchByRoute(fromId: string, toId?: string): Promise<Trip[]> {
    try {
      // Validate fromId
      if (!fromId || !isValidObjectId(fromId)) {
        console.error('Invalid fromId format:', fromId);
        return [];
      }
      
      // Validate toId nếu có
      if (toId && !isValidObjectId(toId)) {
        console.error('Invalid toId format:', toId);
        return [];
      }
      
      const params: any = { fromId };
      if (toId) params.toId = toId;
      
      const res = await api.get<TripResponse>('/trips/search/route', {
        params,
      });
      return res.data.data || [];
    } catch (error) {
      console.error('Error searching trips by route:', error);
      return [];
    }
  },

  /* ===== MANAGEMENT ===== */
  async getManagementTrips(companyId?: string): Promise<Trip[]> {
    try {
      // Validate companyId nếu có
      if (companyId && !isValidObjectId(companyId)) {
        console.error('Invalid companyId format:', companyId);
        return [];
      }
      
      const res = await api.get<TripResponse>('/trips/management/all', {
        params: companyId ? { companyId } : {},
      });
      return res.data.data || [];
    } catch (error) {
      console.error('Error getting management trips:', error);
      return [];
    }
  },

  /* ===== CREATE ===== */
  async createTrip(payload: any): Promise<Trip | null> {
    try {
      const res = await api.post<TripDetailResponse>('/trips', payload);
      return res.data.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      return null;
    }
  },

  /* ===== CANCEL ===== */
  async cancelTrip(id: string): Promise<boolean> {
    try {
      // Validate ID
      if (!id || !isValidObjectId(id)) {
        console.error('Invalid trip ID format for cancel:', id);
        return false;
      }
      
      await api.patch(`/trips/${id}/cancel`);
      return true;
    } catch (error) {
      console.error('Error cancelling trip:', error);
      return false;
    }
  },

  /* ===== GET BY ID ===== */
  async getTripById(id: string): Promise<Trip | null> {
    try {
      // Kiểm tra ID null/undefined
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid trip ID (null/undefined):', id);
        return null;
      }

      console.log('Fetching trip with ID:', id);
      console.log('ID length:', id.length);
      console.log('ID is hex:', /^[0-9a-fA-F]+$/.test(id));
      
      // Kiểm tra format ID (ObjectId chuẩn 24 ký tự)
      if (!isValidObjectId(id)) {
        console.error('Invalid trip ID format - not a valid ObjectId:', id);
        console.error('Expected: 24 hex characters, got:', id.length, 'characters');
        
        // Thử fix ID nếu có thể (chỉ cho debug)
        const fixedId = fixPossibleObjectId(id);
        if (fixedId && isValidObjectId(fixedId)) {
          console.log('Trying with fixed ID:', fixedId);
          try {
            const res = await api.get<TripDetailResponse>(`/trips/${fixedId}`);
            if (res.data.success && res.data.data) {
              console.log('Success with fixed ID!');
              return res.data.data;
            }
          } catch (fixedError) {
            console.error('Fixed ID also failed:', fixedError);
          }
        }
        
        return null;
      }

      // Đảm bảo ID không có khoảng trắng
      const cleanId = id.trim();
      
      const res = await api.get<TripDetailResponse>(`/trips/${cleanId}`);
      
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      
      console.error('Trip not found or invalid response:', res.data);
      return null;
    } catch (error) {
      console.error('Error fetching trip by ID:', error);
      
      // Log chi tiết lỗi
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });

        // Xử lý các mã lỗi cụ thể
        if (error.response?.status === 404) {
          console.error('Trip not found with ID:', id);
          return null;
        }
        
        if (error.response?.status === 500) {
          console.error('Server error when fetching trip. This might be due to:');
          console.error('1. Invalid ID format (most likely) - ID should be 24 hex characters');
          console.error('2. Database connection issue');
          console.error('3. Missing populated data (company, vehicle, location)');
          console.error('4. CastError in MongoDB - cannot cast string to ObjectId');
        }
      }
      
      return null;
    }
  },

  /* ===== GET BY ID WITH FALLBACK ===== */
  async getTripByIdSafe(id: string): Promise<{ trip: Trip | null; error: string | null }> {
    try {
      const trip = await this.getTripById(id);
      if (trip) {
        return { trip, error: null };
      }
      return { trip: null, error: 'Trip not found' };
    } catch (error) {
      return { 
        trip: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
};

/* ================= HELPER FUNCTIONS ================= */

// Helper để lấy company name an toàn
export const getCompanyName = (trip: Trip | null): string => {
  if (!trip || !trip.companyId) return 'Nhà xe';
  
  if (typeof trip.companyId === 'object' && trip.companyId !== null) {
    return (trip.companyId as Company).name || 'Nhà xe';
  }
  
  return 'Nhà xe';
};

// Helper để lấy company logo an toàn
export const getCompanyLogo = (trip: Trip | null): string | undefined => {
  if (!trip || !trip.companyId) return undefined;
  
  if (typeof trip.companyId === 'object' && trip.companyId !== null) {
    return (trip.companyId as Company).logoUrl;
  }
  
  return undefined;
};

// Helper để lấy vehicle type an toàn
export const getVehicleType = (trip: Trip | null): string => {
  if (!trip || !trip.vehicleId) return 'Xe khách';
  
  if (typeof trip.vehicleId === 'object' && trip.vehicleId !== null) {
    return (trip.vehicleId as Vehicle).type || 'Xe khách';
  }
  
  return 'Xe khách';
};

// Helper để lấy vehicle amenities an toàn
export const getVehicleAmenities = (trip: Trip | null): string[] => {
  if (!trip || !trip.vehicleId) return [];
  
  if (typeof trip.vehicleId === 'object' && trip.vehicleId !== null) {
    return (trip.vehicleId as Vehicle).amenities || [];
  }
  
  return [];
};

// Helper để lấy from location name an toàn
export const getFromLocationName = (trip: Trip | null): string => {
  if (!trip || !trip.route?.fromLocationId) return '';
  
  if (typeof trip.route.fromLocationId === 'object' && trip.route.fromLocationId !== null) {
    return (trip.route.fromLocationId as Location).name || '';
  }
  
  return '';
};

// Helper để lấy to location name an toàn
export const getToLocationName = (trip: Trip | null): string => {
  if (!trip || !trip.route?.toLocationId) return '';
  
  if (typeof trip.route.toLocationId === 'object' && trip.route.toLocationId !== null) {
    return (trip.route.toLocationId as Location).name || '';
  }
  
  return '';
};

// Helper để lấy số ghế trống
export const getAvailableSeatsCount = (trip: Trip | null): number => {
  if (!trip) return 0;
  
  if (trip.availableSeatsCount !== undefined) {
    return trip.availableSeatsCount;
  }
  
  if (trip.seats) {
    return trip.seats.filter(s => s.status === 'available').length;
  }
  
  return 0;
};

// Helper để format thời gian
export const formatTripTime = (date: string | Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// Helper để format ngày
export const formatTripDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Helper để tính thời gian di chuyển
export const calculateTripDuration = (departureTime: string | Date | undefined, arrivalTime: string | Date | undefined): string => {
  if (!departureTime || !arrivalTime) return '';
  
  const depTime = new Date(departureTime);
  const arrTime = new Date(arrivalTime);
  const diffMs = arrTime.getTime() - depTime.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// Helper để kiểm tra trip còn hoạt động không
export const isTripActive = (trip: Trip | null): boolean => {
  if (!trip) return false;
  return trip.status === 'scheduled' || trip.status === 'departed';
};

// Helper để kiểm tra ID hợp lệ
export const isValidTripId = (id: string): boolean => {
  return isValidObjectId(id);
};

// Helper để fix ID nếu có thể
export const fixTripId = (id: string): string | null => {
  return fixPossibleObjectId(id);
};

/* ================= LEGACY SUPPORT ================= */

export const TripsApi = {
  getManagementTrips(companyId: string): Promise<Trip[]> {
    return api
      .get<TripResponse>('/trips/management/all', {
        params: { companyId },
      })
      .then((res) => res.data.data || [])
      .catch(() => []);
  },
};

/* ================= DIRECT FUNCTION ================= */

export async function searchTrips(params: TripSearchParams): Promise<Trip[]> {
  try {
    const res = await api.get<TripResponse>('/trips/search', {
      params,
    });
    return res.data.data || [];
  } catch (error) {
    console.error('Error in searchTrips:', error);
    return [];
  }
}

export default api;