import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrivers, useDriverMutations } from "../api/useDrivers";
import { DriverTable } from "../components/DriverTable";

export default function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const { deleteDriver } = useDriverMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài xế này?")) {
      deleteDriver.mutate(id);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải danh sách tài xế...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">Quản lý Tài xế</h1>
          <p className="text-slate-500 mt-1">
            Danh sách đội ngũ lái xe và thông tin bằng lái
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Thêm tài xế
        </Button>
      </div>

      <DriverTable
        drivers={drivers}
        onEdit={(d) => console.log("Edit", d)}
        onDelete={handleDelete}
      />
    </div>
  );
}
