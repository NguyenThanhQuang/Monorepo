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
import { useLanguage } from '../../../contexts/LanguageContext';
import { Toaster } from 'react-hot-toast'; // Thêm import này

export function HeroSearch(props: HeroSearchProps) {
  const logic = useHeroSearchLogic(props);
  const { t } = useLanguage();
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 dark:from-blue-900 dark:via-blue-800 dark:to-teal-800 py-24 transition-colors duration-300 overflow-hidden">
      {/* Add Toaster component for notifications */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            duration: 2000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          },
        }}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-float" style={{ top: '20%', left: '10%' }}></div>
          <div className="absolute w-3 h-3 bg-white/20 rounded-full animate-float delay-500" style={{ top: '60%', left: '80%' }}></div>
          <div className="absolute w-2 h-2 bg-white/25 rounded-full animate-float delay-1000" style={{ top: '40%', left: '60%' }}></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl text-white mb-4 drop-shadow-lg">
            {t('heroTitle')}
          </h1>
          <p className="text-xl text-blue-100 drop-shadow">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Search Card with glassmorphism */}
        <div className="max-w-5xl mx-auto animate-bounce-in">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-blue-500/20 transition-all duration-300 animate-pulse-glow">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* FROM */}
              <div className="relative md:col-span-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {t('departure')}
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />

                  <input
                    ref={logic.fromInputRef}
                    value={logic.fromText}
                    placeholder={t('selectDeparture')}
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
                    className="w-full h-[52px] pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  />

                  {logic.fromText && (
                    <button
                      onClick={() => {
                        logic.setFromText('');
                        logic.setFromLocation(null);
                        logic.loadAllFromLocations();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {logic.showFromSuggestions && (
                  <div className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto animate-scale-in">
                    {logic.fromSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          logic.setFromLocation(loc);
                          logic.setFromText(`${loc.name}, ${loc.province}`);
                          logic.setShowFromSuggestions(false);
                          logic.toInputRef.current?.focus();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="flex-1 text-base">{loc.name}, {loc.province}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP */}
              <div className="md:col-span-1 flex items-end justify-center pb-0 md:pb-3">
                <button
                  onClick={logic.handleSwap}
                  className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all hover:rotate-180 duration-300"
                  aria-label="Swap locations"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* TO */}
              <div className="relative md:col-span-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {t('destination')}
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />

                  <input
                    ref={logic.toInputRef}
                    value={logic.toText}
                    placeholder={t('selectDestination')}
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
                    className="w-full h-[52px] pl-10 pr-10 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  />

                  {logic.toText && (
                    <button
                      onClick={() => {
                        logic.setToText('');
                        logic.setToLocation(null);
                        logic.loadAllToLocations();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {logic.showToSuggestions && (
                  <div className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto animate-scale-in">
                    {logic.toSuggestions.map((loc) => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          logic.setToLocation(loc);
                          logic.setToText(`${loc.name}, ${loc.province}`);
                          logic.setShowToSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        <span className="flex-1 text-base">{loc.name}, {loc.province}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="md:col-span-3">
                <CustomDatePicker 
                  label={t('date')}
                  value={logic.date || ''}
                  onChange={(newDate) => logic.setDate(newDate)}
                  min={today}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={logic.handleSearch}
              className="w-full mt-6 h-[60px] bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{t('search')}</span>
            </button>
          </div>
        </div>

        {/* Location Slider */}
        <div className="mt-12">
          <HeroLocationSlider />
        </div>
      </div>
    </section>
  );
}