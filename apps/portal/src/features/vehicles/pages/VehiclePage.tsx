import { useState } from "react";
import { useVehicles, useVehicleMutations } from "../hooks/use-vehicles";
import { VehicleForm } from "../components/VehicleForm";
import { Plus, Edit, Trash2, Bus } from "lucide-react";
import type { Vehicle } from "@obtp/shared-types";
import { Button } from "../../../shared/components/ui/button";
import { Dialog } from "../../../shared/components/ui/dialog";

export const VehiclePage = () => {
  const { data: vehicles, isLoading, isError } = useVehicles();
  const { createMutation, updateMutation, deleteMutation } =
    useVehicleMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingVehicle) {
        await updateMutation.mutateAsync({
          id: editingVehicle.id || editingVehicle._id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert("Có lỗi xảy ra: " + (e as Error).message);
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (isError)
    return <div className="p-8 text-center text-red-500">Lỗi kết nối!</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đội xe</h1>
          <p className="text-gray-500">Danh sách phương tiện vận hành</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" /> Thêm xe mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles?.map((vehicle: Vehicle) => (
          <div
            key={vehicle.id || vehicle._id}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {vehicle.vehicleNumber}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.type}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${vehicle.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                {vehicle.status}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-4 bg-slate-50 p-3 rounded-lg">
              <span>💺 {vehicle.totalSeats} ghế</span>
              <span>🏢 {vehicle.floors} tầng</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOpenEdit(vehicle)}
              >
                <Edit className="w-3 h-3 mr-2" /> Sửa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleDelete(vehicle.id || vehicle._id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingVehicle
            ? `Cập nhật xe ${editingVehicle.vehicleNumber}`
            : "Thêm phương tiện mới"
        }
      >
        <VehicleForm
          initialData={editingVehicle}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Dialog>
    </div>
  );
};
