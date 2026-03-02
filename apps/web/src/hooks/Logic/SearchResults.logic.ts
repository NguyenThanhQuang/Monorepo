// src/hooks/useSearchResults.ts

import { useEffect, useState } from 'react';
import type { SearchTripQuery, TripCardVM } from '@obtp/shared-types';
import { tripsApi } from '@obtp/api-client';
import { mapTripToCardVM } from '../../contexts/mappers/searchResults.mapper';

export function useSearchResults(query: SearchTripQuery) {
  const [trips, setTrips] = useState<TripCardVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra dữ liệu đầu vào hợp lệ
    if (!query.fromLocationId || !query.toLocationId || !query.date) {
      setTrips([]);
      return;
    }

    const fetchTrips = async () => {
      setLoading(true);
      setError(null);

      try {
        // Chuyển đổi query sang params mà API yêu cầu (fromId, toId)
        const params = {
          fromId: query.fromLocationId,
          toId: query.toLocationId,
          date: query.date,
          ...(query.passengers && { passengers: query.passengers }),
        };

        // Gọi API - response có thể là mảng hoặc object chứa data
        const response = (await tripsApi.searchTrips(params)) as unknown;

        // Xác định mảng dữ liệu trips từ response
        let tripsData: unknown[] = [];

        if (Array.isArray(response)) {
          // Trường hợp API trả về trực tiếp mảng các trip
          tripsData = response;
        } else if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          Array.isArray((response as any).data)
        ) {
          // Trường hợp API trả về { data: [...] }
          tripsData = (response as any).data;
        } else {
          console.warn('Unexpected response format from searchTrips', response);
        }

        // Chuyển đổi từng trip sang ViewModel (mapTripToCardVM đã xử lý cấu trúc dữ liệu)
        const mappedTrips = tripsData.map((item: any) => mapTripToCardVM(item));
        setTrips(mappedTrips);
      } catch (err) {
        console.error('Error searching trips:', err);
        setError('Không thể tìm kiếm chuyến đi. Vui lòng thử lại sau.');
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [query.fromLocationId, query.toLocationId, query.date, query.passengers]);

  return { trips, loading, error };
}