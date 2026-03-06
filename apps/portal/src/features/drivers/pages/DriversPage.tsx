import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverTable } from "../components/DriverTable";
import { DriverFormModal } from "../components/DriverFormModal";
import { useDriversViewModel } from "../hooks/useDriversViewModel";

export default function DriversPage() {
  const { state, modals, actions } = useDriversViewModel();

  if (state.isLoading)
    return (
      <div className="p-12 text-center text-slate-500">
        Đang tải danh sách tài xế...
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
          onClick={actions.openAdd}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18} className="mr-2" /> Thêm tài xế mới
        </Button>
      </div>

      <DriverTable
        drivers={state.drivers}
        onEdit={actions.openEdit}
        onDelete={actions.deleteDriver}
      />

      <DriverFormModal
        isOpen={modals.form.isOpen}
        onClose={modals.form.close}
        driverToEdit={modals.form.data || null}
        onSubmit={actions.submitForm}
        isLoading={state.isMutating}
      />
    </div>
  );
}
