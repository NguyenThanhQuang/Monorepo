import { Star, X, User, Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Booking } from '@obtp/shared-types';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá', {
        duration: 3000,
        position: 'top-center',
        icon: '⭐',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        bookingId: booking._id,
        tripId: booking.tripId._id,
        rating,
        comment: comment.trim() || undefined,
        isAnonymous,
      };

      await getMyReviewsApi.create(payload);

      toast.success('Đánh giá thành công! Cảm ơn bạn đã chia sẻ trải nghiệm.', {
        duration: 4000,
        position: 'top-center',
        icon: '🎉',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Xử lý lỗi cụ thể
      if (error.response?.status === 409) {
        toast.error('Bạn đã đánh giá chuyến đi này rồi', {
          duration: 3000,
          position: 'top-center',
          icon: '⚠️',
        });
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Chuyến đi chưa hoàn thành, chưa thể đánh giá', {
          duration: 3000,
          position: 'top-center',
          icon: '❌',
        });
      } else {
        toast.error('Không thể gửi đánh giá. Vui lòng thử lại sau.', {
          duration: 3000,
          position: 'top-center',
          icon: '❌',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (value: number) => {
    switch (value) {
      case 1: return 'Rất tệ';
      case 2: return 'Tệ';
      case 3: return 'Bình thường';
      case 4: return 'Tốt';
      case 5: return 'Tuyệt vời';
      default: return '';
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            Đánh giá chuyến đi
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trip Info */}
        <div className="bg-[#0f172a] p-4 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="font-medium">{booking.contactName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Phone className="w-4 h-4" />
            <span>{booking.contactPhone}</span>
          </div>
          <div className="border-t border-gray-800 my-3 pt-3">
            <div className="text-sm font-medium mb-1">
              {booking.tripId?.route?.fromLocationId?.name} → {booking.tripId?.route?.toLocationId?.name}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(booking.tripId?.departureTime).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Chất lượng chuyến đi <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center">
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {getRatingText(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chia sẻ trải nghiệm của bạn
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhận xét về chất lượng xe, thái độ nhân viên, đúng giờ..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0f172a] border-2 border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-600 resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {comment.length}/2000
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-[#0f172a] text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">
                Đánh giá ẩn danh (tên của bạn sẽ được hiển thị là {booking.contactName.charAt(0)}***)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#334155] hover:bg-[#475569] rounded-xl font-medium transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>Gửi đánh giá</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}