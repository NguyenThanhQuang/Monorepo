import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import type { LocationResponse, Vehicle } from "@obtp/shared-types";
import { useQuery } from "@tanstack/react-query";

export const useTripDependencies = () => {
  const user = useCurrentUser();
  const companyId = user?.companyId;

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const data = await api.locations.findAll();
      return data as LocationResponse[];
    },
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const data = await api.vehicles.findAll(companyId);
      return data as Vehicle[];
    },
    enabled: !!companyId,
  });

  return {
    locations: (locationsQuery.data ?? []) as LocationResponse[],
    vehicles: (vehiclesQuery.data ?? []) as Vehicle[],
    isLoading: locationsQuery.isLoading || vehiclesQuery.isLoading,
    isError: locationsQuery.isError || vehiclesQuery.isError,
    companyId,
  };
};
