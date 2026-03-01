import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@obtp/api-client";
import type { UpdateBookingCustomerPayload } from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

  const updateCustomerMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBookingCustomerPayload;
    }) => {
      return api.bookings.updateCustomerInfo(id, payload);
    },
    onSuccess: () => {
      toast.success("Đã cập nhật thông tin khách hàng.");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật thất bại");
    },
  });

  return {
    cancelBooking: cancelMutation,
    updateCustomerInfo: updateCustomerMutation,
  };
};
