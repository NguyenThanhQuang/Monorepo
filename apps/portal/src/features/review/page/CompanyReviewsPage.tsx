// src/features/reviews/pages/CompanyReviewsPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../admin/src/contexts/AuthContext';
import { reviewsApi } from '@obtp/api-client';
import {
  Star,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../dashboard/utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { ReviewDTO } from '@obtp/shared-types';

export function CompanyReviewsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
    visible: 0,
    hidden: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getAllAdmin({ companyId: user?.companyId });
      setReviews(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ReviewDTO[]) => {
    const total = data.length;
    const visible = data.filter(r => r.isVisible).length;
    const hidden = data.filter(r => !r.isVisible).length;
    
    const fiveStar = data.filter(r => r.rating === 5).length;
    const fourStar = data.filter(r => r.rating === 4).length;
    const threeStar = data.filter(r => r.rating === 3).length;
    const twoStar = data.filter(r => r.rating === 2).length;
    const oneStar = data.filter(r => r.rating === 1).length;
    
    const totalRating = data.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = total > 0 ? totalRating / total : 0;

    setStats({
      total,
      averageRating,
      fiveStar,
      fourStar,
      threeStar,
      twoStar,
      oneStar,
      visible,
      hidden,
    });
  };

  const handleToggleVisibility = async (review: ReviewDTO) => {
    try {
      setActionLoading(true);
      await reviewsApi.toggleVisibility(review._id, !review.isVisible);
      await fetchReviews();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    
    try {
      setActionLoading(true);
      await reviewsApi.delete(selectedReview._id);
      await fetchReviews();
      setShowDeleteModal(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    // Search filter
    const matchesSearch = 
      review.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.routeName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Rating filter
    const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'visible' && review.isVisible) ||
      (statusFilter === 'hidden' && !review.isVisible);
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingPercent = (count: number) => {
    return stats.total > 0 ? (count / stats.total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('reviewManagement')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('reviewManagementDesc')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalReviews')}</p>
          <div className="mt-2 flex items-center gap-2">
            {renderStars(Math.round(stats.averageRating))}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              ({stats.averageRating.toFixed(1)})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.visible}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('published')}</p>
          <p className="text-xs text-gray-400 mt-2">
            {((stats.visible / stats.total) * 100 || 0).toFixed(1)}% {t('ofTotal')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.hidden}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('hidden')}</p>
          <p className="text-xs text-gray-400 mt-2">
            {((stats.hidden / stats.total) * 100 || 0).toFixed(1)}% {t('ofTotal')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.fiveStar}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('fiveStarReviews')}</p>
          <p className="text-xs text-gray-400 mt-2">
            {((stats.fiveStar / stats.total) * 100 || 0).toFixed(1)}% {t('satisfaction')}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('ratingDistribution')}
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = 
              star === 5 ? stats.fiveStar :
              star === 4 ? stats.fourStar :
              star === 3 ? stats.threeStar :
              star === 2 ? stats.twoStar : stats.oneStar;
            const percent = getRatingPercent(count);
            
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {star} {t('star')}
                  </span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count} ({percent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchReviews')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allRatings')}</option>
              <option value="5">5 {t('stars')}</option>
              <option value="4">4 {t('stars')}</option>
              <option value="3">3 {t('stars')}</option>
              <option value="2">2 {t('stars')}</option>
              <option value="1">1 {t('star')}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="visible">{t('published')}</option>
              <option value="hidden">{t('hidden')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reviewer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('route')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('rating')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('comment')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium">
                            {review.displayName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {review.displayName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {review.routeName || 'N/A'}
                        </p>
                        {review.tripDate && (
                          <p className="text-xs text-gray-500">
                            {formatDate(review.tripDate)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {review.comment || 'No comment'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(review.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          review.isVisible
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {review.isVisible ? t('published') : t('hidden')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleVisibility(review)}
                            disabled={actionLoading}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={review.isVisible ? t('hideReview') : t('showReview')}
                          >
                            {review.isVisible ? (
                              <EyeOff className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDeleteModal(true);
                            }}
                            disabled={actionLoading}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={t('deleteReview')}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {t('showing')} {(currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredReviews.length)} {t('of')}{' '}
                  {filteredReviews.length} {t('reviews')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {t('confirmDelete')}
            </h3>
            
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              {t('deleteReviewConfirm')}
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium">
                  {selectedReview.displayName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedReview.displayName}
                  </p>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedReview.comment}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}