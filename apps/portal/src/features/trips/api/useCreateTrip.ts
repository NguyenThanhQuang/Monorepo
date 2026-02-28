import { api } from "@obtp/api-client";
import type { CreateTripPayload, Trip } from "@obtp/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, CreateTripPayload>({
    mutationFn: async (payload) => {
      const res = await api.trips.create(payload);
      if (!res) throw new Error("Không thể tạo chuyến đi");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
};
