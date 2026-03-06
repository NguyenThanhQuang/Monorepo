import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, CalendarDays } from "lucide-react";
import { useTripsViewModel } from "../hooks/useTripsViewModel";
import { TripStats } from "../components/TripStats";
import { TripTable } from "../components/TripTable";
import { DriverAssignModal } from "../components/DriverAssignModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function TripsPage() {
  const navigate = useNavigate();

  const { state, filters, modals, actions } = useTripsViewModel();

  if (state.isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 animate-pulse">
        <CalendarDays className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <p className="font-medium">Đang tải danh sách chuyến đi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent uppercase tracking-wide">
            Quản lý chuyến đi
          </h1>
          <p className="text-slate-500 mt-2">
            Điều hành lịch trình, gán tài xế và cấu hình chuyến lặp lại
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={actions.refresh}
            disabled={state.isFetching}
            className="rounded-xl border-slate-300 dark:border-slate-700"
          >
            <RefreshCw
              size={16}
              className={cn("mr-2", state.isFetching && "animate-spin")}
            />
            Làm mới
          </Button>

          <Button
            onClick={() => navigate("/company/trips/add")}
            className="rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg"
          >
            <Plus size={16} className="mr-2" />
            Tạo chuyến mới
          </Button>
        </div>
      </div>

      {/* STATS */}
      {state.stats && (
        <div className="rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 shadow-inner">
          <TripStats stats={state.stats} />
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-3">
        <button
          onClick={() => filters.setViewMode("actual")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold transition-all",
            state.viewMode === "actual"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500",
          )}
        >
          Chuyến đi thực tế
        </button>

        <button
          onClick={() => filters.setViewMode("template")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold transition-all",
            state.viewMode === "template"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500",
          )}
        >
          Chuyến mẫu (Lặp lại)
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col lg:flex-row gap-4 transition-colors duration-300">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={18}
          />
          <Input
            className="h-11 pl-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
            placeholder="Tìm theo tuyến đường, biển số..."
            value={filters.searchQuery}
            onChange={(e) => filters.setSearchQuery(e.target.value)}
          />
        </div>

        {state.viewMode === "actual" && (
          <>
            <select
              value={filters.dateFilter}
              onChange={(e) => filters.setDateFilter(e.target.value)}
              className="h-11 min-w-[190px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 px-4 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <option value="all">Tất cả lịch sử</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>

            <select
              value={filters.filterStatus}
              onChange={(e) => filters.setFilterStatus(e.target.value)}
              className="h-11 min-w-[190px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 px-4 text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
          trips={state.trips}
          viewMode={state.viewMode}
          onEdit={(id) => navigate(`/company/trips/edit/${id}`)}
          onCancel={actions.cancelTrip}
          onAssignDriver={modals.assign.open}
          onToggleRecurrence={actions.toggleRecurrence}
        />
      </div>

      {/* MODALS */}
      <DriverAssignModal
        isOpen={modals.assign.isOpen}
        tripId={modals.assign.data}
        onClose={modals.assign.close}
        onAssign={actions.assignDriver}
        isLoading={false}
      />
    </div>
  );
}
