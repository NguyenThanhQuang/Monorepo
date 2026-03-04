import { VehicleStatus, type Vehicle } from "@obtp/shared-types";
import { Bus, Wrench, CheckCircle } from "lucide-react";

export function VehicleStats({ vehicles }: { vehicles: Vehicle[] }) {
  const total = vehicles.length;
  const active = vehicles.filter(
    (v) => v.status === VehicleStatus.ACTIVE,
  ).length;
  const maintenance = vehicles.filter(
    (v) => v.status === VehicleStatus.MAINTENANCE,
  ).length;
  const totalSeats = vehicles
    .filter((v) => v.status === VehicleStatus.ACTIVE)
    .reduce((sum, v) => sum + (v.totalSeats || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Bus size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-slate-500">Tổng số xe</div>
        </div>
      </div>
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <CheckCircle size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold">{active}</div>
          <div className="text-sm text-slate-500">Đang hoạt động</div>
        </div>
      </div>
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
          <Wrench size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold">{maintenance}</div>
          <div className="text-sm text-slate-500">Bảo trì</div>
        </div>
      </div>
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Bus size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold">{totalSeats}</div>
          <div className="text-sm text-slate-500">Tổng ghế khả dụng</div>
        </div>
      </div>
    </div>
  );
}
