import { api } from "@obtp/api-client";
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
} from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDrivers = () => {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      return await api.drivers.getCompanyDrivers();
    },
  });
};

export const useDriverMutations = () => {
  const queryClient = useQueryClient();

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
  };

  const createDriver = useMutation({
    mutationFn: async (data: CreateDriverPayload) => {
      return await api.drivers.createDriver(data);
    },
    onSuccess: () => {
      toast.success("Thêm tài xế thành công");
      invalidateList();
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi thêm tài xế");
    },
  });

  const updateDriver = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDriverPayload;
    }) => {
      return await api.drivers.updateDriver(id, payload);
    },
    onSuccess: () => {
      toast.success("Cập nhật thông tin tài xế thành công");
      invalidateList();
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi cập nhật");
    },
  });

  const deleteDriver = useMutation({
    mutationFn: async (id: string) => {
      return await api.drivers.deleteDriver(id);
    },
    onSuccess: () => {
      toast.success("Đã vô hiệu hóa tài xế");
      invalidateList();
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi xóa");
    },
  });

  return { createDriver, updateDriver, deleteDriver };
};
