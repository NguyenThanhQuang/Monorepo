import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { VehicleStatus, type Vehicle } from "@obtp/shared-types";
import { Button } from "@/components/ui/button";
import { SafetyConfirmModal } from "@/components/ui/SafetyConfirmModal";
import { useVehicleMutations } from "../api/useVehicleMutations";
import { useVehicles } from "../api/useVehicles";
import { VehicleFormModal } from "../components/VehicleFormModal";
import { VehicleStats } from "../components/VehicleStats";
import { VehicleTable } from "../components/VehicleTable";

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading, refetch, isFetching } = useVehicles();
  const { createVehicle, updateVehicle, deleteVehicle } = useVehicleMutations();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDeleteId, setVehicleToDeleteId] = useState<string | null>(
    null,
  );

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{
    id: string;
    status: VehicleStatus;
  } | null>(null);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (editingVehicle) {
      updateVehicle.mutate(
        { id: editingVehicle.id, payload: formData },
        {
          onSuccess: () => {
            toast.success("Cập nhật thông tin xe thành công!");
            setIsFormModalOpen(false);
          },
          onError: (err: any) =>
            toast.error(err.message || "Cập nhật thất bại"),
        },
      );
    } else {
      createVehicle.mutate(formData, {
        onSuccess: () => {
          toast.success("Đã thêm xe mới vào đội hình!");
          setIsFormModalOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Không thể tạo xe"),
      });
    }
  };

  const handleStatusChangeRequest = (id: string, newStatus: VehicleStatus) => {
    setStatusTarget({ id, status: newStatus });
    setIsStatusModalOpen(true);
  };

  const executeStatusChange = () => {
    if (!statusTarget) return;
    updateVehicle.mutate(
      { id: statusTarget.id, payload: { status: statusTarget.status } },
      {
        onSuccess: () => {
          toast.success("Trạng thái phương tiện đã được cập nhật");
          setIsStatusModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Lỗi hệ thống khi đổi trạng thái");
          setIsStatusModalOpen(false);
        },
      },
    );
  };

  const handleDeleteRequest = (id: string) => {
    setVehicleToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!vehicleToDeleteId) return;
    deleteVehicle.mutate(vehicleToDeleteId, {
      onSuccess: () => {
        toast.success("Phương tiện đã được chuyển sang trạng thái Ngừng HD");
        setIsDeleteModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Không thể xóa xe lúc này");
        setIsDeleteModalOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold animate-pulse uppercase tracking-widest text-xs">
          Đang đồng bộ đội xe...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Quản lý Xe
          </h1>
          <p className="text-slate-500 mt-1">
            Danh sách đội xe và cấu hình sơ đồ ghế trực quan
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-white dark:bg-slate-900"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin mr-2" : "mr-2"}
            />
            Làm mới
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} className="mr-2" /> Thêm xe mới
          </Button>
        </div>
      </div>

      {/* THỐNG KÊ NHANH */}
      <VehicleStats vehicles={vehicles} />

      {/* BẢNG DỮ LIỆU CHÍNH */}
      <VehicleTable
        vehicles={vehicles}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
        onStatusChange={handleStatusChangeRequest}
      />

      {/*THÊM / SỬA THÔNG SỐ (Tích hợp Safety 10s bên trong cho tạo mới) */}
      <VehicleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        vehicleToEdit={editingVehicle}
        onSubmit={handleFormSubmit}
        isLoading={createVehicle.isPending || updateVehicle.isPending}
      />

      {/* XÁC NHẬN ĐỔI TRẠNG THÁI NHANH (3 Giây) */}
      <SafetyConfirmModal
        isOpen={isStatusModalOpen}
        seconds={3}
        title="Thay đổi trạng thái"
        variant={
          statusTarget?.status === VehicleStatus.ACTIVE ? "primary" : "danger"
        }
        confirmText="Xác nhận thay đổi"
        description={
          statusTarget?.status === VehicleStatus.ACTIVE
            ? "Xác nhận đưa phương tiện trở lại hoạt động để sẵn sàng gán vào các chuyến đi mới."
            : "Xác nhận đưa xe vào chế độ bảo trì. Hệ thống sẽ tạm ngưng hiển thị xe này khi lập lịch chuyến đi."
        }
        onConfirm={executeStatusChange}
        onCancel={() => setIsStatusModalOpen(false)}
        isLoading={updateVehicle.isPending}
      />

      {/* XÁC NHẬN XÓA / NGỪNG HD (10 Giây) */}
      <SafetyConfirmModal
        isOpen={isDeleteModalOpen}
        seconds={10}
        title="Xác nhận ngừng hoạt động"
        variant="danger"
        confirmText="Tôi chắc chắn"
        description="CẢNH BÁO: Bạn đang yêu cầu ngừng hoạt động phương tiện vĩnh viễn. Hành động này chỉ có thể thực hiện nếu xe không còn chuyến đi nào chưa hoàn thành."
        onConfirm={executeDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={deleteVehicle.isPending}
      />
    </div>
  );
}
