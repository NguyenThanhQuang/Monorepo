import { useEffect, useState } from 'react';
import { mapBookingFromApi } from '../../contexts/mappers/booking.mapper';
import type { BookingUI } from '@obtp/shared-types';
import { bookingsApi } from '@obtp/api-client';

export function useBookings() {
  const [data, setData] = useState<BookingUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.fetchBookings()
      .then((res) => setData(res.map(mapBookingFromApi)))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
