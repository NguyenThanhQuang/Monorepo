import { Eye, EyeOff, Trash2, Building2, MapPin, Calendar, Star } from "lucide-react";
import { formatDate } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  review: any;
  isMutating: boolean;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function ReviewCard({ review, isMutating, onToggle, onDelete }: Props) {
  const { t } = useLanguage();

  const exactId = review.id || review._id;
  const companyInfo = review.companyId;
  const companyName = companyInfo?.name || t("unknownCompany") || "Nhà xe không xác định";

  const tripInfo = review.tripId;
  const routeFrom = tripInfo?.route?.fromLocationId?.name;
  const routeTo = tripInfo?.route?.toLocationId?.name;
  const routeString = routeFrom && routeTo ? `${routeFrom} ➝ ${routeTo}` : null;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`group relative rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
        review.isVisible
          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md"
          : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-90"
      }`}
    >
      {/* 1. Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border shrink-0 ${
              review.isVisible
                ? "bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-600 dark:text-purple-300 border-white dark:border-gray-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 grayscale border-gray-300 dark:border-gray-600"
            }`}
          >
            {review.displayName?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`font-bold text-base md:text-lg truncate ${review.isVisible ? "text-gray-900 dark:text-white" : "text-gray-500 line-through decoration-gray-400"}`}>
                {review.displayName}
              </h4>
              {!review.isVisible && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
                  {t("hidden") || "Đã ẩn"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
              <span>{formatDate(review.createdAt)}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
              <div className="flex items-center">{renderStars(review.rating)}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(exactId, review.isVisible)}
            disabled={isMutating}
            title={review.isVisible ? t("hide") : t("show")}
            className={`p-2 rounded-lg border transition-colors ${
              review.isVisible
                ? "border-gray-200 dark:border-gray-700 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                : "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400"
            }`}
          >
            {review.isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => onDelete(exactId)}
            disabled={isMutating}
            title={t("delete")}
            className="p-2 rounded-lg border border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 2. Metadata */}
      <div className="flex flex-wrap gap-y-2 gap-x-4 p-3 mb-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Building2 size={16} className="text-purple-500 dark:text-purple-400" />
          <span className="font-medium">{companyName}</span>
        </div>
        {routeString && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin size={16} className="text-blue-500 dark:text-blue-400" />
            <span>{routeString}</span>
          </div>
        )}
        {tripInfo?.departureTime && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} className="text-orange-500 dark:text-orange-400" />
            <span>{formatDate(tripInfo.departureTime)}</span>
          </div>
        )}
      </div>

      {/* 3. Comment */}
      <div className="relative pl-3">
        <div className={`absolute left-0 top-1 bottom-1 w-1 rounded-full ${review.isVisible ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-600"}`}></div>
        <p className={`text-sm md:text-base italic leading-relaxed ${!review.isVisible ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
          "{review.comment || t("noComment") || "Khách hàng không để lại bình luận."}"
        </p>
      </div>
    </div>
  );
}