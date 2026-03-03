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

  const { data, isLoading, refetch, isFetching } = useTrips();
  const { cancelTrip, assignDriver, toggleRecurrence } = useTripMutations();

  const [viewMode, setViewMode] = useState<ViewMode>("actual");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const filteredTrips = useMemo(() => {
    if (!data?.rawTrips) return [];

    return data.rawTrips.filter((trip) => {
      if (viewMode === "actual" && trip.isRecurrenceTemplate) return false;
      if (viewMode === "template" && !trip.isRecurrenceTemplate) return false;

      const route = trip.route as any;
      const fromName =
        route?.fromLocationId?.name || route?.fromLocationId || "";
      const toName = route?.toLocationId?.name || route?.toLocationId || "";
      const vehiclePlate = (trip.vehicleId as any)?.vehicleNumber || "";

      const searchStr = `${fromName} ${toName} ${vehiclePlate}`.toLowerCase();
      const matchSearch =
        !searchQuery || searchStr.includes(searchQuery.toLowerCase().trim());

      const matchStatus =
        filterStatus === "all" || trip.status === filterStatus;

      let matchDate = true;
      if (viewMode === "actual" && dateFilter !== "all" && trip.departureTime) {
        const tripDate = new Date(trip.departureTime);
        const now = new Date();

        if (dateFilter === "today") {
          matchDate = tripDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          matchDate = tripDate >= startOfWeek;
        } else if (dateFilter === "month") {
          matchDate =
            tripDate.getMonth() === now.getMonth() &&
            tripDate.getFullYear() === now.getFullYear();
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [data?.rawTrips, searchQuery, filterStatus, dateFilter, viewMode]);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent uppercase tracking-wide">
            Quản lý chuyến đi
          </h1>
          <p className="text-slate-500 mt-2">
            Điều hành lịch trình, gán tài xế và cấu hình chuyến lặp lại
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              toast.info("Đang làm mới dữ liệu...");
            }}
            disabled={isFetching}
            className="rounded-xl border-slate-300 dark:border-slate-700"
          >
            <RefreshCw
              size={16}
              className={cn("mr-2", isFetching && "animate-spin")}
            />
            Làm mới
          </Button>

          <Button
            onClick={() => navigate("/company/trips/add")}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg"
          >
            <Plus size={16} className="mr-2" />
            Tạo chuyến mới
          </Button>
        </div>
      </div>

      {/* STATS */}
      {data && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 shadow-inner">
          <TripStats stats={data.stats} />
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewMode("actual")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold transition-all",
            viewMode === "actual"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500",
          )}
        >
          Chuyến đi thực tế
        </button>

        <button
          onClick={() => setViewMode("template")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold transition-all",
            viewMode === "template"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500",
          )}
        >
          Chuyến mẫu (Lặp lại)
        </button>
      </div>

      {/* FILTER BAR */}
      <div
        className="
    rounded-2xl
    bg-slate-50 dark:bg-slate-900
    border border-slate-200 dark:border-slate-800
    shadow-sm
    p-5
    flex flex-col lg:flex-row gap-4
    transition-colors duration-300
  "
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 
      text-slate-400 dark:text-slate-500"
            size={18}
          />
          <Input
            className="
        h-11
        pl-11
        rounded-xl
        border border-slate-300 dark:border-slate-700
        bg-white dark:bg-slate-950
        text-slate-700 dark:text-slate-200
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/40
        transition-colors
      "
            placeholder="Tìm theo tuyến đường, biển số..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {viewMode === "actual" && (
          <>
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="
          h-11 min-w-[190px]
          rounded-xl
          border border-slate-300 dark:border-slate-700
          bg-white dark:bg-slate-950
          text-slate-700 dark:text-slate-200
          px-4 text-sm
          shadow-sm
          appearance-none
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/40
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition-colors
        "
            >
              <option value="all">Tất cả lịch sử</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="
          h-11 min-w-[190px]
          rounded-xl
          border border-slate-300 dark:border-slate-700
          bg-white dark:bg-slate-950
          text-slate-700 dark:text-slate-200
          px-4 text-sm
          shadow-sm
          appearance-none
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/40
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition-colors
        "
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="departed">Đang chạy</option>
              <option value="arrived">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </>
        )}
      </div>
      {/* TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <TripTable
          trips={filteredTrips}
          viewMode={viewMode}
          onEdit={(id) => navigate(`/company/trips/edit/${id}`)}
          onCancel={handleCancel}
          onAssignDriver={handleAssignDriver}
          onToggleRecurrence={handleToggleRecurrence}
        />
      </div>

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
