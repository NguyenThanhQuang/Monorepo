import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Ticket,
  Download,
  Star,
  Bus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock4,
  Users,
  X,
  XCircle as XCircleIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi, reviewsApi, tripsApi } from "@obtp/api-client";
import type { Booking } from "@obtp/shared-types";
import { useLanguage } from "@/contexts/LanguageContext";

export function MyTripsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getMyBookings();

      let bookingsData: Booking[] = [];
      if (Array.isArray(response)) {
        bookingsData = response;
      } else if (
        response &&
        (response as any).data &&
        Array.isArray((response as any).data)
      ) {
        bookingsData = (response as any).data;
      }

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải lịch sử chuyến đi", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    fetchBookings();
  };

  const getTripStatus = (booking: Booking) => {
    if (!booking.tripId) return "unknown";
    const departureTime = (booking.tripId as any).departureTime
      ? new Date((booking.tripId as any).departureTime)
      : new Date();

    if (booking.status === "cancelled") return "cancelled";
    if (departureTime > new Date()) return "upcoming";
    return "completed";
  };

  const filteredBookings = bookings.filter((booking) => {
    const tripStatus = getTripStatus(booking);
    if (selectedTab === "all") return true;
    if (selectedTab === "upcoming")
      return tripStatus === "upcoming" && booking.status !== "cancelled";
    if (selectedTab === "completed") return tripStatus === "completed";
    if (selectedTab === "cancelled") return booking.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" /> Đã xác nhận
          </span>
        );
      case "held":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock4 className="w-4 h-4" /> Đang giữ chỗ
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle className="w-4 h-4" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" /> {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0f172a] to-[#020617] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Chuyến đi của tôi</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {["all", "upcoming", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap capitalize ${
                selectedTab === tab
                  ? "bg-linear-to-r from-blue-600 to-teal-500 text-white"
                  : "bg-[#1e293b] text-gray-400 hover:bg-[#2d3a4f]"
              }`}
            >
              {tab === "all"
                ? "Tất cả"
                : tab === "upcoming"
                  ? "Sắp đi"
                  : tab === "completed"
                    ? "Đã đi"
                    : "Đã hủy"}
            </button>
          ))}
        </div>

        {/* List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-[#1e293b] rounded-2xl p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có chuyến đi nào</h3>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-teal-500 rounded-xl font-medium hover:from-blue-700 hover:to-teal-600 transition-all mt-4"
            >
              Đặt vé ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id || booking.id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onReview={() => {
                  setSelectedBooking(booking);
                  setShowReviewModal(true);
                }}
                onDownload={() => toast.success("Đang tải vé...")}
                getStatusBadge={getStatusBadge}
                getTripStatus={getTripStatus}
              />
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedBooking && !showReviewModal && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onReview={() => setShowReviewModal(true)}
            onDownload={() => toast.success("Đang tải vé...")}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Review Modal */}
        {showReviewModal && selectedBooking && (
          <ReviewModal
            booking={selectedBooking}
            onClose={() => setShowReviewModal(false)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onViewDetails,
  onReview,
  onDownload,
  getStatusBadge,
  getTripStatus,
}: any) {
  const tripStatus = getTripStatus(booking);
  const canReview =
    tripStatus === "completed" &&
    booking.status === "confirmed" &&
    !booking.reviewId;
  const trip = booking.tripId || {};
  const route = trip.route || {};

  return (
    <div
      className="bg-[#1e293b] rounded-2xl p-6 hover:bg-[#2d3a4f] transition-all cursor-pointer border border-gray-800 hover:border-blue-500/50"
      onClick={onViewDetails}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Bus className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">
              Mã vé:{" "}
              <span className="text-white font-mono">
                {booking.ticketCode || "Đang xử lý"}
              </span>
            </span>
            {booking.reviewId && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                <Star className="w-3 h-3 fill-yellow-400" /> Đã đánh giá
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-medium">
              {route.fromLocationId?.name || "..."} →{" "}
              {route.toLocationId?.name || "..."}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{tripsApi.formatTripDate(trip.departureTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{booking.passengers?.length || 0} khách</span>
            </div>
          </div>
          <div className="mt-3">{getStatusBadge(booking.status)}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-semibold text-blue-400">
              {tripsApi.formatPrice(booking.totalAmount)}
            </div>
            <div
              className={`text-sm ${booking.paymentStatus === "paid" ? "text-green-400" : "text-yellow-400"}`}
            >
              {booking.paymentStatus === "paid"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </div>
          </div>

          <div className="flex gap-2">
            {canReview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReview();
                }}
                className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-all"
                title="Đánh giá"
              >
                <Star className="w-5 h-5" />
              </button>
            )}
            {booking.ticketCode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all"
                title="Tải vé"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingDetailsModal({
  booking,
  onClose,
  onReview,
  onDownload,
  getStatusBadge,
}: any) {
  const trip = booking.tripId || {};
  const route = trip.route || {};

  const tripStatus = trip.departureTime
    ? new Date(trip.departureTime) > new Date()
      ? "upcoming"
      : "completed"
    : "unknown";
  const canReview =
    tripStatus === "completed" &&
    booking.status === "confirmed" &&
    !booking.reviewId;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#020617] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-400" /> Chi tiết đặt vé
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">{getStatusBadge(booking.status)}</div>

        <div className="bg-[#0f172a] p-4 rounded-xl mb-6 border border-blue-500/30">
          <div className="text-sm text-gray-400 mb-1">Mã vé</div>
          <div className="text-xl font-mono font-bold text-blue-400">
            {booking.ticketCode || "Đang xử lý"}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a] p-4 rounded-xl">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-400" /> Thông tin chuyến đi
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nhà xe:</span>{" "}
                <span>{trip.companyId?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tuyến:</span>{" "}
                <span>
                  {route.fromLocationId?.name} → {route.toLocationId?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Khởi hành:</span>{" "}
                <span>
                  {tripsApi.formatDate(trip.departureTime)}{" "}
                  {tripsApi.formatTime(trip.departureTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-xl">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Hành khách
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Liên hệ:</span>{" "}
                <span>{booking.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SĐT:</span>{" "}
                <span>{booking.contactPhone}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                {booking.passengers?.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between text-gray-300 py-1"
                  >
                    <span>{p.name}</span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 rounded">
                      Ghế {p.seatNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {canReview && (
            <button
              onClick={() => {
                onClose();
                onReview();
              }}
              className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" /> Đánh giá
            </button>
          )}
          {booking.ticketCode && (
            <button
              onClick={onDownload}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Tải vé
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#334155] hover:bg-[#475569] rounded-xl font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ booking, onClose, onSuccess }: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Vui lòng chọn số sao");

    try {
      setLoading(true);
      await reviewsApi.create({
        bookingId: booking._id || booking.id,
        tripId: booking.tripId?._id || booking.tripId?.id,
        rating,
        comment,
      });
      onSuccess();
    } catch (error) {
      toast.error("Gửi đánh giá thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#020617] rounded-2xl p-6 w-full max-w-lg border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-6">
          <h3 className="text-lg font-semibold flex gap-2">
            <Star className="w-5 h-5 text-yellow-400" /> Đánh giá chuyến đi
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-10 h-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows={4}
            className="w-full px-4 py-3 bg-[#0f172a] border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white mb-6 resize-none"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#334155] rounded-xl font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-yellow-600 rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
