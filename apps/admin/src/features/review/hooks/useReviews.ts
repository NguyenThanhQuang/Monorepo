import { reviewsApi } from "@obtp/api-client";
import type { ReviewQuery } from "@obtp/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useReviews(params?: ReviewQuery) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: () => reviewsApi.getAllAdmin(params),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      reviewsApi.toggleVisibility(id, isVisible),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success(
        variables.isVisible ? "Đã hiển thị đánh giá" : "Đã ẩn đánh giá",
      );
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật trạng thái."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Đã xóa đánh giá thành công");
    },
    onError: () => toast.error("Xóa đánh giá thất bại."),
  });

  return {
    ...query,
    toggleVisibility: toggleVisibilityMutation.mutateAsync,
    deleteReview: deleteMutation.mutateAsync,
    isMutating: toggleVisibilityMutation.isPending || deleteMutation.isPending,
  };
}
