import { useEffect, useMemo, useState } from 'react';
import type { ReviewDTO, ReviewUI } from '../../features/Review/types';
import { reviewApi } from '../../api/service/review/review.api';



export function useReviewManagementLogic() {
  const [reviews, setReviews] = useState<ReviewUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const mapDtoToUI = (dto: ReviewDTO): ReviewUI => ({
    id: dto._id,
    userName: dto.displayName,
    companyName: dto.companyName || '—',
    route: dto.routeName || '—',
    rating: dto.rating,
    comment: dto.comment,
    date: new Date(dto.createdAt).toLocaleDateString('vi-VN'),
    tripDate: dto.tripDate,
    status: dto.isVisible ? 'published' : 'hidden',
    likes: dto.likeCount || 0
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllForAdmin();
      setReviews(res.data.map(mapDtoToUI));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVisibility = async (review: ReviewUI) => {
    await reviewApi.toggleVisibility(
      review.id,
      review.status === 'hidden'
    );
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    await reviewApi.remove(id);
    fetchReviews();
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch =
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.route.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        filterRating === 'all' || r.rating === Number(filterRating);

      const matchesStatus =
        filterStatus === 'all' || r.status === filterStatus;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchQuery, filterRating, filterStatus]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    );
  }, [reviews]);

  return {
    loading,
    reviews,
    filteredReviews,
    avgRating,

    searchQuery,
    setSearchQuery,
    filterRating,
    setFilterRating,
    filterStatus,
    setFilterStatus,

    toggleVisibility,
    deleteReview,
  };
}
