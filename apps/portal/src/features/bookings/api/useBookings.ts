import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useBookings = () => {
  const user = useCurrentUser();

  return useQuery({
    queryKey: ["bookings", user?.companyId],
    queryFn: async () => {
      return await api.bookings.getCompanyBookings();
    },
    enabled: !!user?.companyId,
  });
};

export const useBookingMutations = () => {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: api.bookings.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
    },
  });

  return { cancelBooking: cancelMutation };
};
