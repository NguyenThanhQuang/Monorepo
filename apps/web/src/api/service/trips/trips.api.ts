// src/api/service/trips/trips.api.ts
import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
} from 'axios';
import type { Trip, Location, Company, Vehicle, TripSeat } from '@obtp/shared-types';

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
  statusCode: number;
  message: string;
  data: {
    success: boolean;
    data: Trip;  // Trip object nằm ở đây
  };
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

const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
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

  /* ===== SEARCH BY PROVINCES ===== */
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
      if (!fromId || !isValidObjectId(fromId)) {
        console.error('Invalid fromId format:', fromId);
        return [];
      }
      
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
      const res = await api.post<any>('/trips', payload);
      
      // Kiểm tra cấu trúc response
      if (res.data && res.data.data && res.data.data.data) {
        return res.data.data.data;
      }
      if (res.data && res.data.data) {
        return res.data.data;
      }
      return res.data || null;
    } catch (error) {
      console.error('Error creating trip:', error);
      return null;
    }
  },

  /* ===== CANCEL ===== */
  async cancelTrip(id: string): Promise<boolean> {
    try {
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

// trips.api.ts - Sửa hàm getTripById

// trips.api.ts - Sửa hàm getTripById

async getTripById(id: string): Promise<Trip | null> {
  try {
    // Kiểm tra ID null/undefined
    if (!id || id === 'undefined' || id === 'null') {
      console.error('❌ Invalid trip ID (null/undefined):', id);
      return null;
    }

    console.log('🔍 Fetching trip with ID:', id);
    console.log('📏 ID length:', id.length);
    
    // ObjectId chuẩn phải là 24 ký tự
    if (id.length !== 24) {
      console.error('❌ Invalid ID length. Expected 24, got:', id.length);
      return null;
    }

    // Kiểm tra format ID
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(id)) {
      console.error('❌ Invalid ID format - not a valid ObjectId:', id);
      return null;
    }

    // Đảm bảo ID không có khoảng trắng
    const cleanId = id.trim();
    
    const res = await api.get<any>(`/trips/${cleanId}`);
    
    console.log('📦 Response from server:', res.data);
    
    // CẤU TRÚC THỰC TẾ: { statusCode, message, data: { success, data: Trip } }
    // Trip nằm ở res.data.data.data
    if (res.data?.data?.data) {
      const tripData = res.data.data.data;
      
      // Kiểm tra xem có phải là Trip object không (có id hoặc _id)
      if (tripData.id || tripData._id) {
        console.log('✅ Trip found in res.data.data.data');
        
        // Chuyển đổi id thành _id để đồng bộ với interface Trip
        if (tripData.id && !tripData._id) {
          tripData._id = tripData.id;
        }
        
        return tripData as Trip;
      }
    }
    
    // Fallback: kiểm tra các cấu trúc khác
    if (res.data?.data?._id) {
      console.log('✅ Trip found in res.data.data');
      return res.data.data as Trip;
    }
    
    if (res.data?._id) {
      console.log('✅ Trip found directly in response');
      return res.data as Trip;
    }
    
    console.error('❌ Invalid response structure. Full response:', JSON.stringify(res.data, null, 2));
    return null;
  } catch (error) {
    console.error('❌ Error fetching trip by ID:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      
      console.error('📊 Axios error details:', {
        status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: responseData
      });
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
  if (!trip) return 'Nhà xe';
  
  if (trip.companyId && typeof trip.companyId === 'object') {
    return (trip.companyId as any).name || 'Nhà xe';
  }
  
  return 'Nhà xe';
};

// Helper để lấy company logo an toàn
export const getCompanyLogo = (trip: Trip | null): string | undefined => {
  if (!trip) return undefined;
  
  if (trip.companyId && typeof trip.companyId === 'object') {
    return (trip.companyId as any).logoUrl;
  }
  
  return undefined;
};

// Helper để lấy company phone
export const getCompanyPhone = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.companyId && typeof trip.companyId === 'object') {
    return (trip.companyId as any).phone || '';
  }
  
  return '';
};

// Helper để lấy vehicle type an toàn
export const getVehicleType = (trip: Trip | null): string => {
  if (!trip) return 'Xe khách';
  
  if (trip.vehicleId && typeof trip.vehicleId === 'object') {
    return (trip.vehicleId as any).type || 'Xe khách';
  }
  
  return 'Xe khách';
};

// Helper để lấy vehicle amenities an toàn
export const getVehicleAmenities = (trip: Trip | null): string[] => {
  if (!trip) return [];
  
  if (trip.vehicleId && typeof trip.vehicleId === 'object') {
    return (trip.vehicleId as any).amenities || [];
  }
  
  return [];
};

// Helper để lấy from location name an toàn
export const getFromLocationName = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.route?.fromLocationId && typeof trip.route.fromLocationId === 'object') {
    return (trip.route.fromLocationId as any).name || '';
  }
  
  return '';
};

// Helper để lấy from location province
export const getFromLocationProvince = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.route?.fromLocationId && typeof trip.route.fromLocationId === 'object') {
    return (trip.route.fromLocationId as any).province || '';
  }
  
  return '';
};

// Helper để lấy from location address
export const getFromLocationAddress = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.route?.fromLocationId && typeof trip.route.fromLocationId === 'object') {
    const location = trip.route.fromLocationId as any;
    return location.fullAddress || location.address || '';
  }
  
  return '';
};

// Helper để lấy to location name an toàn
export const getToLocationName = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.route?.toLocationId && typeof trip.route.toLocationId === 'object') {
    return (trip.route.toLocationId as any).name || '';
  }
  
  return '';
};

// Helper để lấy to location province
export const getToLocationProvince = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.route?.toLocationId && typeof trip.route.toLocationId === 'object') {
    return (trip.route.toLocationId as any).province || '';
  }
  
  return '';
};

// Helper để lấy to location address
export const getToLocationAddress = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.route?.toLocationId && typeof trip.route.toLocationId === 'object') {
    const location = trip.route.toLocationId as any;
    return location.fullAddress || location.address || '';
  }
  
  return '';
};

// Helper để lấy tổng số ghế
export const getTotalSeats = (trip: Trip | null): number => {
  if (!trip) return 0;
  
  if (trip.vehicleId && typeof trip.vehicleId === 'object') {
    return (trip.vehicleId as any).totalSeats || trip.seats?.length || 0;
  }
  
  return trip.seats?.length || 0;
};

// Helper để lấy biển số xe
export const getVehicleNumber = (trip: Trip | null): string => {
  if (!trip) return '';
  
  if (trip.vehicleId && typeof trip.vehicleId === 'object') {
    return (trip.vehicleId as any).vehicleNumber || '';
  }
  
  return '';
};

// Helper để lấy số tầng xe
export const getVehicleFloors = (trip: Trip | null): number => {
  if (!trip) return 1;
  
  if (trip.vehicleId && typeof trip.vehicleId === 'object') {
    return (trip.vehicleId as any).floors || 1;
  }
  
  return 1;
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