import { useEffect, useMemo, useState } from 'react';
import api from '../../../../portal/src/api/api';
import { useLanguage } from '../../contexts/LanguageContext';
import type { RouteManagementTrip, TripStatusUI } from '@obtp/shared-types';

export function useRouteManagementLogic() {
  const { t } = useLanguage();

  const [trips, setTrips] = useState<RouteManagementTrip[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TripStatusUI>('all');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    const res = await api.get('/trips/management/all');

    const mapped: RouteManagementTrip[] = res.data.map((trip: any) => {
      const totalSeats = trip.seats?.length ?? 0;
      const availableSeats = trip.availableSeatsCount ?? 0;

      return {
        id: trip.id,

        fromName: trip.route.fromLocation?.name ?? '',
        toName: trip.route.toLocation?.name ?? '',

        departureTime: new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        arrivalTime: new Date(trip.expectedArrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(trip.departureTime).toISOString().slice(0, 10),

        vehiclePlate: trip.vehicle?.vehicleNumber ?? '',

        price: trip.price,
        totalSeats,
        availableSeats,

        status: trip.status.toLowerCase(),
      };
    });

    setTrips(mapped);
    setLoading(false);
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch =
        `${t.fromName} ${t.toName} ${t.vehiclePlate}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [trips, searchQuery, filterStatus]);

  return {
    t,
    loading,

    trips: filteredTrips,

    searchQuery,
    setSearchQuery,

    filterStatus,
    setFilterStatus,
  };
}
