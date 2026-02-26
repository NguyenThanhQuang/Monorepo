import { vehiclesApi } from "@obtp/api-client";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../core/auth/auth-store";

const VEHICLE_KEYS = {
  all: ["vehicles"] as const,
  list: (companyId: string) =>
    [...VEHICLE_KEYS.all, "list", companyId] as const,
};

export const useVehicles = () => {
  const user = useAuthStore((state) => state.user);
  const companyId = user?.companyId;

  // QUERY: Lấy danh sách xe
  const query = useQuery({
    queryKey: VEHICLE_KEYS.list(companyId || ""),
    queryFn: async () => {
      if (!companyId) return [];
      // Gọi API lấy xe theo companyId (kiểm tra lại vehiclesApi trong api-client có hàm này chưa)
      // Giả sử: vehiclesApi.findAll(companyId)
      const res = await vehiclesApi.findAll(companyId);
      return res;
    },
    enabled: !!companyId, // Chỉ fetch khi có companyId
  });

  return query;
};

export const useVehicleMutations = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const companyId = user?.companyId || "";

  // MUTATION: Tạo xe mới
  const createMutation = useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehiclesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.list(companyId) });
    },
  });

  // MUTATION: Cập nhật xe
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehiclePayload }) =>
      vehiclesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.list(companyId) });
    },
  });

  // MUTATION: Xóa xe
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.list(companyId) });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
