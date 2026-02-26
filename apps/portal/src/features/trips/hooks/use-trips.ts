import { tripsApi } from "@obtp/api-client";
import type { CreateTripPayload } from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../core/auth/auth-store";

const TRIP_KEYS = {
  all: ["trips"] as const,
  list: (companyId: string) => [...TRIP_KEYS.all, "list", companyId] as const,
};

export const useTrips = () => {
  const companyId = useAuthStore((s) => s.user?.companyId || "");

  const query = useQuery({
    queryKey: TRIP_KEYS.list(companyId),
    queryFn: async () => {
      if (!companyId) return [];
      const res = await tripsApi.getAllManagement(companyId);
      return res;
    },
    enabled: !!companyId,
  });

  return { ...query, companyId };
};

export const useTripMutations = () => {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || "");

  const createMutation = useMutation({
    mutationFn: (data: CreateTripPayload) => tripsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.list(companyId) });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => tripsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.list(companyId) });
    },
  });

  return { createMutation, cancelMutation };
};
