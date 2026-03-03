import { api } from "@obtp/api-client";
import type { UpdateTripPayload } from "@obtp/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTripMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTrips = () => {
    queryClient.invalidateQueries({ queryKey: ["trips"] });
  };

  const cancelMutation = useMutation({
    mutationFn: api.trips.cancel,
    onSuccess: () => {
      toast.success("Hủy chuyến thành công!");
      invalidateTrips();
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({
      tripId,
      driverId,
    }: {
      tripId: string;
      driverId: string;
    }) => {
      return await api.trips.assignDriver(tripId, driverId);
    },
    onSuccess: () => {
      toast.success("Phân công tài xế thành công!");
      invalidateTrips();
    },
    onError: (err: any) => {
      toast.error(err.message || "Phân công thất bại");
    },
  });

  const toggleRecurrenceMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      return api.trips.toggleRecurrence(id, isActive);
    },
    onSuccess: () => {
      toast.success("Cập nhật trạng thái tự động lặp thành công!");
      invalidateTrips();
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTripPayload;
    }) => {
      return api.trips.update(id, payload);
    },
    onSuccess: () => {
      toast.success("Cập nhật chuyến đi thành công!");
      invalidateTrips();
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật thất bại");
    },
  });

  return {
    cancelTrip: cancelMutation,
    assignDriver: assignDriverMutation,
    toggleRecurrence: toggleRecurrenceMutation,
    updateTrip: updateMutation,
  };
};
