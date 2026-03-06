import { useModal } from "@/hooks/useModal";
import {
  type CreateDriverPayload,
  type DriverResponse,
} from "@obtp/shared-types";
import { useDriverMutations, useDrivers } from "../api/useDrivers";

export function useDriversViewModel() {
  const { data: drivers = [], isLoading } = useDrivers();
  const { createDriver, updateDriver, deleteDriver } = useDriverMutations();

  const formModal = useModal<DriverResponse | null>();

  const handleOpenAdd = () => {
    formModal.open(null);
  };

  const handleOpenEdit = (driver: DriverResponse) => {
    formModal.open(driver);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn vô hiệu hóa tài xế này? Họ sẽ không thể đăng nhập app.",
      )
    ) {
      deleteDriver.mutate(id);
    }
  };

  const handleSubmitForm = (formData: CreateDriverPayload) => {
    if (formModal.data) {
      updateDriver.mutate(
        { id: formModal.data.id, payload: formData },
        { onSuccess: () => formModal.close() },
      );
    } else {
      createDriver.mutate(formData, {
        onSuccess: () => formModal.close(),
      });
    }
  };

  return {
    state: {
      drivers,
      isLoading,
      isMutating: createDriver.isPending || updateDriver.isPending,
    },
    modals: {
      form: formModal,
    },
    actions: {
      openAdd: handleOpenAdd,
      openEdit: handleOpenEdit,
      deleteDriver: handleDelete,
      submitForm: handleSubmitForm,
    },
  };
}
