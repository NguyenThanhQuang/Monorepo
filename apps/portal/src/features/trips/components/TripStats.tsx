import { Bus, Calendar, Clock, Ticket } from "lucide-react";
import type { TripsData } from "../api/useTrips";

export function TripStats({ stats }: { stats: TripsData["stats"] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Bus size={20} />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalTrips}</div>
          <div className="text-sm text-slate-500">Tổng số chuyến</div>
        </div>
      </div>
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <Calendar size={20} />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.scheduledTrips}</div>
          <div className="text-sm text-slate-500">Đã lên lịch</div>
        </div>
      </div>
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
          <Clock size={20} />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.runningTrips}</div>
          <div className="text-sm text-slate-500">Đang chạy</div>
        </div>
      </div>
      <div className="obtp-card obtp-card-strong p-4 flex items-center space-x-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Ticket size={20} />
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
          <div className="text-sm text-slate-500">Vé đã bán</div>
        </div>
      </div>
    </div>
  );
}
