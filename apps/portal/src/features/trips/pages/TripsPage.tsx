import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useTrips } from "../api/useTrips";
import { useTripMutations } from "../api/useTripMutations";
import { TripStats } from "../components/TripStats";
import { TripTable } from "../components/TripTable";
import { DriverAssignModal } from "../components/DriverAssignModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TripsPage() {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isFetching } = useTrips();
  const { cancelTrip, assignDriver } = useTripMutations();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const filteredTrips = useMemo(() => {
    if (!data?.rawTrips) return [];

    return data.rawTrips.filter((trip) => {
      const route = trip.route as any;
      const fromName = route?.fromLocationId?.name || "";
      const toName = route?.toLocationId?.name || "";
      const vehiclePlate = (trip.vehicleId as any)?.vehicleNumber || "";

      const matchSearch = `${fromName} ${toName} ${vehiclePlate}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "all" || trip.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [data?.rawTrips, searchQuery, filterStatus]);

  const handleCancel = (tripId: string, routeName: string) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn hủy chuyến đi "${routeName}"? Hành động này sẽ hoàn trả lại toàn bộ ghế.`,
      )
    ) {
      cancelTrip.mutate(tripId, {
        onError: (err: any) => alert(err?.message || "Không thể hủy chuyến"),
        onSuccess: () => alert("Đã hủy chuyến đi thành công"),
      });
    }
  };

  const handleAssignDriver = (tripId: string) => {
    setSelectedTripId(tripId);
    setAssignModalOpen(true);
  };

  const executeAssignDriver = () => {
    if (selectedTripId) {
      assignDriver.mutate(
        { tripId: selectedTripId, driverId: "mock-driver-123" },
        {
          onSuccess: () => {
            setAssignModalOpen(false);
            setSelectedTripId(null);
          },
        },
      );
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải danh sách chuyến đi...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Quản lý Chuyến đi</h1>
          <p className="text-slate-500 mt-1">
            Quản lý lịch trình, phân công tài xế và xem trạng thái
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <Button onClick={() => navigate("/company/trips/add")}>
            <Plus size={16} className="mr-2" /> Tạo chuyến mới
          </Button>
        </div>
      </div>

      {data && <TripStats stats={data.stats} />}

      <div className="obtp-card obtp-card-strong p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            className="pl-10"
            placeholder="Tìm theo tuyến đường, biển số xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="obtp-input w-full md:w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Đã lên lịch</option>
          <option value="departed">Đang chạy</option>
          <option value="arrived">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <TripTable
        trips={filteredTrips}
        onEdit={(id) => navigate(`/company/trips/edit/${id}`)}
        onCancel={handleCancel}
        onAssignDriver={handleAssignDriver}
      />

      <DriverAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={executeAssignDriver}
        isLoading={assignDriver.isPending}
      />
    </div>
  );
}
