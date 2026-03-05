import { useLanguage } from "@/contexts/LanguageContext";
import { Search, ArrowRightLeft, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { useHeroSearchLogic } from "../hooks/useHeroSearchLogic";
import { HeroLocationSlider } from "./HeroLocationSlider";

export function HeroSearch() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const today = new Date().toISOString().split("T")[0];

  const logic = useHeroSearchLogic({
    onSearch: (params) => {
      navigate("/search", { state: params });
    },
  });

  return (
    <section className="relative bg-linear-to-br from-blue-600 via-blue-500 to-teal-500 dark:from-blue-900 dark:via-blue-800 dark:to-teal-800 py-24 transition-colors duration-300 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl text-white mb-4">{t("heroTitle")}</h1>
          <p className="text-xl text-blue-100">{t("heroSubtitle")}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* FROM */}
              <div className="relative md:col-span-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {t("departure")}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    ref={logic.fromInputRef}
                    value={logic.fromText}
                    placeholder={t("selectDeparture")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      logic.setFromText(e.target.value);
                      logic.setFromLocation(null);
                      logic.setShowFromSuggestions(true);
                    }}
                    onFocus={() => {
                      logic.setShowFromSuggestions(true);
                      if (!logic.fromText) logic.loadAllFromLocations();
                    }}
                    onBlur={() =>
                      setTimeout(() => logic.setShowFromSuggestions(false), 150)
                    }
                    className="w-full h-[52px] pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                  {logic.fromText && (
                    <button
                      onClick={() => {
                        logic.setFromText("");
                        logic.setFromLocation(null);
                        logic.loadAllFromLocations();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {logic.showFromSuggestions && (
                  <div className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                    {logic.fromSuggestions.map((loc: any) => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          logic.setFromLocation(loc);
                          logic.setFromText(`${loc.name}, ${loc.province}`);
                          logic.setShowFromSuggestions(false);
                          logic.toInputRef.current?.focus();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="flex-1 text-base">
                          {loc.name}, {loc.province}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP */}
              <div className="md:col-span-1 flex items-end justify-center pb-0 md:pb-3">
                <button
                  onClick={logic.handleSwap}
                  className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 transition-all"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* TO */}
              <div className="relative md:col-span-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {t("destination")}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
                  <input
                    ref={logic.toInputRef}
                    value={logic.toText}
                    placeholder={t("selectDestination")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      logic.setToText(e.target.value);
                      logic.setToLocation(null);
                      logic.setShowToSuggestions(true);
                    }}
                    onFocus={() => {
                      logic.setShowToSuggestions(true);
                      if (!logic.toText) logic.loadAllToLocations();
                    }}
                    onBlur={() =>
                      setTimeout(() => logic.setShowToSuggestions(false), 150)
                    }
                    className="w-full h-[52px] pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
                  />
                  {logic.toText && (
                    <button
                      onClick={() => {
                        logic.setToText("");
                        logic.setToLocation(null);
                        logic.loadAllToLocations();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {logic.showToSuggestions && (
                  <div className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                    {logic.toSuggestions.map((loc: any) => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          logic.setToLocation(loc);
                          logic.setToText(`${loc.name}, ${loc.province}`);
                          logic.setShowToSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                        <span className="flex-1 text-base">
                          {loc.name}, {loc.province}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="md:col-span-3">
                <CustomDatePicker
                  label={t("date")}
                  value={logic.date || ""}
                  onChange={(newDate: string) => logic.setDate(newDate)}
                  min={today}
                />
              </div>
            </div>

            {/* SEARCH BUTTON */}
            <button
              onClick={logic.handleSearch}
              className="w-full mt-6 h-[60px] bg-linear-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <Search className="w-5 h-5" />
              <span>{t("search")}</span>
            </button>
          </div>
        </div>

        <div className="mt-12">
          <HeroLocationSlider />
        </div>
      </div>
    </section>
  );
}
