import { Plus, RefreshCw } from "lucide-react";
import { VehicleStatus } from "@obtp/shared-types";
import { Button } from "@/components/ui/button";
import { SafetyConfirmModal } from "@/components/ui/SafetyConfirmModal";
import { VehicleStats } from "../components/VehicleStats";
import { VehicleTable } from "../components/VehicleTable";
import { VehicleFormModal } from "../components/VehicleFormModal";
import { useVehiclesViewModel } from "../hooks/useVehiclesViewModel";

export default function VehiclesPage() {
  const { state, modals, actions } = useVehiclesViewModel();

  if (state.isLoading) {
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
      {/* HEADER */}
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
            onClick={actions.refresh}
            disabled={state.isFetching}
            className="bg-white dark:bg-slate-900"
          >
            <RefreshCw
              size={16}
              className={state.isFetching ? "animate-spin mr-2" : "mr-2"}
            />
            Làm mới
          </Button>
          <Button
            onClick={actions.openAdd}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} className="mr-2" /> Thêm xe mới
          </Button>
        </div>
      </div>

      {/* STATS */}
      <VehicleStats vehicles={state.vehicles} />

      {/* TABLE */}
      <VehicleTable
        vehicles={state.vehicles}
        onEdit={actions.openEdit}
        onDelete={actions.requestDelete}
        onStatusChange={actions.requestStatusChange}
      />

      {/* FORM THÊM/SỬA */}
      <VehicleFormModal
        isOpen={modals.form.isOpen}
        onClose={modals.form.close}
        vehicleToEdit={modals.form.data || null}
        onSubmit={actions.submitForm}
        isLoading={state.isMutating}
      />

      {/* CONFIRM STATUS CHANGE */}
      <SafetyConfirmModal
        isOpen={modals.status.isOpen}
        seconds={3}
        title="Thay đổi trạng thái"
        variant={
          modals.status.data?.status === VehicleStatus.ACTIVE
            ? "primary"
            : "danger"
        }
        confirmText="Xác nhận thay đổi"
        description={
          modals.status.data?.status === VehicleStatus.ACTIVE
            ? "Xác nhận đưa phương tiện trở lại hoạt động để sẵn sàng gán vào các chuyến đi mới."
            : "Xác nhận đưa xe vào chế độ bảo trì. Hệ thống sẽ tạm ngưng hiển thị xe này khi lập lịch chuyến đi."
        }
        onConfirm={actions.confirmStatusChange}
        onCancel={modals.status.close}
        isLoading={state.isMutating}
      />

      {/* CONFIRM DELETE */}
      <SafetyConfirmModal
        isOpen={modals.delete.isOpen}
        seconds={10}
        title="Xác nhận ngừng hoạt động"
        variant="danger"
        confirmText="Tôi chắc chắn"
        description="CẢNH BÁO: Bạn đang yêu cầu ngừng hoạt động phương tiện vĩnh viễn. Hành động này chỉ có thể thực hiện nếu xe không còn chuyến đi nào chưa hoàn thành."
        onConfirm={actions.confirmDelete}
        onCancel={modals.delete.close}
        isLoading={state.isMutating}
      />
    </div>
  );
}
