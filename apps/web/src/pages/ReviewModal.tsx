import {
  Star,
  X,
  Send,
  User,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Booking } from '@obtp/shared-types';
import { isPopulated } from '@obtp/shared-types';
import { getMyReviewsApi } from '../api/service/review/review.api';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper function để lấy thông tin trip an toàn
  const getTripInfo = () => {
    const trip = booking.tripId;
    
    if (!trip) {
      return {
        fromName: 'N/A',
        toName: 'N/A',
        departureTime: '',
      };
    }

    // Kiểm tra nếu trip đã được populate
    if (isPopulated(trip) && trip.route) {
      const fromLocation = trip.route.fromLocationId;
      const toLocation = trip.route.toLocationId;
      
      return {
        fromName: isPopulated(fromLocation) ? fromLocation.name : 'N/A',
        toName: isPopulated(toLocation) ? toLocation.name : 'N/A',
        departureTime: trip.departureTime || '',
      };
    }

    return {
      fromName: 'N/A',
      toName: 'N/A',
      departureTime: '',
    };
  };

  const { fromName, toName, departureTime } = getTripInfo();
  const tripName = fromName && toName ? `${fromName} → ${toName}` : 'Chuyến đi';

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá', {
        duration: 3000,
        position: 'top-center',
        icon: '⭐',
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        bookingId: booking._id || booking.id,
        tripId: typeof booking.tripId === 'string' ? booking.tripId : booking.tripId?._id || '',
        rating,
        comment: comment.trim() || undefined,
        isAnonymous,
      };

      await getMyReviewsApi.create(payload);

      toast.success('Đánh giá thành công! Cảm ơn bạn đã chia sẻ trải nghiệm.', {
        duration: 3000,
        position: 'top-center',
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
      });

      onSuccess();
    } catch (error: any) {
      console.error('Review error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi gửi đánh giá';
      if (error?.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      }

      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #FCA5A5',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#020617] rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Đánh giá chuyến đi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trip Info */}
        <div className="bg-[#0f172a] p-4 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-medium">{tripName}</div>
              {departureTime && (
                <div className="text-sm text-gray-400">
                  {new Date(departureTime).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Chất lượng chuyến đi <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-all ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400 scale-110'
                      : 'text-gray-500'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-400">
            {rating === 1 && 'Rất tệ'}
            {rating === 2 && 'Tệ'}
            {rating === 3 && 'Bình thường'}
            {rating === 4 && 'Tốt'}
            {rating === 5 && 'Tuyệt vời'}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Nhận xét (không bắt buộc)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi..."
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {comment.length}/500
          </div>
        </div>

        {/* Anonymous Option */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-[#0f172a] text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">
              Đánh giá ẩn danh (tên của bạn sẽ không được hiển thị)
            </span>
          </label>
        </div>

        {/* Note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6">
          <div className="flex gap-2 text-sm text-yellow-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>
              Đánh giá của bạn sẽ giúp chúng tôi cải thiện chất lượng dịch vụ
              và hỗ trợ những hành khách khác có trải nghiệm tốt hơn.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-[#334155] hover:bg-[#475569] rounded-xl font-medium disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}