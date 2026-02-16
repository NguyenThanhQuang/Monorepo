// src/services/modules/trips.api.ts
import {
  CreateTripPayload,
  SearchTripQuery,
  Trip,
  UpdateTripPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

export interface TripStats {
  totalTrips: number;
  scheduledTrips: number;
  runningTrips: number;
  totalTicketsSold: number;
}

export const tripsApi = {
  // PUBLIC: Tìm chuyến đi (quan trọng cho người dùng cuối)
  searchPublic: (query: SearchTripQuery) => {
    return http.get<Trip[]>("/trips", { params: query });
  },

  getDetail: (id: string) => {
    return http.get<Trip>(`/trips/${id}`);
  },

  // MANAGEMENT (Admin & Company Admin)
  // Query param `companyId` optional cho Super Admin lọc
  getAllManagement: async (companyId?: string): Promise<Trip[]> => {
    try {
      const response = await http.get<any>("/trips/management/all", {
        params: { companyId },
      });
      
      // Xử lý response an toàn
      if (!response) return [];
      
      // Nếu response có cấu trúc { data: [...] }
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Nếu response trực tiếp là array
      if (Array.isArray(response)) {
        return response;
      }
      
      // Log để debug
      console.warn('Unexpected response format from getAllManagement:', response);
      return [];
    } catch (error) {
      console.error('Error in getAllManagement:', error);
      throw error;
    }
  },

  create: (payload: CreateTripPayload) => {
    return http.post<Trip>("/trips", payload);
  },

  cancel: (id: string) => {
    return http.patch<Trip>(`/trips/${id}/cancel`);
  },

  update: (id: string, payload: UpdateTripPayload) => {
    return http.patch<Trip>(`/trips/${id}`, payload);
  },

  // Tìm kiếm theo tuyến đường
  searchByRoute: (fromId: string, toId: string) => {
    return http.get<Trip[]>(`/trips/search?fromId=${fromId}&toId=${toId}`);
  },

  // Tìm kiếm theo điểm đi
  searchByFrom: (fromId: string) => {
    return http.get<Trip[]>(`/trips/search/from?fromId=${fromId}`);
  },

  // Hàm tiện ích: Lấy thống kê chuyến đi
  getStats: async (companyId: string): Promise<TripStats> => {
    try {
      const trips = await tripsApi.getAllManagement(companyId);
      
      const totalTrips = trips.length;
      const scheduledTrips = trips.filter((trip: Trip) => trip.status === 'scheduled').length;
      const runningTrips = trips.filter((trip: Trip) => trip.status === 'departed').length;
      
      let totalTicketsSold = 0;
      trips.forEach((trip: Trip) => {
        const totalSeats = trip.totalSeats || (trip.vehicleId as any)?.totalSeats || 40;
        const availableSeats = trip.availableSeatsCount || 0;
        const soldSeats = Math.max(0, totalSeats - availableSeats);
        totalTicketsSold += soldSeats;
      });

      return {
        totalTrips,
        scheduledTrips,
        runningTrips,
        totalTicketsSold
      };
    } catch (error) {
      console.error('Error getting trip stats:', error);
      // Trả về giá trị mặc định thay vì throw
      return {
        totalTrips: 0,
        scheduledTrips: 0,
        runningTrips: 0,
        totalTicketsSold: 0
      };
    }
  },

  // Tìm kiếm chuyến đi với filter
  searchWithFilter: async (companyId: string, searchQuery?: string, status?: string): Promise<Trip[]> => {
    try {
      const trips = await tripsApi.getAllManagement(companyId);
      
      let filteredTrips = [...trips];
      
      // Filter by search query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredTrips = filteredTrips.filter((trip: Trip) => {
          const fromName = (trip.route as any)?.fromLocationId?.name?.toLowerCase() || 
                          (trip.route as any)?.from?.name?.toLowerCase() || '';
          const toName = (trip.route as any)?.toLocationId?.name?.toLowerCase() || 
                        (trip.route as any)?.to?.name?.toLowerCase() || '';
          const routeName = `${fromName} → ${toName}`;
          
          const vehiclePlate = (trip.vehicleId as any)?.vehicleNumber?.toLowerCase() || '';
          
          return routeName.includes(query) || vehiclePlate.includes(query);
        });
      }
      
      // Filter by status
      if (status && status !== 'all') {
        filteredTrips = filteredTrips.filter((trip: Trip) => trip.status === status);
      }
      
      return filteredTrips;
    } catch (error) {
      console.error('Error searching trips:', error);
      return [];
    }
  },

  // Helper function để lấy trip display info
  getTripDisplayInfo: (trip: Trip) => {
    const route = trip.route as any;
    const vehicle = trip.vehicleId as any;
    
    const fromName = route?.fromLocationId?.name || route?.from?.name || 'N/A';
    const toName = route?.toLocationId?.name || route?.to?.name || 'N/A';
    
    return {
      routeName: `${fromName} → ${toName}`,
      vehiclePlate: vehicle?.vehicleNumber || 'N/A',
      vehicleType: vehicle?.type,
      fromName,
      toName
    };
  },

  // Helper function để format date
  formatDate: (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleDateString('vi-VN');
    } catch {
      return 'Invalid Date';
    }
  },

  // Helper function để format time
  formatTime: (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Invalid Time';
      return dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid Time';
    }
  },

  // Helper function để format price
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
};