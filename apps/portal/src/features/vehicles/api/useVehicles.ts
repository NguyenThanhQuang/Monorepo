import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import { useQuery } from "@tanstack/react-query";

export const useVehicles = () => {
  const user = useCurrentUser();
  const companyId = user?.companyId;

  return useQuery({
    queryKey: ["vehicles", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return await api.vehicles.findAll(companyId);
    },
    enabled: !!companyId,
  });
};
