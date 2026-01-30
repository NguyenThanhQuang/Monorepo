import type { SearchTripQuery } from '@obtp/shared-types';
import { useEffect, useState } from 'react';
import type { RouteCardVM } from '../../features/RoutesPage/types';
import { fetchTrips } from '../../api/routes.api';
import { mapTripsToRoutes } from '../../contexts/mappers/routes.mapper';

export function useRoutesPage(query: SearchTripQuery) {
  const [routes, setRoutes] = useState<RouteCardVM[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTrips(query)
      .then((trips) => setRoutes(mapTripsToRoutes(trips)))
      .finally(() => setLoading(false));
  }, [query]);

  return { routes, loading };
}
