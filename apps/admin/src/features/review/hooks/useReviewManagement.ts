import { useState, useMemo } from "react";
import { useReviews } from "./useReviews";

export function useReviewManagement() {
  const {
    data: reviews =[],
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteReview,
    toggleVisibility,
    isMutating,
  } = useReviews();

  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState("");
  const[filterRating, setFilterRating] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // --- Modal States ---
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const[toggleModal, setToggleModal] = useState<{ isOpen: boolean; id: string; currentStatus: boolean } | null>(null);

  // --- Logic Lọc Dữ Liệu ---
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase();
      const contentMatch =
        (r.displayName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q) ||
        ((r as any).companyId?.name || "").toLowerCase().includes(q);

      const ratingMatch = filterRating === "all" || r.rating === parseInt(filterRating);

      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "visible" && r.isVisible) ||
        (filterStatus === "hidden" && !r.isVisible);

      return contentMatch && ratingMatch && statusMatch;
    });
  }, [reviews, searchQuery, filterRating, filterStatus]);

  // --- Handlers ---
  const handleDeleteConfirm = async () => {
    if (deleteModal.id) {
      await deleteReview(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleToggleConfirm = async () => {
    if (toggleModal) {
      await toggleVisibility({
        id: toggleModal.id,
        isVisible: !toggleModal.currentStatus,
      });
      setToggleModal(null);
    }
  };

  return {
    // Data & Fetching
    filteredReviews,
    isLoading,
    error,
    refetch,
    isRefetching,
    isMutating,

    // Filters
    searchQuery,
    setSearchQuery,
    filterRating,
    setFilterRating,
    filterStatus,
    setFilterStatus,

    // Modals
    deleteModal,
    setDeleteModal,
    toggleModal,
    setToggleModal,
    handleDeleteConfirm,
    handleToggleConfirm,
  };
}