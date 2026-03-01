import { api } from "@obtp/api-client";
import { useQuery } from "@tanstack/react-query";

export const useCompanyReviews = () => {
  return useQuery({
    queryKey: ["company-reviews"],
    queryFn: async () => {
      return await api.reviews.getCompanyReviews();
    },
  });
};
