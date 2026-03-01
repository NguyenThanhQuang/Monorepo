import { api } from "@obtp/api-client";
import type { UpdateCompanyPayload } from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCompanySettings = () => {
  const queryClient = useQueryClient();

  // 1. Fetch thông tin công ty của user đang đăng nhập
  const companyQuery = useQuery({
    queryKey: ["my-company"],
    queryFn: async () => {
      return await api.companies.getMyCompany();
    },
    // Giữ data lâu hơn vì thông tin công ty ít thay đổi
    staleTime: 1000 * 60 * 5,
  });

  // 2. Update thông tin
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCompanyPayload;
    }) => {
      return await api.companies.update(id, payload);
    },
    onSuccess: (data) => {
      toast.success("Cập nhật hồ sơ nhà xe thành công!");
      // Cập nhật lại cache local ngay lập tức
      queryClient.setQueryData(["my-company"], data);
      // Invalidate để đảm bảo đồng bộ
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật hồ sơ.");
    },
  });

  return {
    company: companyQuery.data,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    updateCompany: updateMutation,
  };
};
