import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: "active" | "inactive";
  avatar?: string;
  tripCount?: number;
}

export const useDrivers = () => {
  const user = useCurrentUser();

  return useQuery({
    queryKey: ["drivers", user?.companyId],
    queryFn: async () => {
      return new Promise<Driver[]>((resolve) => {
        setTimeout(
          () =>
            resolve([
              {
                id: "1",
                name: "Nguyễn Văn A",
                phone: "0909123456",
                licenseNumber: "B2-12345",
                status: "active",
                tripCount: 150,
              },
              {
                id: "2",
                name: "Trần Văn B",
                phone: "0918123456",
                licenseNumber: "C-67890",
                status: "inactive",
                tripCount: 45,
              },
            ]),
          500,
        );
      });
    },
    enabled: !!user?.companyId,
  });
};

export const useDriverMutations = () => {
  const queryClient = useQueryClient();

  const createDriver = useMutation({
    mutationFn: async (data: any) => {
      /* call api.drivers.create(data) */
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });

  const deleteDriver = useMutation({
    mutationFn: async (id: string) => {
      /* call api.drivers.delete(id) */
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });

  return { createDriver, deleteDriver };
};
