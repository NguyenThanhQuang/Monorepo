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
  getAllManagement: (companyId?: string) => {
    return http.get<Trip[]>("/trips/management/all", {
      params: { companyId },
    });
  },

  create: (payload: CreateTripPayload) => {
    return http.post<Trip>("/trips", payload);
  },

  // Không có Update Full, thường là cancel hoặc update specific fields
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
      const response = await tripsApi.getAllManagement(companyId);
      const trips = response || [];
      
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
      throw error;
    }
  },

  // Tìm kiếm chuyến đi với filter
  searchWithFilter: async (companyId: string, searchQuery?: string, status?: string): Promise<Trip[]> => {
    try {
      const response = await tripsApi.getAllManagement(companyId);
      let trips = response || [];
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        trips = trips.filter((trip: Trip) => {
          // Xử lý route name từ Trip interface
          const fromName = (trip.route as any)?.fromLocationId?.name?.toLowerCase() || 
                          (trip.route as any)?.from?.name?.toLowerCase() || '';
          const toName = (trip.route as any)?.toLocationId?.name?.toLowerCase() || 
                        (trip.route as any)?.to?.name?.toLowerCase() || '';
          const routeName = `${fromName} → ${toName}`;
          
          const vehiclePlate = (trip.vehicleId as any)?.vehicleNumber?.toLowerCase() || '';
          const vehicleType = (trip.vehicleId as any)?.type?.toLowerCase() || '';
          
          return routeName.includes(query) || 
                 vehiclePlate.includes(query) || 
                 vehicleType.includes(query);
        });
      }
      
      // Filter by status
      if (status && status !== 'all') {
        trips = trips.filter((trip: Trip) => trip.status === status);
      }
      
      return trips;
    } catch (error) {
      console.error('Error searching trips:', error);
      throw error;
    }
  },

  // Helper function để lấy trip display info
  getTripDisplayInfo: (trip: Trip) => {
    const route = trip.route as any;
    const vehicle = trip.vehicleId as any;
    
    return {
      routeName: `${route?.fromLocationId?.name || route?.from?.name || 'N/A'} → ${route?.toLocationId?.name || route?.to?.name || 'N/A'}`,
      vehiclePlate: vehicle?.vehicleNumber || 'N/A',
      vehicleType: vehicle?.type,
      fromName: route?.fromLocationId?.name || route?.from?.name,
      toName: route?.toLocationId?.name || route?.to?.name
    };
  },

  // Helper function để format date
  formatDate: (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('vi-VN');
    } catch {
      return typeof date === 'string' ? date : 'Invalid Date';
    }
  },

  // Helper function để format time
  formatTime: (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return typeof date === 'string' ? date : 'Invalid Time';
    }
  },

  // Helper function để format price
  formatPrice: (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
};