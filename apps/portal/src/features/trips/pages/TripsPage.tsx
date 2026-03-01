import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, CalendarDays } from "lucide-react";
import { useTrips } from "../api/useTrips";
import { useTripMutations } from "../api/useTripMutations";
import { TripStats } from "../components/TripStats";
import { TripTable } from "../components/TripTable";
import { DriverAssignModal } from "../components/DriverAssignModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "actual" | "template";

export default function TripsPage() {
  const navigate = useNavigate();

  // -- API Hooks --
  const { data, isLoading, refetch, isFetching } = useTrips();
  const { cancelTrip, assignDriver, toggleRecurrence } = useTripMutations();

  // -- Local UI State --
  const [viewMode, setViewMode] = useState<ViewMode>("actual");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // -- Logic lọc dữ liệu dựa trên ViewMode và Search --
  const filteredTrips = useMemo(() => {
    if (!data?.rawTrips) return [];

    return data.rawTrips.filter((trip) => {
      // 1. Lọc theo Tab (Chuyến thực tế vs Chuyến mẫu)
      if (viewMode === "actual" && trip.isRecurrenceTemplate) return false;
      if (viewMode === "template" && !trip.isRecurrenceTemplate) return false;

      // 2. Lọc theo Search Query (Tuyến đường, biển số)
      const route = trip.route as any;
      const fromName = route?.fromLocationId?.name || "";
      const toName = route?.toLocationId?.name || "";
      const vehiclePlate = (trip.vehicleId as any)?.vehicleNumber || "";

      const matchSearch = `${fromName} ${toName} ${vehiclePlate}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 3. Lọc theo trạng thái vận hành
      const matchStatus =
        filterStatus === "all" || trip.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [data?.rawTrips, searchQuery, filterStatus, viewMode]);

  // -- Event Handlers --
  const handleCancel = (tripId: string, routeName: string) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn hủy chuyến đi "${routeName}"? Hành động này sẽ hoàn trả lại toàn bộ ghế.`,
      )
    ) {
      cancelTrip.mutate(tripId);
    }
  };

  const handleAssignDriver = (tripId: string) => {
    setSelectedTripId(tripId);
    setAssignModalOpen(true);
  };

  const executeAssignDriver = (driverId: string) => {
    if (selectedTripId) {
      assignDriver.mutate(
        { tripId: selectedTripId, driverId },
        {
          onSuccess: () => {
            setAssignModalOpen(false);
            setSelectedTripId(null);
          },
        },
      );
    }
  };

  const handleToggleRecurrence = (tripId: string, currentStatus: boolean) => {
    toggleRecurrence.mutate({ id: tripId, isActive: !currentStatus });
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-slate-500 animate-pulse">
        <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <p className="font-medium">Đang tải danh sách chuyến đi...</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Quản lý Vận hành Chuyến đi
          </h1>
          <p className="text-slate-500 mt-1">
            Điều hành lịch trình, gán tài xế và cấu hình chuyến lặp lại
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              toast.info("Đang làm mới dữ liệu...");
            }}
            disabled={isFetching}
            className="bg-white dark:bg-slate-900"
          >
            <RefreshCw
              size={16}
              className={cn("mr-2", isFetching && "animate-spin")}
            />
            Làm mới
          </Button>
          <Button
            onClick={() => navigate("/company/trips/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} className="mr-2" /> Tạo chuyến mới
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      {data && <TripStats stats={data.stats} />}

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setViewMode("actual")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all",
            viewMode === "actual"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
          )}
        >
          Chuyến đi thực tế
        </button>
        <button
          onClick={() => setViewMode("template")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all",
            viewMode === "template"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
          )}
        >
          Chuyến mẫu (Lặp lại)
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="obtp-card obtp-card-strong p-4 flex flex-col md:flex-row gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-inner">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            placeholder="Tìm theo tuyến đường (ví dụ: Đà Lạt), biển số xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {viewMode === "actual" && (
          <select
            className="obtp-input w-full md:w-56 cursor-pointer bg-white dark:bg-slate-950"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="departed">Đang chạy</option>
            <option value="arrived">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        )}
      </div>

      {/* DATA TABLE */}
      <TripTable
        trips={filteredTrips}
        viewMode={viewMode}
        onEdit={(id) => navigate(`/company/trips/edit/${id}`)}
        onCancel={handleCancel}
        onAssignDriver={handleAssignDriver}
        onToggleRecurrence={handleToggleRecurrence}
      />

      {/* MODALS */}
      <DriverAssignModal
        isOpen={assignModalOpen}
        tripId={selectedTripId}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedTripId(null);
        }}
        onAssign={executeAssignDriver}
        isLoading={assignDriver.isPending}
      />
    </div>
  );
}
