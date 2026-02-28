// src/features/admin/reviews/pages/AdminReviewManagement.tsx
import { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff,
  Filter,
  X,
  RefreshCw,
  Building2,
  Calendar,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { reviewsApi } from '@obtp/api-client';
import { companiesApi } from '@obtp/api-client';
import toast from 'react-hot-toast';
import type { ReviewDTO, ReviewQuery } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ConfirmActionModal } from '../../companies/components/ConfirmActionModal';

interface Company {
  id: string;
  name: string;
  code: string;
}

export function AdminReviewManagement() {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewDTO | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    published: 0,
    hidden: 0,
    flagged: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filterCompany, filterRating, filterStatus]);

  const fetchCompanies = async () => {
    try {
      const data = await companiesApi.getAllWithStats();
      setCompanies(data.map(c => ({ id: c.id, name: c.name, code: c.code })));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: ReviewQuery = {};
      
      if (filterCompany !== 'all') {
        params.companyId = filterCompany;
      }
      if (filterRating !== 'all') {
        params.rating = parseInt(filterRating);
      }
      
      const data = await reviewsApi.getAllAdmin(params);
      setReviews(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(t('errorFetchingReviews'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: ReviewDTO[]) => {
    const total = data.length;
    const published = data.filter(r => r.isVisible).length;
    const hidden = data.filter(r => !r.isVisible).length;
    
    // Tính flagged reviews (có thể dựa vào comment chứa từ khóa hoặc report count nếu có)
    const flagged = data.filter(r => r.comment?.toLowerCase().includes('bad') || 
                                      r.comment?.toLowerCase().includes('tệ')).length;
    
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
      published,
      hidden,
      flagged,
      fiveStar,
      fourStar,
      threeStar,
      twoStar,
      oneStar,
    });
  };

  const handleToggleVisibility = async (review: ReviewDTO) => {
    try {
      setActionLoading(review._id);
      await reviewsApi.toggleVisibility(review._id, !review.isVisible);
      
      // Update local state
      setReviews(prev => prev.map(r => 
        r._id === review._id ? { ...r, isVisible: !r.isVisible } : r
      ));
      
      // Recalculate stats
      calculateStats(reviews.map(r => 
        r._id === review._id ? { ...r, isVisible: !r.isVisible } : r
      ));
      
      toast.success(
        !review.isVisible ? t('showReviewSuccess') : t('hideReviewSuccess')
      );
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error(t('errorTogglingVisibility'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    
    try {
      setActionLoading(selectedReview._id);
      await reviewsApi.delete(selectedReview._id);
      
      // Remove from local state
      const updatedReviews = reviews.filter(r => r._id !== selectedReview._id);
      setReviews(updatedReviews);
      calculateStats(updatedReviews);
      
      setShowDeleteModal(false);
      setSelectedReview(null);
      toast.success(t('deleteReviewSuccess'));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(t('errorDeletingReview'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      review.displayName?.toLowerCase().includes(searchLower) ||
      review.comment?.toLowerCase().includes(searchLower) ||
      review.routeName?.toLowerCase().includes(searchLower) ||
      review.companyName?.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && review.isVisible) ||
      (filterStatus === 'hidden' && !review.isVisible) ||
      (filterStatus === 'flagged' && review.comment?.toLowerCase().includes('bad'));
    
    return matchesSearch && matchesStatus;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingPercent = (count: number) => {
    return stats.total > 0 ? (count / stats.total) * 100 : 0;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('reviewManagementTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('reviewManagementDesc')}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t('refresh')}
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalReviews')}</p>
          <div className="mt-2 flex items-center gap-1">
            {renderStars(Math.round(stats.averageRating))}
            <span className="text-xs text-gray-600 dark:text-gray-300">
              ({stats.averageRating.toFixed(1)})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {stats.published}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('published')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
              {stats.hidden}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('hidden')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">
              {stats.flagged}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('flagged')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
            </div>
            <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.fiveStar}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">5 {t('stars')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {companies.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('companies')}</p>
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
                    {star}
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchReviews')}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{t('filters')}</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('company')}:</span>
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">{t('allCompanies')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('rating')}:</span>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">{t('allRatings')}</option>
                  <option value="5">5 {t('stars')}</option>
                  <option value="4">4 {t('stars')}</option>
                  <option value="3">3 {t('stars')}</option>
                  <option value="2">2 {t('stars')}</option>
                  <option value="1">1 {t('star')}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('status')}:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">{t('allStatus')}</option>
                  <option value="published">{t('published')}</option>
                  <option value="hidden">{t('hidden')}</option>
                  <option value="flagged">{t('flagged')}</option>
                </select>
              </div>

              {(searchQuery || filterCompany !== 'all' || filterRating !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCompany('all');
                    setFilterRating('all');
                    setFilterStatus('all');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">{t('clearFilters')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedReviews.length > 0 ? (
            paginatedReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {review.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {review.displayName}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {review.companyName || 'N/A'}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {review.routeName || 'N/A'}
                        </span>
                      </div>

                      <div className="mb-3">
                        {renderStars(review.rating)}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {review.comment || t('noComment')}
                      </p>

                      {review.tripDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{t('tripDate')}: {formatDate(review.tripDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.isVisible
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {review.isVisible ? t('published') : t('hidden')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleToggleVisibility(review)}
                    disabled={actionLoading === review._id}
                    className={`p-2 rounded-lg transition-colors ${
                      review.isVisible
                        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={review.isVisible ? t('hideReview') : t('showReview')}
                  >
                    {actionLoading === review._id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : review.isVisible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setShowDeleteModal(true);
                    }}
                    disabled={actionLoading === review._id}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('deleteReview')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {t('noReviewsFound')}
              </p>
              {(searchQuery || filterCompany !== 'all' || filterRating !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCompany('all');
                    setFilterRating('all');
                    setFilterStatus('all');
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReview(null);
        }}
        onConfirm={handleDelete}
        title={t('confirmDelete')}
        message={t('deleteReviewConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        type="danger"
        loading={actionLoading === selectedReview?._id}
      />
    </div>
  );
}