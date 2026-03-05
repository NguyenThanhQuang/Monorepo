import { useCallback, useState } from "react";
import { generateMockTrips } from "../data";
import { bookingService } from "../services";
import {
  SearchFormData,
  Trip,
  UseSearchTripsReturn,
} from "../types/index-types";

export const useSearchTrips = (): UseSearchTripsReturn => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrips = useCallback(async (params: SearchFormData) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Searching trips with params:", params);

      // ✅ Ưu tiên gọi API thật (nếu user đã chọn locationId thì gọi thẳng theo id)
      const passengers = Number(params.passengers || 1);
      const input: any = { date: params.departureDate, passengers };

      if (params.fromLocationId && params.toLocationId) {
        input.fromLocationId = params.fromLocationId;
        input.toLocationId = params.toLocationId;
      } else {
        // fallback: dùng text để BookingService resolve locationId
        input.from = params.from;
        input.to = params.to;
      }

      const res = await bookingService.searchTrips(input);

      const apiTrips = Array.isArray((res as any)?.trips)
        ? (res as any).trips
        : [];

      setTrips(apiTrips);

      if (apiTrips.length === 0) {
        setError("Không tìm thấy chuyến đi phù hợp");
      }
    } catch (err) {
      console.error("Error searching trips:", err);
      // Fallback mock để app không bị "trắng" khi backend đang tắt
      const fallback = generateMockTrips(
        params.from,
        params.to,
        params.departureDate,
      );
      setTrips(fallback || []);
      setError(
        fallback?.length
          ? "Backend không phản hồi, đang hiển thị dữ liệu mẫu."
          : "Có lỗi xảy ra khi tìm kiếm chuyến đi",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setTrips([]);
    setError(null);
  }, []);

  return {
    trips,
    loading,
    error,
    searchTrips,
    clearResults,
  };
};
