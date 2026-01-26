import { useEffect, useState } from 'react';
import type { BookingUI } from '../../features/BookingManagement/types';
import { mapBookingFromApi } from '../../contexts/mappers/booking.mapper';
import { fetchBookings } from '../../api/service/booking/booking.api';

export function useBookings() {
  const [data, setData] = useState<BookingUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings()
      .then((res) => setData(res.map(mapBookingFromApi)))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
