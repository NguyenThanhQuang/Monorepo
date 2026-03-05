import { API_ENDPOINTS } from "../common/configService";
import apiService from "../common/apiService";
import { Booking, CreateBookingPayload } from "../../types/booking";
import { SearchTripsResponse } from "../../types/trip";
import { searchLocations } from "./locationService";
import type { Trip as TripModel } from "../../types/trip";

type RequestOptions = {
  signal?: AbortSignal;
};

type CreateHoldPayload = {
  tripId: string;
  passengers: Array<{
    name: string;
    phone: string;
    email?: string;
    idNumber?: string;
    seatNumber: string;
  }>;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
};

type SearchTripsInput =
  | {
      fromLocationId: string;
      toLocationId: string;
      date: string;
      passengers?: number;
    }
  | {
      from: string;
      to: string;
      date: string;
      passengers?: number;
    };

const getLocId = (loc: any): string | null => {
  const v = loc?._id ?? loc?.id;
  if (!v) return null;
  return String(v);
};

const isObjectId = (s: any) =>
  typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);

const isYYYYMMDD = (s: any) =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

const normalizeLocationQuery = (text: string) => {
  const t = (text || "").trim();
  const lower = t.toLowerCase();

  if (
    lower === "hồ chí minh" ||
    lower === "ho chi minh" ||
    lower === "hcm" ||
    lower === "tphcm" ||
    lower === "tp hcm" ||
    lower === "tp.hcm"
  ) {
    return "TP. Hồ Chí Minh";
  }

  if (lower.includes("thành phố hồ chí minh")) return "TP. Hồ Chí Minh";
  if (lower.includes("thành phố hà nội")) return "Hà Nội";

  return t;
};

// --- helper: parse API envelope linh hoạt ---
const unwrap = (resData: any) => {
  // backend hay trả { statusCode, message, data }
  // nhưng một số endpoint có thể trả thẳng object/array
  return resData?.data ?? resData;
};

const asIsoString = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
};

const countAvailableSeats = (seats: any[]): number => {
  if (!Array.isArray(seats)) return 0;
  // backend dùng SeatStatus: available / booked / held ...
  return seats.filter((s) => (s?.status || "").toString().toLowerCase() === "available").length;
};

/**
 * ✅ Normalize trip shape từ backend (TripDocument đã populate) -> Trip UI type
 * Backend fields hay gặp:
 * - departureTime, expectedArrivalTime
 * - availableSeatsCount
 * - companyId (object) / vehicleId (object)
 * - route.fromLocationId (object) / route.toLocationId (object)
 */
const normalizeTrip = (t: any): TripModel => {
  const route = t?.route ?? {};
  const fromLoc = route?.fromLocationId;
  const toLoc = route?.toLocationId;

  const dep = asIsoString(t?.departureTime);
  const arr = asIsoString(t?.arrivalTime || t?.expectedArrivalTime);

  const seats = Array.isArray(t?.seats) ? t.seats : [];
  const availableSeats =
    typeof t?.availableSeats === "number"
      ? t.availableSeats
      : typeof t?.availableSeatsCount === "number"
        ? t.availableSeatsCount
        : countAvailableSeats(seats);

  const companyName = t?.company?.name || t?.companyId?.name || "Nhà xe";

  const rawId = t?._id ?? t?.id ?? t?.tripId;
  let _id = "";
  if (rawId) {
    let s = "";
    if (typeof rawId === "string") s = rawId;
    else if ((rawId as any)?.$oid) s = String((rawId as any).$oid);
    else if ((rawId as any)?.oid) s = String((rawId as any).oid);
    else if (typeof (rawId as any)?.toString === "function")
      s = String((rawId as any).toString());
    else s = String(rawId);

    s = String(s || "").trim();
    const m = s.match(/[a-fA-F0-9]{24}/);
    _id = (m ? m[0] : s) || "";
  }

  return {
    _id,
    id: _id,
    from: String(t?.from || fromLoc?.name || ""),
    to: String(t?.to || toLoc?.name || ""),
    departureTime: dep,
    arrivalTime: arr,
    expectedArrivalTime: asIsoString(t?.expectedArrivalTime || arr),
    price: Number(t?.price ?? 0),
    availableSeats,
    company: { name: companyName },
    seats,
    route: route,
    companyId: t?.companyId,
    vehicleId: t?.vehicleId,
    status: t?.status,
  } as any;
};

class BookingService {
  private async resolveLocationIdFromText(
    text: string,
  ): Promise<string | null> {
    const keywordRaw = (text || "").trim();
    if (!keywordRaw) return null;

    const keyword = normalizeLocationQuery(keywordRaw);

    try {
      const res = await searchLocations(keyword);

      if (!Array.isArray(res) || res.length === 0) {
        if (keywordRaw !== keyword) {
          const res2 = await searchLocations(keywordRaw);
          if (Array.isArray(res2) && res2.length > 0) {
            const best2 = res2.find((x: any) => x?.type === "city") ?? res2[0];
            return getLocId(best2);
          }
        }
        return null;
      }

      const cityFirst = res.find((x: any) => x?.type === "city") ?? res[0];

      const lower = keyword.toLowerCase();
      const exact =
        res.find((l: any) => String(l?.name || "").toLowerCase() === lower) ||
        res.find(
          (l: any) => String(l?.province || "").toLowerCase() === lower,
        ) ||
        cityFirst;

      return getLocId(exact);
    } catch (e) {
      console.log("⚠️ resolveLocationIdFromText failed:", e);
      return null;
    }
  }

