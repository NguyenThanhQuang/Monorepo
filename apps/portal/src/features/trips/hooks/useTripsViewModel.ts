import { useModal } from "@/hooks/useModal";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTripMutations } from "../api/useTripMutations";
import { useTrips } from "../api/useTrips";

type ViewMode = "actual" | "template";

export function useTripsViewModel() {
  const { data, isLoading, refetch, isFetching } = useTrips();
  const { cancelTrip, assignDriver, toggleRecurrence } = useTripMutations();

  const [viewMode, setViewMode] = useState<ViewMode>("actual");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const assignModal = useModal<string>();

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

  const handleRefresh = () => {
    refetch();
    toast.info("Đang làm mới dữ liệu...");
  };

  const handleCancelTrip = (tripId: string, routeName: string) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn hủy chuyến đi "${routeName}"? Hành động này sẽ hoàn trả lại toàn bộ ghế.`,
      )
    ) {
      cancelTrip.mutate(tripId);
    }
  };

  const handleAssignDriver = (driverId: string) => {
    if (assignModal.data) {
      assignDriver.mutate(
        { tripId: assignModal.data, driverId },
        { onSuccess: () => assignModal.close() },
      );
    }
  };

  const handleToggleRecurrence = (tripId: string, currentStatus: boolean) => {
    toggleRecurrence.mutate({ id: tripId, isActive: !currentStatus });
  };

  return {
    state: {
      isLoading,
      isFetching,
      stats: data?.stats,
      trips: filteredTrips,
      viewMode,
    },
    filters: {
      searchQuery,
      setSearchQuery,
      filterStatus,
      setFilterStatus,
      dateFilter,
      setDateFilter,
      setViewMode,
    },
    modals: {
      assign: assignModal,
    },
    actions: {
      refresh: handleRefresh,
      cancelTrip: handleCancelTrip,
      assignDriver: handleAssignDriver,
      toggleRecurrence: handleToggleRecurrence,
    },
  };
}
