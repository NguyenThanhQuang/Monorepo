import { usersApi } from "@obtp/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useUsers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const data = await usersApi.getAllUsers();
      return data.map((user) => ({
        ...user,
        totalTrips: user.totalTrips ?? 0,
        totalSpent: user.totalSpent ?? 0,
      }));
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      usersApi.updateStatus(userId, { isBanned }),

    onMutate: async ({ userId, isBanned }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previousUsers = queryClient.getQueryData(["admin-users"]);

      queryClient.setQueryData(["admin-users"], (old: any) =>
        old?.map((u: any) => (u.id === userId ? { ...u, isBanned } : u)),
      );

      return { previousUsers };
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isBanned ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!",
      );
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(["admin-users"], context?.previousUsers);
      toast.error(
        err?.response?.data?.message || "Cập nhật trạng thái thất bại.",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    ...query,
    toggleBanStatus: toggleBanMutation.mutateAsync,
    isMutating: toggleBanMutation.isPending,
  };
}
