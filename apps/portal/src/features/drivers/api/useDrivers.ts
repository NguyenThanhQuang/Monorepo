import { api } from "@obtp/api-client";
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
} from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getErrorMessage = (error: any) => {
  if (error?.message && Array.isArray(error.message)) {
    return error.message.map((e: any) => e.message).join(" | ");
  }
  if (error?.errors && Array.isArray(error.errors)) {
    return error.errors.map((e: any) => e.message).join(" | ");
  }
  return error?.message || "Đã có lỗi xảy ra.";
};

export const useDrivers = () => {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => await api.drivers.getCompanyDrivers(),
  });
};

export const useDriverMutations = () => {
  const queryClient = useQueryClient();
  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["drivers"] });

  const createDriver = useMutation({
    mutationFn: (data: CreateDriverPayload) => api.drivers.createDriver(data),
    onSuccess: () => {
      toast.success("Thêm tài xế thành công");
      invalidateList();
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateDriver = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDriverPayload;
    }) => api.drivers.updateDriver(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công");
      invalidateList();
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteDriver = useMutation({
    mutationFn: (id: string) => api.drivers.deleteDriver(id),
    onSuccess: () => {
      toast.success("Đã vô hiệu hóa tài xế");
      invalidateList();
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  return { createDriver, updateDriver, deleteDriver };
};
