import type { SearchTripQuery } from "@obtp/shared-types";

export async function fetchTrips(query: SearchTripQuery) {
  const params = new URLSearchParams(query as any).toString();

  const res = await fetch(`/api/trips?${params}`);
  if (!res.ok) throw new Error('Failed to fetch trips');

  return res.json();
}
