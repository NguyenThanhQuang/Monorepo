import { adminApi } from "@obtp/api-client";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "admin-stats"],
    queryFn: async () => {
      const data = await adminApi.getDashboardStats();
      return data;
    },
    staleTime: 60 * 1000,
  });
}
