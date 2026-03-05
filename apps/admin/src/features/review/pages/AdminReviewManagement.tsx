import { useState, useMemo, useEffect } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";
import { useReviewManagement } from "../hooks/useReviewManagement";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewFilters } from "../components/ReviewFilterBar";

export function AdminReviewManagement() {
  const { t } = useLanguage();
  const {
    filteredReviews,
    isLoading,
    error,
    refetch,
    isRefetching,
    isMutating,
    searchQuery,
    setSearchQuery,
    filterRating,
    setFilterRating,
    filterStatus,
    setFilterStatus,
    deleteModal,
    setDeleteModal,
    toggleModal,
    setToggleModal,
    handleDeleteConfirm,
    handleToggleConfirm,
  } = useReviewManagement();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRating, filterStatus]);

  // Logic phân trang
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-center border border-red-100 dark:border-red-900/30 mt-8">
        <AlertCircle className="mx-auto mb-3 w-10 h-10 opacity-80" />
        <h3 className="text-lg font-bold mb-1">
          {t("errorFetchingReviews") || "Không thể tải dữ liệu"}
        </h3>
        <p className="text-sm opacity-80 mb-4">
          Vui lòng kiểm tra lại kết nối.
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors shadow-sm"
        >
          {t("retry") || "Thử lại"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("reviewManagement") || "Quản lý đánh giá"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {t("reviewManagementDesc") || "Kiểm duyệt phản hồi từ khách hàng"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-gray-600 dark:text-gray-300"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* FILTER BAR */}
      <ReviewFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterRating={filterRating}
        setFilterRating={setFilterRating}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* LIST REVIEWS */}
      <div className="flex flex-col gap-4">
        {filteredReviews.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 font-medium text-lg">
              Không tìm thấy đánh giá nào
            </p>
          </div>
        ) : (
          <>
            {paginatedReviews.map((review) => (
              <ReviewCard
                key={ (review as any)._id}
                review={review}
                isMutating={isMutating}
                onToggle={(id, status) =>
                  setToggleModal({ isOpen: true, id, currentStatus: status })
                }
                onDelete={(id) => setDeleteModal({ isOpen: true, id })}
              />
            ))}

            {/* Pagination Controls */}
            {filteredReviews.length > itemsPerPage && (
              <div className="px-2 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      <ConfirmActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title={t("deleteReviewTitle") || "Xóa đánh giá"}
        message={
          t("confirmDeleteReview") ||
          "Bạn có chắc muốn xóa vĩnh viễn đánh giá này?"
        }
        type="danger"
        loading={isMutating}
        confirmText={t("delete") || "Xóa"}
        cancelText={t("cancel") || "Hủy"}
      />

      <ConfirmActionModal
        isOpen={toggleModal?.isOpen || false}
        onClose={() => setToggleModal(null)}
        onConfirm={handleToggleConfirm}
        title={toggleModal?.currentStatus ? "Ẩn đánh giá" : "Hiện đánh giá"}
        message={
          toggleModal?.currentStatus
            ? "Đánh giá này sẽ bị ẩn khỏi trang chủ. Bạn có chắc không?"
            : "Đánh giá này sẽ được hiển thị công khai trở lại. Bạn có chắc không?"
        }
        type={toggleModal?.currentStatus ? "warning" : "success"}
        loading={isMutating}
        confirmText={toggleModal?.currentStatus ? "Ẩn đi" : "Hiển thị"}
        cancelText={t("cancel") || "Hủy"}
      />
    </div>
  );
}