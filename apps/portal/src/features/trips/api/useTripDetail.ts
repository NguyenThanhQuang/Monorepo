import { api } from "@obtp/api-client";
import { useQuery } from "@tanstack/react-query";

export const useTripDetail = (id?: string) => {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const res = await api.trips.getDetail(id!);
      return (res as any).data || res;
    },
    enabled: !!id,
  });
};
