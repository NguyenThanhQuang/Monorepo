import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import type { Trip } from "@obtp/shared-types";
import { TripStatus } from "@obtp/shared-types";
import { useQuery } from "@tanstack/react-query";

export interface TripsData {
  rawTrips: Trip[];
  stats: {
    totalTrips: number;
    scheduledTrips: number;
    runningTrips: number;
    totalTicketsSold: number;
  };
}

export const useTrips = () => {
  const user = useCurrentUser();
  const companyId = user?.companyId;

  return useQuery<Trip[], Error, TripsData>({
    queryKey: ["trips", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return await api.trips.getAllManagement(companyId);
    },
    enabled: !!companyId,
    select: (trips) => {
      let totalTicketsSold = 0;
      let scheduledTrips = 0;
      let runningTrips = 0;
      let actualTotalTrips = 0;

      trips.forEach((trip) => {
        if (trip.isRecurrenceTemplate) return;

        actualTotalTrips++;

        if (trip.status === TripStatus.SCHEDULED) scheduledTrips++;
        if (trip.status === TripStatus.DEPARTED) runningTrips++;

        const vehicle = trip.vehicleId as any;
        const totalSeats = trip.totalSeats || vehicle?.totalSeats || 40;
        const available = trip.availableSeatsCount || 0;
        totalTicketsSold += Math.max(0, totalSeats - available);
      });

      return {
        rawTrips: trips,
        stats: {
          totalTrips: actualTotalTrips,
          scheduledTrips,
          runningTrips,
          totalTicketsSold,
        },
      };
    },
  });
};
