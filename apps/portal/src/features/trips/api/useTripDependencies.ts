import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import { useQuery } from "@tanstack/react-query";

export const useTripDependencies = () => {
  const user = useCurrentUser();
  const companyId = user?.companyId;

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: async () => await api.locations.findAll(),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return await api.vehicles.findAll(companyId);
    },
    enabled: !!companyId,
  });

  return {
    locations: locationsQuery.data || [],
    vehicles: vehiclesQuery.data || [],
    isLoading: locationsQuery.isLoading || vehiclesQuery.isLoading,
    isError: locationsQuery.isError || vehiclesQuery.isError,
    companyId,
  };
};
