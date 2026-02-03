import {
  Search,
  ArrowRightLeft,
  MapPin,
  X,
} from 'lucide-react';
import { HeroLocationSlider } from './HeroLocationSlider';
import { CustomDatePicker } from './CustomDatePicker';
import { useHeroSearchLogic } from '../../../hooks/Logic/useHeroSearchLogic';
import type { HeroSearchProps } from '../../../hooks/Props/layout/HeroSearchProps';

export function HeroSearch(props: HeroSearchProps) {
  const logic = useHeroSearchLogic(props);
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* FROM */}
              <div className="relative md:col-span-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Điểm đi
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

                  <input
                    ref={logic.fromInputRef}
                    value={logic.fromText}
                    placeholder="Chọn điểm đi"
                    onChange={(e) => {
                      logic.setFromText(e.target.value);
                      logic.setFromLocation(null);
                      logic.setShowFromSuggestions(true);
                    }}
                    onFocus={() => {
                      logic.setShowFromSuggestions(true);
                      if (!logic.fromText) {
                        logic.loadAllFromLocations();
                      }
                    }}
                    onBlur={() =>
                      setTimeout(() => logic.setShowFromSuggestions(false), 150)
                    }
                    className="w-full h-[52px] pl-10 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {logic.fromText && (
                    <button
                      onClick={() => {
                        logic.setFromText('');
                        logic.setFromLocation(null);
                        logic.loadAllFromLocations();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {logic.showFromSuggestions && (
                  <div className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-2xl border max-h-64 overflow-y-auto">
                    {logic.fromSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          logic.setFromLocation(loc);
                          logic.setFromText(`${loc.name}, ${loc.province}`);
                          logic.setShowFromSuggestions(false);
                          logic.toInputRef.current?.focus();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b last:border-0"
                      >
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{loc.name}, {loc.province}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP */}
              <div className="md:col-span-1 flex items-end justify-center pb-3">
                <button
                  onClick={logic.handleSwap}
                  className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition hover:rotate-180"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* TO */}
              <div className="relative md:col-span-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Điểm đến
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />

                  <input
                    ref={logic.toInputRef}
                    value={logic.toText}
                    placeholder="Chọn điểm đến"
                    onChange={(e) => {
                      logic.setToText(e.target.value);
                      logic.setToLocation(null);
                      logic.setShowToSuggestions(true);
                    }}
                    onFocus={() => {
                      logic.setShowToSuggestions(true);
                      if (!logic.toText) {
                        logic.loadAllToLocations();
                      }
                    }}
                    onBlur={() =>
                      setTimeout(() => logic.setShowToSuggestions(false), 150)
                    }
                    className="w-full h-[52px] pl-10 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />

                  {logic.toText && (
                    <button
                      onClick={() => {
                        logic.setToText('');
                        logic.setToLocation(null);
                        logic.loadAllToLocations();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {logic.showToSuggestions && (
                  <div className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-2xl border max-h-64 overflow-y-auto">
                    {logic.toSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          logic.setToLocation(loc);
                          logic.setToText(`${loc.name}, ${loc.province}`);
                          logic.setShowToSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 flex items-center gap-3 border-b last:border-0"
                      >
                        <MapPin className="w-4 h-4 text-teal-500" />
                        <span>{loc.name}, {loc.province}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-700 mb-2">
                  Ngày đi
                </label>
                <CustomDatePicker
                  value={logic.date}
                  min={today}
                  onChange={logic.setDate}
                />
              </div>
            </div>

            <button
              onClick={logic.handleSearch}
              className="w-full mt-6 h-[60px] bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition"
            >
              <Search className="w-5 h-5" />
              Tìm kiếm
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
