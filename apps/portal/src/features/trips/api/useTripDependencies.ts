import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import {
  VehicleStatus,
  type LocationResponse,
  type Vehicle,
} from "@obtp/shared-types";
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
    queryKey: ["vehicles", companyId, "only-active"],
    queryFn: async () => {
      if (!companyId) return [];
      const data = await api.vehicles.findAll(companyId);

      return data.filter((v) => v.status === VehicleStatus.ACTIVE) as Vehicle[];
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
