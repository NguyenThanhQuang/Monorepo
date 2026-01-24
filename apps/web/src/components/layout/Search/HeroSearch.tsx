import { Search, MapPin, ArrowRightLeft, X } from 'lucide-react';
import { HeroLocationSlider } from './HeroLocationSlider';
import { CustomDatePicker } from './CustomDatePicker';
import { useHeroSearchLogic } from '../../../hooks/Logic/useHeroSearchLogic';

interface HeroSearchProps {
  onSearch?: (from: string, to: string, date: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

export function HeroSearch(props: HeroSearchProps) {
  const {
    t,
    from,
    to,
    date,
    setFrom,
    setTo,
    setDate,
    filteredFromLocations,
    filteredToLocations,
    showFromSuggestions,
    showToSuggestions,
    setShowFromSuggestions,
    setShowToSuggestions,
    fromInputRef,
    toInputRef,
    handleSearch,
    handleSwap,
  } = useHeroSearchLogic(props);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 py-24">
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl text-white mb-4">{t('heroTitle')}</h1>
          <p className="text-xl text-blue-100">{t('heroSubtitle')}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* FROM */}
              <div className="relative md:col-span-4">
                <label className="text-sm mb-2 block">{t('departure')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  <input
                    ref={fromInputRef}
                    value={from}
                    onChange={e => {
                      setFrom(e.target.value);
                      setShowFromSuggestions(true);
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowFromSuggestions(false), 200)
                    }
                    className="w-full pl-10 pr-10 py-3 border rounded-xl"
                    placeholder={t('selectDeparture')}
                  />
                  {from && (
                    <button
                      onClick={() => setFrom('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showFromSuggestions && filteredFromLocations.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl">
                    {filteredFromLocations.map(loc => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          setFrom(loc.name);
                          setShowFromSuggestions(false);
                          toInputRef.current?.focus();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{loc.name}</span>
                        <span className="text-sm text-gray-400">
                          ({loc.province})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP */}
              <div className="md:col-span-1 flex items-end justify-center">
                <button
                  onClick={handleSwap}
                  className="p-3 bg-blue-100 rounded-xl"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
              </div>

              {/* TO */}
              <div className="relative md:col-span-4">
                <label className="text-sm mb-2 block">{t('destination')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
                  <input
                    ref={toInputRef}
                    value={to}
                    onChange={e => {
                      setTo(e.target.value);
                      setShowToSuggestions(true);
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowToSuggestions(false), 200)
                    }
                    className="w-full pl-10 pr-10 py-3 border rounded-xl"
                    placeholder={t('selectDestination')}
                  />
                  {to && (
                    <button
                      onClick={() => setTo('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showToSuggestions && filteredToLocations.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl">
                    {filteredToLocations.map(loc => (
                      <button
                        key={loc.id}
                        onMouseDown={() => {
                          setTo(loc.name);
                          setShowToSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-teal-500" />
                        <span>{loc.name}</span>
                        <span className="text-sm text-gray-400">
                          ({loc.province})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="md:col-span-3">
                <CustomDatePicker
                  label={t('date')}
                  value={date}
                  min={today}
                  onChange={setDate}
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl flex justify-center items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>{t('search')}</span>
            </button>
          </div>
        </div>

        <div className="mt-12">
          <HeroLocationSlider />
        </div>
      </div>
    </div>
  );
}
