import type { SearchTripQuery, TripCardVM } from '@obtp/shared-types';
import { useEffect, useState } from 'react';
import { searchTrips } from '../../api/searchResults.api';
import { mapTripToCardVM } from '../../contexts/mappers/searchResults.mapper';


export function useSearchResults(query: SearchTripQuery) {
  const [trips, setTrips] = useState<TripCardVM[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    searchTrips(query)
      .then((data) => setTrips(data.map(mapTripToCardVM)))
      .finally(() => setLoading(false));
  }, [query]);

  return { trips, loading };
}
