import { useState } from "react";
import type { Vehicle } from "@obtp/shared-types";
import { Plus } from "lucide-react";

import { useVehicles } from "../api/useVehicles";
import { useVehicleMutations } from "../api/useVehicleMutations";

import { VehicleStats } from "../components/VehicleStats";
import { VehicleTable } from "../components/VehicleTable";
import { VehicleFormModal } from "../components/VehicleFormModal";
import { Button } from "@/components/ui/button";

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useVehicles();
  const { createVehicle, updateVehicle, deleteVehicle } = useVehicleMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa xe này? Hành động này sẽ vô hiệu hóa xe.",
      )
    ) {
      deleteVehicle.mutate(id, {
        onError: (err: any) => alert(err.message || "Xóa thất bại"),
      });
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingVehicle) {
      updateVehicle.mutate(
        { id: editingVehicle.id, payload: formData },
        {
          onSuccess: () => setIsModalOpen(false),
          onError: (err: any) => alert(err.message),
        },
      );
    } else {
      createVehicle.mutate(formData, {
        onSuccess: () => setIsModalOpen(false),
        onError: (err: any) => alert(err.message),
      });
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Quản lý Xe</h1>
          <p className="text-slate-500 mt-1">
            Danh sách đội xe và cấu hình sơ đồ ghế
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} className="mr-2" /> Thêm xe mới
        </Button>
      </div>

      <VehicleStats vehicles={vehicles} />

      <VehicleTable
        vehicles={vehicles}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicleToEdit={editingVehicle}
        onSubmit={handleSubmit}
        isLoading={createVehicle.isPending || updateVehicle.isPending}
      />
    </div>
  );
}
