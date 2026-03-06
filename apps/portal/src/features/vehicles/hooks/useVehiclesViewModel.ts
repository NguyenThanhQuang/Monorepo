import { useModal } from "@/hooks/useModal";
import {
  VehicleStatus,
  type CreateVehiclePayload,
  type Vehicle,
} from "@obtp/shared-types";
import { toast } from "sonner";
import { useVehicleMutations } from "../api/useVehicleMutations";
import { useVehicles } from "../api/useVehicles";

export function useVehiclesViewModel() {
  const { data: vehicles = [], isLoading, refetch, isFetching } = useVehicles();
  const { createVehicle, updateVehicle, deleteVehicle } = useVehicleMutations();

  const formModal = useModal<Vehicle | null>();

  const deleteModal = useModal<string>();

  const statusModal = useModal<{ id: string; status: VehicleStatus }>();

  const handleOpenAdd = () => formModal.open(null);

  const handleOpenEdit = (vehicle: Vehicle) => formModal.open(vehicle);

  const handleSubmitForm = (formData: CreateVehiclePayload) => {
    const isEdit = !!formModal.data;

    if (isEdit && formModal.data) {
      updateVehicle.mutate(
        { id: formModal.data.id, payload: formData },
        {
          onSuccess: () => {
            toast.success("Cập nhật thông tin xe thành công!");
            formModal.close();
          },
          onError: (err: any) =>
            toast.error(err.message || "Cập nhật thất bại"),
        },
      );
    } else {
      createVehicle.mutate(formData, {
        onSuccess: () => {
          toast.success("Đã thêm xe mới vào đội hình!");
          formModal.close();
        },
        onError: (err: any) => toast.error(err.message || "Không thể tạo xe"),
      });
    }
  };

  const handleRequestStatusChange = (id: string, newStatus: VehicleStatus) => {
    statusModal.open({ id, status: newStatus });
  };

  const handleConfirmStatusChange = () => {
    if (!statusModal.data) return;
    const { id, status } = statusModal.data;

    updateVehicle.mutate(
      { id, payload: { status } },
      {
        onSuccess: () => {
          toast.success("Trạng thái phương tiện đã được cập nhật");
          statusModal.close();
        },
        onError: (err: any) => {
          toast.error(err.message || "Lỗi hệ thống khi đổi trạng thái");
          statusModal.close();
        },
      },
    );
  };

  const handleRequestDelete = (id: string) => {
    deleteModal.open(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.data) return;

    deleteVehicle.mutate(deleteModal.data, {
      onSuccess: () => {
        toast.success("Phương tiện đã được chuyển sang trạng thái Ngừng HD");
        deleteModal.close();
      },
      onError: (err: any) => {
        toast.error(err.message || "Không thể xóa xe lúc này");
        deleteModal.close();
      },
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.info("Đang làm mới dữ liệu...");
  };

  return {
    state: {
      vehicles,
      isLoading,
      isFetching,
      isMutating:
        createVehicle.isPending ||
        updateVehicle.isPending ||
        deleteVehicle.isPending,
    },
    modals: {
      form: formModal,
      status: statusModal,
      delete: deleteModal,
    },
    actions: {
      refresh: handleRefresh,
      openAdd: handleOpenAdd,
      openEdit: handleOpenEdit,
      submitForm: handleSubmitForm,
      requestStatusChange: handleRequestStatusChange,
      confirmStatusChange: handleConfirmStatusChange,
      requestDelete: handleRequestDelete,
      confirmDelete: handleConfirmDelete,
    },
  };
}
