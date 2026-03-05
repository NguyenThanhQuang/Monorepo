import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterRating: string;
  setFilterRating: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
}

export function ReviewFilters({
  searchQuery,
  setSearchQuery,
  filterRating,
  setFilterRating,
  filterStatus,
  setFilterStatus,
}: ReviewFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[280px] relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 w-5 h-5 transition-colors" />
          <input
            type="text"
            placeholder={t("searchReviews") || "Tìm theo nội dung, nhà xe, khách..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // FIX MÀU CHỮ TẠI ĐÂY
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 
              bg-gray-50 dark:bg-gray-900 
              text-gray-900 dark:text-white 
              placeholder:text-gray-500 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-500/40 focus:border-purple-500 dark:focus:border-purple-500 
              transition-all font-medium"
          />
        </div>

        {/* Rating Filter */}
        <div className="min-w-[160px]">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600
              bg-gray-50 dark:bg-gray-900 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-500/40 focus:border-purple-500 
              transition-all font-medium cursor-pointer"
          >
            <option value="all">{t("allRating") || "Tất cả sao"}</option>
            <option value="5">5 {t("stars") || "sao"}</option>
            <option value="4">4 {t("stars") || "sao"}</option>
            <option value="3">3 {t("stars") || "sao"}</option>
            <option value="1">1-2 {t("stars") || "sao"}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[160px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600
              bg-gray-50 dark:bg-gray-900 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-500/40 focus:border-purple-500 
              transition-all font-medium cursor-pointer"
          >
            <option value="all">{t("allStatus") || "Tất cả trạng thái"}</option>
            <option value="visible">{t("visible") || "Đang hiện"}</option>
            <option value="hidden">{t("hidden") || "Đã ẩn"}</option>
          </select>
        </div>
      </div>
    </div>
  );
}