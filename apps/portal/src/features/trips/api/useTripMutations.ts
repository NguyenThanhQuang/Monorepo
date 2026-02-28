import { api } from "@obtp/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useTripMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTrips = () => {
    queryClient.invalidateQueries({ queryKey: ["trips"] });
  };

  const cancelMutation = useMutation({
    mutationFn: api.trips.cancel,
    onSuccess: invalidateTrips,
  });

  const assignDriverMutation = useMutation({
    mutationFn: async (data: { tripId: string; driverId: string }) => {
      console.log(data);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: invalidateTrips,
  });

  return {
    cancelTrip: cancelMutation,
    assignDriver: assignDriverMutation,
  };
};
