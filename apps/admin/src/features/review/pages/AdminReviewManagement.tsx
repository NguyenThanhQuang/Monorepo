import { useState, useMemo } from "react";
import {
  Search,
  Star,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@obtp/business-logic";
import { useReviews } from "../hooks/useReviews";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConfirmActionModal } from "@/features/companies/components/ConfirmActionModal";

export function AdminReviewManagement() {
  const { t } = useLanguage();

  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
    isRefetching,
    toggleVisibility,
    deleteReview,
    isMutating,
  } = useReviews();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (r.displayName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q);
      const matchRating =
        filterRating === "all" || r.rating === parseInt(filterRating);
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && r.isVisible) ||
        (filterStatus === "hidden" && !r.isVisible);
      return matchSearch && matchRating && matchStatus;
    });
  }, [reviews, searchQuery, filterRating, filterStatus]);

  const handleDelete = async () => {
    if (selectedReviewId) {
      await deleteReview(selectedReviewId);
      setShowDeleteModal(false);
      setSelectedReviewId(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-center">
        <AlertCircle className="mx-auto mb-2" />
        Lỗi tải dữ liệu.{" "}
        <button onClick={() => refetch()} className="underline">
          Thử lại
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý đánh giá
          </h1>
          <p className="text-gray-500">
            Giám sát và kiểm duyệt feedback từ khách hàng
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2 border rounded-xl hover:bg-gray-100"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm nội dung, tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-2 bg-gray-50 rounded-xl border dark:bg-gray-900"
            />
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="p-2 border rounded-xl bg-gray-50"
          >
            <option value="all">Mọi đánh giá</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="1">1-2 Sao</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-xl bg-gray-50"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đang hiện</option>
            <option value="hidden">Bị ẩn</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 border rounded-2xl divide-y">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              className="p-6 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                  {review.displayName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold dark:text-white">
                      {review.displayName}
                    </h4>
                    <span className="text-sm text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1">{renderStars(review.rating)}</div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {review.comment || "Không có nội dung nhận xét."}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    toggleVisibility({
                      id: review._id,
                      isVisible: !review.isVisible,
                    })
                  }
                  disabled={isMutating}
                  className={`p-2 rounded-xl border ${review.isVisible ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"}`}
                  title={review.isVisible ? "Ẩn review" : "Hiện review"}
                >
                  {review.isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedReviewId(review._id);
                    setShowDeleteModal(true);
                  }}
                  disabled={isMutating}
                  className="p-2 rounded-xl border text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xóa đánh giá"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không?"
        type="danger"
        loading={isMutating}
      />
    </div>
  );
}
