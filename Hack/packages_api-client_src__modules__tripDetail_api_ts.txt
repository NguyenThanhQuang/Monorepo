// src/pages/trip-detail/tripDetail.api.ts

import { TripDetailResponse } from "@obtp/shared-types";


export async function getTripDetail(
  tripId: string,
): Promise<TripDetailResponse> {
  const res = await fetch(`/api/trips/${tripId}`);
  if (!res.ok) throw new Error('Không lấy được chi tiết chuyến đi');
  return res.json();
}
