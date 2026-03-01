import { useLanguage } from "@/contexts/LanguageContext";
import { companiesApi } from "@obtp/api-client";
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCompanies() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch danh sách
  const query = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.getAllWithStats(),
  });

  // Mutation: Tạo mới
  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyPayload) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(t("successCreateCompany"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("errorCreateCompany"));
    },
  });

  // Mutation: Cập nhật
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyPayload }) =>
      companiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(t("successUpdateCompany"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("errorUpdateCompany"));
    },
  });

  return {
    ...query,
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending,
  };
}
