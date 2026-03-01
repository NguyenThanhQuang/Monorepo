import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DriverResponse, CreateDriverPayload } from "@obtp/shared-types";
import { useDrivers, useDriverMutations } from "../api/useDrivers";
import { DriverTable } from "../components/DriverTable";
import { DriverFormModal } from "../components/DriverFormModal";

export default function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const { createDriver, updateDriver, deleteDriver } = useDriverMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverResponse | null>(
    null,
  );

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: DriverResponse) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
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

  const handleSubmit = (formData: CreateDriverPayload) => {
    if (editingDriver) {
      updateDriver.mutate(
        { id: editingDriver.id, payload: formData },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createDriver.mutate(formData, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-slate-500">
        Đang tải danh sách tài xế...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Quản lý Tài xế
          </h1>
          <p className="text-slate-500 mt-1">
            Danh sách nhân sự lái xe và hồ sơ bằng lái
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18} className="mr-2" /> Thêm tài xế mới
        </Button>
      </div>

      <DriverTable
        drivers={drivers}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <DriverFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        driverToEdit={editingDriver}
        onSubmit={handleSubmit}
        isLoading={createDriver.isPending || updateDriver.isPending}
      />
    </div>
  );
}
