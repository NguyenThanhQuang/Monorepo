import { locationsApi } from "@obtp/api-client";
import { useQuery } from "@tanstack/react-query";

export const useLocations = () => {
  return useQuery({
    queryKey: ["locations", "list"],
    queryFn: async () => {
      const res = await locationsApi.findAll();
      return res || [];
    },
    staleTime: 1000 * 60 * 60,
  });
};