  async searchTrips(
    params: SearchTripsInput,
    options?: RequestOptions,
  ): Promise<SearchTripsResponse> {
    const USE_MOCK_FALLBACK = false;

    try {
      let fromLocationId: string | undefined;
      let toLocationId: string | undefined;

      if ((params as any).fromLocationId && (params as any).toLocationId) {
        fromLocationId = String((params as any).fromLocationId);
        toLocationId = String((params as any).toLocationId);
      } else {
        const fromText = String((params as any).from || "");
        const toText = String((params as any).to || "");

        fromLocationId =
          (await this.resolveLocationIdFromText(fromText)) || undefined;
        toLocationId =
          (await this.resolveLocationIdFromText(toText)) || undefined;
      }

      const date = String((params as any).date || "");
      const passengers = Number((params as any).passengers ?? 1);

      if (!fromLocationId || !toLocationId || !date) {
        throw new Error(
          `Missing params: fromLocationId=${fromLocationId} toLocationId=${toLocationId} date=${date}`,
        );
      }

      if (!isObjectId(fromLocationId) || !isObjectId(toLocationId)) {
        throw new Error(
          `Invalid ObjectId: fromLocationId=${fromLocationId} toLocationId=${toLocationId}`,
        );
      }

      if (!isYYYYMMDD(date)) {
        throw new Error(`Invalid date format (YYYY-MM-DD required): ${date}`);
      }

      const response = await apiService.get<any>(`/trips/search`, {
        params: { fromLocationId, toLocationId, date, passengers },
        signal: options?.signal,
      });

      // ✅ FIX: unwrap đúng format backend
      const payload = unwrap(response.data) ?? {};

      // ✅ FIX: hỗ trợ nhiều kiểu trả về khác nhau
      const tripsRaw = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.trips)
          ? payload.trips
          : Array.isArray(payload)
            ? payload
            : [];

      const trips = (tripsRaw || []).map(normalizeTrip);

      const total =
        typeof payload?.count === "number"
          ? payload.count
          : typeof payload?.total === "number"
            ? payload.total
            : trips.length;

      console.log(
        "🧾 parsed trips _id =",
        trips.map((t: any) => t?._id),
      );

      return { trips, total, page: 1, limit: 10 };
    } catch (error: any) {
      if (error?.code === "ERR_CANCELED") throw error;

      if (USE_MOCK_FALLBACK) {
        const { generateMockTrips } = require("../../data/trips");
        const from = (params as any).from || "UNKNOWN";
        const to = (params as any).to || "UNKNOWN";
        const date = (params as any).date;

        const mockTrips = generateMockTrips(from, to, date);
        return {
          trips: mockTrips,
          total: mockTrips.length,
          page: 1,
          limit: 10,
        };
      }

      throw error;
    }
  }

  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const response = await apiService.post<Booking>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      payload,
    );
    return unwrap(response.data) as any;
  }

  async getUserBookings(): Promise<any[]> {
    try {
      const response = await apiService.get<any>(
        API_ENDPOINTS.BOOKINGS.USER_BOOKINGS,
      );

      const payload = unwrap(response.data); // có thể là array hoặc object
      const bookings = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.bookings)
          ? payload.bookings
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.bookings)
              ? payload.data.bookings
              : [];

      console.log("🧾 getUserBookings parsed length =", bookings.length);
      return bookings;
    } catch (e) {
      console.log("❌ getUserBookings error:", e);
      return [];
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await apiService.delete(
      API_ENDPOINTS.BOOKINGS.CANCEL.replace(":id", bookingId),
    );
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}`,
    );
    return unwrap(response.data);
  }

  async getTripDetails(tripId: string): Promise<any> {
    if (!tripId || tripId.startsWith("mock_") || !isObjectId(tripId)) {
      const err: any = new Error("INVALID_TRIP_ID");
      err.code = "INVALID_TRIP_ID";
      err.tripId = tripId;
      throw err;
    }

    const response = await apiService.get<any>(`/trips/${tripId}`);
    return unwrap(response.data);
  }

  // Hold booking (POST /bookings/hold)
  async createHold(payload: CreateHoldPayload): Promise<any> {
    const response = await apiService.post<any>(
      API_ENDPOINTS.BOOKINGS.HOLD,
      payload,
    );
    return unwrap(response.data);
  }

  // Mock confirm payment (POST /bookings/:id/confirm)
  async confirmPayment(bookingId: string): Promise<any> {
    const url = API_ENDPOINTS.BOOKINGS.MOCK_CONFIRM_PAYMENT.replace(
      ":id",
      bookingId,
    );
    const response = await apiService.post<any>(url);
    return unwrap(response.data);
  }
}

export const bookingService = new BookingService();
