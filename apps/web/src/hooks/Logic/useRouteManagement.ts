import { useEffect, useMemo, useState } from 'react';
import { tripApi } from '../../api/service/trips/trips.api';

export function useRouteManagement() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await tripApi.getManagementTrips();
      setTrips(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchSearch =
        t.route?.fromLocationId?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        t.vehicleId?.vehicleNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchStatus =
        filterStatus === 'all' || t.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [trips, searchQuery, filterStatus]);

  const cancelTrip = async (id: string) => {
    await tripApi.cancelTrip(id);
    fetchTrips();
  };

  return {
    trips: filteredTrips,
    loading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    cancelTrip,
  };
}
