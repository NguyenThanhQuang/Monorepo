import { Search, Star, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useReviewManagementLogic } from '../../hooks/Logic/ReviewManagement.logic';

export function ReviewManagement() {
  const { t } = useLanguage();
  const {
    loading,
    filteredReviews,
    searchQuery,
    setSearchQuery,
    filterRating,
    setFilterRating,
    filterStatus,
    setFilterStatus,
    toggleVisibility,
    deleteReview,
  } = useReviewManagementLogic();

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));

  return (
    <div className="p-6">
      <h2>{t('reviewManagementTitle')}</h2>
      <p className="text-gray-500 mb-6">
        {t('reviewManagementDesc')}
      </p>

      {loading && <div>{t('loading')}</div>}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            className="pl-9 input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchReviews')}
          />
        </div>

        <select value={filterRating} onChange={e => setFilterRating(e.target.value)}>
          <option value="all">{t('allRatings')}</option>
          {[5,4,3,2,1].map(n => (
            <option key={n} value={n}>{n} {t('stars')}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">{t('allStatus')}</option>
          <option value="published">{t('publishedLabel')}</option>
          <option value="hidden">{t('hiddenLabel')}</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReviews.map(r => (
          <div key={r.id} className="card">
            <div className="flex justify-between mb-2">
              <div>
                <div>{r.userName}</div>
                <div className="text-sm text-gray-500">
                  {r.companyName} • {r.route}
                </div>
                <div className="flex">{renderStars(r.rating)}</div>
              </div>

              <span className="text-sm">
                {r.status === 'published'
                  ? t('publishedLabel')
                  : t('hiddenLabel')}
              </span>
            </div>

            <p className="mb-3">{r.comment}</p>

            <div className="flex justify-between border-t pt-3 text-sm">
              <span>{r.date}</span>

              <div className="flex gap-2">
                <button onClick={() => toggleVisibility(r)}>
                  {r.status === 'hidden'
                    ? t('showReview')
                    : t('hideReview')}
                </button>
                <button onClick={() => deleteReview(r.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
