import { adminApi } from "@obtp/api-client";
import type { RevenueFilterParams } from "@obtp/shared-types";
import { useQuery } from "@tanstack/react-query";

export function useRevenueStats(params: RevenueFilterParams) {
  return useQuery({
    queryKey: ["revenue", params],
    queryFn: () => adminApi.getRevenueStats(params),
    staleTime: 5 * 60 * 1000,
  });
}
