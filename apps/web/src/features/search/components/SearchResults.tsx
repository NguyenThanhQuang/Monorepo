import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Coffee,
  Snowflake,
  Monitor,
  Clock,
  Star,
  SlidersHorizontal,
  ArrowRight,
  PhoneCall,
  BusFront,
  CalendarX,
  Search,
  X,
} from "lucide-react";
import type { Trip } from "@obtp/shared-types";
import { tripsApi } from "@obtp/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResultsProps {
  fromProvince: string;
  toProvince: string;
  date?: string;
  onBack: () => void;
  onTripSelect: (tripId: string) => void;
}

export function SearchResults({
  fromProvince,
  toProvince,
  date,
  onBack,
  onTripSelect,
}: SearchResultsProps) {
  const { t } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"price" | "time" | "duration">("time");

  useEffect(() => {
    if (!fromProvince || !toProvince) return;

    const fetchTrips = async () => {
      setLoading(true);
      try {
        const finalDate = date ?? new Date().toISOString().split("T")[0];

        const data = await tripsApi.searchByProvinces(
          fromProvince,
          toProvince,
          finalDate,
        );

        setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("SEARCH ERROR", err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [fromProvince, toProvince, date]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const calculateDuration = (
    departureTime: string | Date,
    arrivalTime: string | Date,
  ) => {
    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const diffMs = arrTime.getTime() - depTime.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "time") {
      return (
        new Date(a.departureTime).getTime() -
        new Date(b.departureTime).getTime()
      );
    }
    if (sortBy === "duration") {
      const durationA =
        new Date(a.expectedArrivalTime).getTime() -
        new Date(a.departureTime).getTime();
      const durationB =
        new Date(b.expectedArrivalTime).getTime() -
        new Date(b.departureTime).getTime();
      return durationA - durationB;
    }
    return 0;
  });

  const amenityIcons: Record<string, { icon: any; label: string }> = {
    wifi: { icon: Wifi, label: "Wi-Fi" },
    coffee: { icon: Coffee, label: "Đồ uống" },
    ac: { icon: Snowflake, label: "Điều hòa" },
    tv: { icon: Monitor, label: "TV" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!trips.length) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 transition-colors duration-300">
        {/* Một vòng tròn sáng nhẹ phía sau làm nền */}
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Hình minh họa - Một chiếc xe buýt với dấu X mờ */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <BusFront className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("noTripsFound") || "Rất tiếc, chưa tìm thấy chuyến xe nào"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed px-6">
              Hiện tại chưa có chuyến xe nào từ{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{fromProvince}"
              </span>{" "}
              đi{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{toProvince}"
              </span>{" "}
              vào ngày{" "}
              {date
                ? new Date(date).toLocaleDateString("vi-VN")
                : "bạn đã chọn"}
              .
            </p>
          </div>

          {/* Gợi ý hành động */}
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bạn có thể thử:
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 text-left space-y-3 mx-auto max-w-xs">
              <li className="flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-blue-500" /> Chọn một ngày
                khác xa hơn.
              </li>
              <li className="flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-500" /> Kiểm tra lại địa
                điểm xuất phát/đích.
              </li>
            </ul>
          </div>

          {/* Nhóm nút bấm */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-blue-600 to-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("changeSearch") || "Thay đổi tìm kiếm"}
            </button>

            <button
              onClick={() => (window.location.href = "tel:19006067")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              {t("support") || "Hỗ trợ"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Kết quả tìm kiếm
            </h1>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <SlidersHorizontal className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {fromProvince} → {toProvince}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {date
                        ? new Date(date).toLocaleDateString("vi-VN")
                        : "Hôm nay"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSortBy("time")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                sortBy === "time"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Giờ đi
            </button>
            <button
              onClick={() => setSortBy("price")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                sortBy === "price"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Giá
            </button>
            <button
              onClick={() => setSortBy("duration")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                sortBy === "duration"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Thời gian
            </button>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Tìm thấy{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {sortedTrips.length} chuyến xe
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {sortedTrips.map((trip) => {
            const duration = calculateDuration(
              trip.departureTime,
              trip.expectedArrivalTime,
            );

            const companyName = tripsApi.getCompanyName(trip);
            const companyLogo = tripsApi.getCompanyLogo(trip);
            const vehicleType = tripsApi.getVehicleType(trip);
            const amenities = tripsApi.getVehicleAmenities(trip);
            const fromLocationName =
              tripsApi.getFromLocationName(trip) || fromProvince;
            const toLocationName =
              tripsApi.getToLocationName(trip) || toProvince;

            const companyRating = (trip as any).companyAvgRating ?? 4.8;
            const companyReviewCount = (trip as any).companyReviewCount ?? 234;

            const availableSeats =
              trip.availableSeatsCount ??
              trip.seats?.filter((s: any) => s.status === "available").length ??
              0;

            const departureTimeFormatted = new Date(
              trip.departureTime,
            ).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const arrivalTimeFormatted = new Date(
              trip.expectedArrivalTime,
            ).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={trip._id || trip.id}
                onClick={() => onTripSelect(trip._id || trip.id)}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                {/* Company Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={companyName}
                        className="w-12 h-12 rounded-2xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).parentElement?.classList.add(
                            "bg-gradient-to-br",
                            "from-blue-600",
                            "to-teal-500",
                            "rounded-2xl",
                            "flex",
                            "items-center",
                            "justify-center",
                            "text-white",
                            "font-bold",
                            "text-lg",
                          );
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {companyName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">
                        {companyName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {companyRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          ({companyReviewCount} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(trip.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {availableSeats} chỗ còn trống
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-2xl text-gray-900 dark:text-white mb-1">
                      {departureTimeFormatted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {fromLocationName}
                    </div>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="relative">
                      <div className="border-t-2 border-gray-300 dark:border-gray-600"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-2xl text-gray-900 dark:text-white mb-1">
                      {arrivalTimeFormatted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {toLocationName}
                    </div>
                  </div>
                </div>

                {/* Bus Type & Amenities */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                      {vehicleType}
                    </span>
                    <div className="flex items-center space-x-2">
                      {amenities.slice(0, 4).map((amenity) => {
                        const amenityKey = amenity.toLowerCase();
                        const amenityConfig = amenityIcons[amenityKey];
                        if (!amenityConfig) return null;

                        const Icon = amenityConfig.icon;
                        return (
                          <div
                            key={amenity}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                            title={amenityConfig.label}
                          >
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                        );
                      })}
                      {amenities.length > 4 && (
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                          +{amenities.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <span>Chi tiết</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
