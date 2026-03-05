import {
  CreateTripPayload,
  SearchTripQuery,
  Trip,
  TripDetailResponse,
  TripResponse,
  UpdateTripPayload,
} from "@obtp/shared-types";
import { http } from "../core/http-client";

// ================= TYPES =================




export interface TripSearchParams {
  fromId: string;
  toId: string;
  date: string;
}


export interface TripStats {
  totalTrips: number;
  scheduledTrips: number;
  runningTrips: number;
  totalTicketsSold: number;
}

// ================= VALIDATION FUNCTIONS =================

const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== "string") return false;
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

// ================= API =================

export const tripsApi = {
  /* ===== PUBLIC SEARCH METHODS ===== */

  // PUBLIC: Tìm chuyến đi (quan trọng cho người dùng cuối)
  searchPublic: (query: SearchTripQuery) => {
    return http.get<Trip[]>("/trips", { params: query });
  },
  searchTrips: (params: TripSearchParams) => {
    return http.get<TripResponse>('/trips/search', { params });
  },
  /* ===== SEARCH BY LOCATION IDS ===== */
  search: async (params: TripSearchParams): Promise<Trip[]> => {
    try {
      const response = await http.get<TripResponse>("/trips/search", {
        params,
      });
      return response?.data || [];
    } catch (error) {
      console.error("Error searching trips by location IDs:", error);
      return [];
    }
  },

  /* ===== SEARCH BY PROVINCES ===== */
  searchByProvinces: async (
    fromProvince: string,
    toProvince: string,
    date: string,
  ): Promise<Trip[]> => {
    try {
      const response = await http.get<TripResponse>("/trips", {
        params: {
          from: fromProvince,
          to: toProvince,
          date,
        },
      });
      return response?.data || [];
    } catch (error) {
      console.error("Error searching trips by provinces:", error);
      return [];
    }
  },

  /* ===== SEARCH BY FROM ===== */
  searchByFrom: async (fromId: string): Promise<Trip[]> => {
    try {
      if (!fromId || !isValidObjectId(fromId)) {
        console.error("Invalid fromId format:", fromId);
        return [];
      }

      const response = await http.get<TripResponse>("/trips/search/from", {
        params: { fromId },
      });
      return response?.data || [];
    } catch (error) {
      console.error("Error searching trips by from:", error);
      return [];
    }
  },

  /* ===== SEARCH BY ROUTE ===== */
  searchByRoute: async (fromId: string, toId?: string): Promise<Trip[]> => {
    try {
      if (!fromId || !isValidObjectId(fromId)) {
        console.error("Invalid fromId format:", fromId);
        return [];
      }

      if (toId && !isValidObjectId(toId)) {
        console.error("Invalid toId format:", toId);
        return [];
      }

      const params: any = { fromId };
      if (toId) params.toId = toId;

      const response = await http.get<TripResponse>("/trips/search/route", {
        params,
      });
      return response?.data || [];
    } catch (error) {
      console.error("Error searching trips by route:", error);
      return [];
    }
  },

  /* ===== GET DETAIL ===== */
  getDetail: (id: string) => {
    return http.get<TripDetailResponse>(`/trips/${id}`);
  },

  /* ===== GET BY ID (with safe handling) ===== */
  getTripById: async (id: string): Promise<Trip | null> => {
    try {
      // Kiểm tra ID null/undefined
      if (!id || id === "undefined" || id === "null") {
        console.error("❌ Invalid trip ID (null/undefined):", id);
        return null;
      }

      console.log("🔍 Fetching trip with ID:", id);
      console.log("📏 ID length:", id.length);

      // ObjectId chuẩn phải là 24 ký tự
      if (id.length !== 24) {
        console.error("❌ Invalid ID length. Expected 24, got:", id.length);
        return null;
      }

      // Kiểm tra format ID
      if (!isValidObjectId(id)) {
        console.error("❌ Invalid ID format - not a valid ObjectId:", id);
        return null;
      }

      // Đảm bảo ID không có khoảng trắng
      const cleanId = id.trim();

      const response = await http.get<any>(`/trips/${cleanId}`);

      console.log("📦 Response from server:", response);

      // CẤU TRÚC THỰC TẾ: { statusCode, message, data: { success, data: Trip } }
      // Trip nằm ở response.data.data
      if (response?.data?.data) {
        const tripData = response.data.data;

        // Kiểm tra xem có phải là Trip object không (có id hoặc _id)
        if (tripData.id || tripData._id) {
          console.log("✅ Trip found in response.data.data");

          // Chuyển đổi id thành _id để đồng bộ với interface Trip
          if (tripData.id && !tripData._id) {
            tripData._id = tripData.id;
          }

          return tripData as Trip;
        }
      }

      // Fallback: kiểm tra các cấu trúc khác
      if (response?.data?._id) {
        console.log("✅ Trip found in response.data");
        return response.data as Trip;
      }

      if (response?._id) {
        console.log("✅ Trip found directly in response");
        return response as Trip;
      }

      console.error(
        "❌ Invalid response structure. Full response:",
        JSON.stringify(response, null, 2),
      );
      return null;
    } catch (error) {
      console.error("❌ Error fetching trip by ID:", error);
      return null;
    }
  },

  /* ===== GET BY ID WITH FALLBACK ===== */
  getTripByIdSafe: async (
    id: string,
  ): Promise<{ trip: Trip | null; error: string | null }> => {
    try {
      const trip = await tripsApi.getTripById(id);
      if (trip) {
        return { trip, error: null };
      }
      return { trip: null, error: "Trip not found" };
    } catch (error) {
      return {
        trip: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /* ===== MANAGEMENT (Admin & Company Admin) ===== */
  getAllManagement: async (companyId?: string): Promise<Trip[]> => {
    try {
      if (companyId && !isValidObjectId(companyId)) {
        console.error("Invalid companyId format:", companyId);
        return [];
      }

      const params: any = {};
      if (companyId) {
        params.companyId = companyId;
      }

      const response = await http.get<any>("/trips/management/all", { params });

      // Xử lý response an toàn
      if (!response) return [];

      // Nếu response có cấu trúc { success: true, data: [...] }
      if (response.success && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Nếu response có cấu trúc { data: [...] }
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Nếu response trực tiếp là array
      if (Array.isArray(response)) {
        return response;
      }

      console.warn(
        "Unexpected response format from getAllManagement:",
        response,
      );
      return [];
    } catch (error) {
      console.error("Error in getAllManagement:", error);
      throw error;
    }
  },

  /* ===== CREATE ===== */
  create: async (payload: CreateTripPayload): Promise<Trip | null> => {
    try {
      console.log("Calling API create with payload:", payload);

      const response = await http.post<any>("/trips", payload);

      console.log("API create response:", response);

      // Kiểm tra cấu trúc response
      if (response && response.data && response.data.data) {
        return response.data.data;
      }
      if (response && response.data) {
        return response.data;
      }
      return response || null;
    } catch (error) {
      console.error("Error creating trip:", error);
      return null;
    }
  },

  /* ===== CANCEL ===== */
  cancel: async (id: string): Promise<boolean> => {
    try {
      if (!id || !isValidObjectId(id)) {
        console.error("Invalid trip ID format for cancel:", id);
        return false;
      }

      await http.patch(`/trips/${id}/cancel`, {});
      return true;
    } catch (error) {
      console.error("Error cancelling trip:", error);
      return false;
    }
  },

  /* ===== UPDATE ===== */
  update: (id: string, payload: UpdateTripPayload) => {
    return http.patch<Trip>(`/trips/${id}`, payload);
  },

  /* ===== LEGACY SUPPORT ===== */
  getManagementTrips: async (companyId: string): Promise<Trip[]> => {
    try {
      const response = await http.get<TripResponse>("/trips/management/all", {
        params: { companyId },
      });
      return response?.data || [];
    } catch (error) {
      console.error("Error in getManagementTrips:", error);
      return [];
    }
  },

  // ================= HELPER FUNCTIONS =================

  // Helper để lấy company name an toàn
  getCompanyName: (trip: Trip | null): string => {
    if (!trip) return "Nhà xe";

    if (trip.companyId && typeof trip.companyId === "object") {
      return (trip.companyId as any).name || "Nhà xe";
    }

    return "Nhà xe";
  },

  // Helper để lấy company logo an toàn
  getCompanyLogo: (trip: Trip | null): string | undefined => {
    if (!trip) return undefined;

    if (trip.companyId && typeof trip.companyId === "object") {
      return (trip.companyId as any).logoUrl;
    }

    return undefined;
  },

  // Helper để lấy company phone
  getCompanyPhone: (trip: Trip | null): string => {
    if (!trip) return "";

    if (trip.companyId && typeof trip.companyId === "object") {
      return (trip.companyId as any).phone || "";
    }

    return "";
  },

  // Helper để lấy vehicle type an toàn
  getVehicleType: (trip: Trip | null): string => {
    if (!trip) return "Xe khách";

    if (trip.vehicleId && typeof trip.vehicleId === "object") {
      return (trip.vehicleId as any).type || "Xe khách";
    }

    return "Xe khách";
  },

  // Helper để lấy vehicle amenities an toàn
  getVehicleAmenities: (trip: Trip | null): string[] => {
    if (!trip) return [];

    if (trip.vehicleId && typeof trip.vehicleId === "object") {
      return (trip.vehicleId as any).amenities || [];
    }

    return [];
  },

  // Helper để lấy from location name an toàn
  getFromLocationName: (trip: Trip | null): string => {
    if (!trip) return "";

    if (
      trip.route?.fromLocationId &&
      typeof trip.route.fromLocationId === "object"
    ) {
      return (trip.route.fromLocationId as any).name || "";
    }

    return "";
  },

  // Helper để lấy from location province
  getFromLocationProvince: (trip: Trip | null): string => {
    if (!trip) return "";

    if (
      trip.route?.fromLocationId &&
      typeof trip.route.fromLocationId === "object"
    ) {
      return (trip.route.fromLocationId as any).province || "";
    }

    return "";
  },

  // Helper để lấy from location address
  getFromLocationAddress: (trip: Trip | null): string => {
    if (!trip) return "";

    if (
      trip.route?.fromLocationId &&
      typeof trip.route.fromLocationId === "object"
    ) {
      const location = trip.route.fromLocationId as any;
      return location.fullAddress || location.address || "";
    }

    return "";
  },

  // Helper để lấy to location name an toàn
  getToLocationName: (trip: Trip | null): string => {
    if (!trip) return "";

    if (
      trip.route?.toLocationId &&
      typeof trip.route.toLocationId === "object"
    ) {
      return (trip.route.toLocationId as any).name || "";
    }

    return "";
  },

  // Helper để lấy to location province
  getToLocationProvince: (trip: Trip | null): string => {
    if (!trip) return "";

    if (
      trip.route?.toLocationId &&
      typeof trip.route.toLocationId === "object"
    ) {
      return (trip.route.toLocationId as any).province || "";
    }

    return "";
  },

  // Helper để lấy to location address
  getToLocationAddress: (trip: Trip | null): string => {
    if (!trip) return "";

    if (
      trip.route?.toLocationId &&
      typeof trip.route.toLocationId === "object"
    ) {
      const location = trip.route.toLocationId as any;
      return location.fullAddress || location.address || "";
    }

    return "";
  },

  // Helper để lấy tổng số ghế
  getTotalSeats: (trip: Trip | null): number => {
    if (!trip) return 0;

    if (trip.vehicleId && typeof trip.vehicleId === "object") {
      return (trip.vehicleId as any).totalSeats || trip.seats?.length || 0;
    }

    return trip.seats?.length || 0;
  },

  // Helper để lấy biển số xe
  getVehicleNumber: (trip: Trip | null): string => {
    if (!trip) return "";

    if (trip.vehicleId && typeof trip.vehicleId === "object") {
      return (trip.vehicleId as any).vehicleNumber || "";
    }

    return "";
  },

  // Helper để lấy số tầng xe
  getVehicleFloors: (trip: Trip | null): number => {
    if (!trip) return 1;

    if (trip.vehicleId && typeof trip.vehicleId === "object") {
      return (trip.vehicleId as any).floors || 1;
    }

    return 1;
  },

  // Helper để lấy số ghế trống
  getAvailableSeatsCount: (trip: Trip | null): number => {
    if (!trip) return 0;

    if (trip.availableSeatsCount !== undefined) {
      return trip.availableSeatsCount;
    }

    if (trip.seats) {
      return trip.seats.filter((s) => s.status === "available").length;
    }

    return 0;
  },

  // Helper để format thời gian
  formatTripTime: (date: string | Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Helper để format ngày
  formatTripDate: (date: string | Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  // Helper để tính thời gian di chuyển
  calculateTripDuration: (
    departureTime: string | Date | undefined,
    arrivalTime: string | Date | undefined,
  ): string => {
    if (!departureTime || !arrivalTime) return "";

    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const diffMs = arrTime.getTime() - depTime.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  },

  // Helper để kiểm tra trip còn hoạt động không
  isTripActive: (trip: Trip | null): boolean => {
    if (!trip) return false;
    return trip.status === "scheduled" || trip.status === "departed";
  },

  // Helper để kiểm tra ID hợp lệ
  isValidTripId: (id: string): boolean => {
    return isValidObjectId(id);
  },

  // Hàm tiện ích: Lấy thống kê chuyến đi
  getStats: async (companyId: string): Promise<TripStats> => {
    try {
      const trips = await tripsApi.getAllManagement(companyId);

      const totalTrips = trips.length;
      const scheduledTrips = trips.filter(
        (trip: Trip) => trip.status === "scheduled",
      ).length;
      const runningTrips = trips.filter(
        (trip: Trip) => trip.status === "departed",
      ).length;

      let totalTicketsSold = 0;
      trips.forEach((trip: Trip) => {
        const totalSeats = tripsApi.getTotalSeats(trip);
        const availableSeats = tripsApi.getAvailableSeatsCount(trip);
        const soldSeats = Math.max(0, totalSeats - availableSeats);
        totalTicketsSold += soldSeats;
      });

      return {
        totalTrips,
        scheduledTrips,
        runningTrips,
        totalTicketsSold,
      };
    } catch (error) {
      console.error("Error getting trip stats:", error);
      return {
        totalTrips: 0,
        scheduledTrips: 0,
        runningTrips: 0,
        totalTicketsSold: 0,
      };
    }
  },

  // Tìm kiếm chuyến đi với filter
  searchWithFilter: async (
    companyId: string,
    searchQuery?: string,
    status?: string,
  ): Promise<Trip[]> => {
    try {
      const trips = await tripsApi.getAllManagement(companyId);

      let filteredTrips = [...trips];

      // Filter by search query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredTrips = filteredTrips.filter((trip: Trip) => {
          const fromName = tripsApi.getFromLocationName(trip).toLowerCase();
          const toName = tripsApi.getToLocationName(trip).toLowerCase();
          const routeName = `${fromName} → ${toName}`;

          const vehiclePlate = tripsApi.getVehicleNumber(trip).toLowerCase();

          return routeName.includes(query) || vehiclePlate.includes(query);
        });
      }

      // Filter by status
      if (status && status !== "all") {
        filteredTrips = filteredTrips.filter(
          (trip: Trip) => trip.status === status,
        );
      }

      return filteredTrips;
    } catch (error) {
      console.error("Error searching trips:", error);
      return [];
    }
  },

  // Helper function để lấy trip display info
  getTripDisplayInfo: (trip: Trip) => {
    const fromName = tripsApi.getFromLocationName(trip);
    const toName = tripsApi.getToLocationName(trip);
    const vehiclePlate = tripsApi.getVehicleNumber(trip);

    return {
      routeName: `${fromName} → ${toName}`,
      vehiclePlate: vehiclePlate || "N/A",
      vehicleType: tripsApi.getVehicleType(trip),
      fromName,
      toName,
    };
  },

  // Helper function để format date
  formatDate: (date: Date | string): string => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString("vi-VN");
    } catch {
      return "Invalid Date";
    }
  },

  // Helper function để format time
  formatTime: (date: Date | string): string => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Invalid Time";
      return dateObj.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Time";
    }
  },
 async getTripDetail(
  tripId: string,
): Promise<TripDetailResponse> {
  const res = await fetch(`/api/trips/${tripId}`);
  if (!res.ok) throw new Error('Không lấy được chi tiết chuyến đi');
  return res.json();
},
  // Helper function để format price
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  },

  assignDriver: (tripId: string, driverId: string) => {
    return http.patch<{ message: string }>(`/trips/${tripId}/assign-driver`, {
      driverId,
    });
  },

  toggleRecurrence: (id: string, isActive: boolean) => {
    return http.patch<Trip>(`/trips/${id}/toggle-recurrence`, { isActive });
  },
};

// ================= EXPORT DIRECT FUNCTION =================

export async function searchTrips(params: TripSearchParams): Promise<Trip[]> {
  return tripsApi.search(params);
}

export default tripsApi;
