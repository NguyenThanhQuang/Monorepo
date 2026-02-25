import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Ticket,
  Download,
  Star,
  Bus,
  ChevronRight,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock4,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ReviewModal } from './ReviewModal';
import type { Booking } from '@obtp/shared-types';
import { bookingsApi } from '../api/service/booking/booking.api';

interface MyTripsPageProps {
  onBack: () => void;
}

export function MyTripsPage({ onBack }: MyTripsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getMyBookings();
      console.log('Bookings response:', response);
      
      // Xử lý response
      let bookingsData: Booking[] = [];
      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (Array.isArray(response)) {
          bookingsData = response;
        }
      }
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải lịch sử chuyến đi', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handleReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    fetchBookings(); // Refresh để cập nhật trạng thái đã đánh giá
    toast.success('Cảm ơn bạn đã đánh giá chuyến đi!', {
      duration: 3000,
      position: 'top-center',
      icon: '⭐',
    });
  };

  const handleDownloadTicket = (booking: Booking) => {
    // TODO: Implement download ticket
    toast.success('Đang tải vé xuống...', {
      duration: 2000,
      position: 'top-center',
      icon: '📥',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Đã xác nhận
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <Clock4 className="w-4 h-4" />
            Đang giữ chỗ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            {status}
          </span>
        );
    }
  };

  const getTripStatus = (booking: Booking) => {
    if (!booking.tripId) return 'unknown';
    
    const now = new Date();
    const departureTime = new Date(booking.tripId.departureTime);
    
    if (booking.status === 'cancelled') return 'cancelled';
    if (departureTime > now) return 'upcoming';
    return 'completed';
  };

  const filteredBookings = bookings.filter(booking => {
    const tripStatus = getTripStatus(booking);
    if (selectedTab === 'all') return true;
    if (selectedTab === 'upcoming') return tripStatus === 'upcoming' && booking.status !== 'cancelled';
    if (selectedTab === 'completed') return tripStatus === 'completed';
    if (selectedTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={onBack} className="text-white hover:text-blue-400 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">Chuyến đi của tôi</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="text-white hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Chuyến đi của tôi</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton 
            active={selectedTab === 'all'} 
            onClick={() => setSelectedTab('all')}
          >
            Tất cả ({bookings.length})
          </TabButton>
          <TabButton 
            active={selectedTab === 'upcoming'} 
            onClick={() => setSelectedTab('upcoming')}
          >
            Sắp đi ({bookings.filter(b => getTripStatus(b) === 'upcoming' && b.status !== 'cancelled').length})
          </TabButton>
          <TabButton 
            active={selectedTab === 'completed'} 
            onClick={() => setSelectedTab('completed')}
          >
            Đã đi ({bookings.filter(b => getTripStatus(b) === 'completed').length})
          </TabButton>
          <TabButton 
            active={selectedTab === 'cancelled'} 
            onClick={() => setSelectedTab('cancelled')}
          >
            Đã hủy ({bookings.filter(b => b.status === 'cancelled').length})
          </TabButton>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-[#1e293b] rounded-2xl p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có chuyến đi nào</h3>
            <p className="text-gray-400 mb-6">
              {selectedTab === 'all' 
                ? 'Bạn chưa đặt vé nào. Hãy bắt đầu hành trình của bạn!'
                : `Không có chuyến đi ${
                    selectedTab === 'upcoming' ? 'sắp tới' : 
                    selectedTab === 'completed' ? 'đã hoàn thành' : 'đã hủy'
                  }`}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-medium hover:from-blue-700 hover:to-teal-600 transition-all"
            >
              Đặt vé ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onViewDetails={handleViewDetails}
                onReview={handleReview}
                onDownload={handleDownloadTicket}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getTripStatus={getTripStatus}
              />
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && !showReviewModal && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={handleCloseDetails}
            onReview={handleReview}
            onDownload={handleDownloadTicket}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
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

/* ===== TAB BUTTON ===== */
function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white'
          : 'bg-[#1e293b] text-gray-400 hover:bg-[#2d3a4f]'
      }`}
    >
      {children}
    </button>
  );
}

/* ===== BOOKING CARD ===== */
function BookingCard({
  booking,
  onViewDetails,
  onReview,
  onDownload,
  getStatusBadge,
  formatDate,
  formatCurrency,
  getTripStatus,
}: any) {
  const tripStatus = getTripStatus(booking);
  const canReview = tripStatus === 'completed' && booking.status === 'confirmed' && !booking.reviewId;

  const getPassengerNames = () => {
    if (!booking.passengers || booking.passengers.length === 0) return '';
    return booking.passengers.map((p: any) => p.name).join(', ');
  };

  const getSeatNumbers = () => {
    if (!booking.passengers || booking.passengers.length === 0) return '';
    return booking.passengers.map((p: any) => p.seatNumber).join(', ');
  };

  return (
    <div 
      className="bg-[#1e293b] rounded-2xl p-6 hover:bg-[#2d3a4f] transition-all cursor-pointer border border-gray-800 hover:border-blue-500/50"
      onClick={() => onViewDetails(booking)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Trip Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Bus className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">
              Mã vé: <span className="text-white font-mono">{booking.ticketCode || 'Đang xử lý'}</span>
            </span>
            {booking.reviewId && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                <Star className="w-3 h-3 fill-yellow-400" />
                Đã đánh giá
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-medium">
              {booking.tripId?.route?.fromLocationId?.name || 'N/A'} → {booking.tripId?.route?.toLocationId?.name || 'N/A'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.tripId?.departureTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{booking.passengers?.length || 0} hành khách</span>
            </div>
            {booking.passengers && booking.passengers.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Ghế:</span>
                <span className="text-blue-400">{booking.passengers.map((p: any) => p.seatNumber).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-semibold text-blue-400">
              {formatCurrency(booking.totalAmount)}
            </div>
            <div className={`text-sm ${
              booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </div>
          </div>

          <div className="flex gap-2">
            {canReview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReview(booking);
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
                  onDownload(booking);
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

/* ===== BOOKING DETAILS MODAL ===== */
function BookingDetailsModal({
  booking,
  onClose,
  onReview,
  onDownload,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: any) {
  const tripStatus = booking.tripId?.departureTime 
    ? new Date(booking.tripId.departureTime) > new Date() ? 'upcoming' : 'completed'
    : 'unknown';
  const canReview = tripStatus === 'completed' && booking.status === 'confirmed' && !booking.reviewId;

  // Ngăn click lan ra ngoài
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#020617] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#020617] py-2 border-b border-gray-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-400" />
            Chi tiết đặt vé
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Status */}
        <div className="mb-6">
          {getStatusBadge(booking.status)}
          {booking.reviewId && (
            <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
              <Star className="w-4 h-4 fill-yellow-400" />
              Đã đánh giá
            </span>
          )}
        </div>

        {/* Ticket Code */}
        <div className="bg-[#0f172a] p-4 rounded-xl mb-6 border border-blue-500/30">
          <div className="text-sm text-gray-400 mb-1">Mã vé</div>
          <div className="text-xl font-mono font-bold text-blue-400">
            {booking.ticketCode || 'Đang xử lý'}
          </div>
        </div>

        {/* Trip Info */}
        <div className="bg-[#0f172a] p-4 rounded-xl mb-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-400" />
            Thông tin chuyến đi
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Nhà xe:</span>
              <span className="font-medium">{booking.tripId?.companyId?.name || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Tuyến đường:</span>
              <span className="font-medium text-right">
                {booking.tripId?.route?.fromLocationId?.name} → {booking.tripId?.route?.toLocationId?.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Thời gian khởi hành:</span>
              <span className="font-medium">{formatDate(booking.tripId?.departureTime)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Điểm đón:</span>
              <span className="font-medium text-right">
                {booking.tripId?.route?.fromLocationId?.fullAddress || 
                 booking.tripId?.route?.fromLocationId?.address || 
                 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Điểm trả:</span>
              <span className="font-medium text-right">
                {booking.tripId?.route?.toLocationId?.fullAddress || 
                 booking.tripId?.route?.toLocationId?.address || 
                 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Passenger Info */}
        <div className="bg-[#0f172a] p-4 rounded-xl mb-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Thông tin hành khách
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Người liên hệ:</span>
              <span className="font-medium">{booking.contactName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Số điện thoại:</span>
              <span className="font-medium">{booking.contactPhone}</span>
            </div>

            {booking.contactEmail && (
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium">{booking.contactEmail}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h5 className="text-sm text-gray-400 mb-2">Danh sách hành khách và ghế:</h5>
            <div className="space-y-2">
              {booking.passengers?.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-[#1e293b] p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{p.phone}</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                      Ghế {p.seatNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-[#0f172a] p-4 rounded-xl mb-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Thông tin thanh toán
          </h4>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Tổng tiền:</span>
              <span className="text-lg font-bold text-blue-400">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Trạng thái thanh toán:</span>
              <span className={booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                {booking.paymentStatus === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
              </span>
            </div>

            {booking.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-400">Phương thức:</span>
                <span className="font-medium">
                  {booking.paymentMethod === 'payos' ? 'PayOS' :
                   booking.paymentMethod === 'cash' ? 'Tiền mặt' :
                   booking.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                   booking.paymentMethod}
                </span>
              </div>
            )}

            {booking.paymentGatewayTransactionId && (
              <div className="flex justify-between">
                <span className="text-gray-400">Mã giao dịch:</span>
                <span className="font-mono text-sm">{booking.paymentGatewayTransactionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {canReview && (
            <button
              onClick={() => {
                onClose();
                onReview(booking);
              }}
              className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              Đánh giá chuyến đi
            </button>
          )}

          {booking.ticketCode && (
            <button
              onClick={() => onDownload(booking)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Tải vé
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