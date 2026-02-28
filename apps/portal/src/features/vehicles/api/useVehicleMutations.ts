import { api } from "@obtp/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useVehicleMutations = () => {
  const queryClient = useQueryClient();

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  };

  const createMutation = useMutation({
    mutationFn: api.vehicles.create,
    onSuccess: invalidateList,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.vehicles.update(id, payload),
    onSuccess: invalidateList,
  });

  const deleteMutation = useMutation({
    mutationFn: api.vehicles.delete,
    onSuccess: invalidateList,
  });

  return {
    createVehicle: createMutation,
    updateVehicle: updateMutation,
    deleteVehicle: deleteMutation,
  };
};
