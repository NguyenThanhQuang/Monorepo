import { useState } from "react";
import { useTrips, useTripMutations } from "../hooks/use-trips";
import { TripForm } from "../components/TripForm";
import { Plus, Clock, ArrowRight } from "lucide-react";
import type { CreateTripPayload } from "@obtp/shared-types";
import { Button } from "../../../shared/components/ui/button";
import { Dialog } from "../../../shared/components/ui/dialog";

export const TripPage = () => {
  const { data: trips, isLoading, isError } = useTrips();
  const { createMutation, cancelMutation } = useTripMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: CreateTripPayload) => {
    try {
      const formattedData = {
        ...data,
        departureTime: new Date(data.departureTime).toISOString(),
        expectedArrivalTime: new Date(data.expectedArrivalTime).toISOString(),
      };

      await createMutation.mutateAsync(formattedData);
      setIsModalOpen(false);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleCancelTrip = async (id: string) => {
    if (confirm("Bạn có chắc muốn hủy chuyến này? Vé đã đặt sẽ bị hủy.")) {
      await cancelMutation.mutateAsync(id);
    }
  };

  if (isLoading)
    return <div className="p-10 text-center">Đang tải lịch trình...</div>;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu.
      </div>
    );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Lịch trình
          </h1>
          <p className="text-gray-500">Danh sách các chuyến đi sắp khởi hành</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Tạo chuyến mới
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Tuyến đường</th>
              <th className="px-6 py-4">Khởi hành</th>
              <th className="px-6 py-4">Xe</th>
              <th className="px-6 py-4 text-center">Ghế trống</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {trips?.map((trip: any) => (
              <tr
                key={trip._id || trip.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    {trip.route?.fromLocationId?.name || "N/A"}
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    {trip.route?.toLocationId?.name || "N/A"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {trip.price.toLocaleString("vi-VN")} đ
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {new Date(trip.departureTime).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">
                  {trip.vehicleId?.vehicleNumber || "---"}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {trip.availableSeatsCount} /{" "}
                    {trip.vehicleId?.totalSeats || "?"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`capitalize ${trip.status === "scheduled" ? "text-blue-600 font-medium" : "text-slate-500"}`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {trip.status === "scheduled" && (
                    <button
                      onClick={() => handleCancelTrip(trip._id || trip.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors text-xs font-medium"
                    >
                      Hủy chuyến
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {trips?.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  Chưa có chuyến đi nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thiết lập Lộ trình & Chuyến đi"
        className="max-w-4xl"
      >
        <TripForm
          isLoading={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Dialog>
    </div>
  );
};
