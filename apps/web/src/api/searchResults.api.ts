import type { SearchTripQuery } from '@obtp/shared-types';

export async function searchTrips(query: SearchTripQuery) {
  const params = new URLSearchParams(query as any).toString();

  const res = await fetch(`/api/trips?${params}`);
  if (!res.ok) throw new Error('Search trips failed');

  return res.json();
}
