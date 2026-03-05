import {
  MapPin,
  TrendingUp,
  X,
  Bus,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useHeroLocationSlider } from '../../../hooks/Logic/useHeroLocationSlider';

export function HeroLocationSlider() {
  const {
    locations,
    displayLocations,
    currentIndex,
    setCurrentIndex,
    selectedLocation,
    setSelectedLocation,
    setSelectedRoute,
  } = useHeroLocationSlider();

  const { language, t } = useLanguage();

  if (!locations.length) return null;

  return (
    <>
      {/* SLIDER */}
      <div className="mt-12 overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-sm text-white">
              {t('popularDestinations')}
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="flex transition-transform duration-1000"
            style={{ transform: `translateX(-${currentIndex * 280}px)` }}
          >
            {displayLocations.map((location, index) => (
              <div
                key={`${location.id}-${index}`}
                className="w-64 mx-2 flex-shrink-0"
              >
                <div
                  onClick={() => setSelectedLocation(location)}
                  className="bg-white/10 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={location.image}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white">
                      {language === 'vi'
                        ? location.nameVi
                        : location.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-blue-100 text-sm">
                      <MapPin className="w-3 h-3" />
                      {location.routes}+ {t('routes')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INDICATORS */}
        <div className="flex justify-center gap-2 mt-6">
          {locations.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full ${
                i === currentIndex % locations.length
                  ? 'w-8 bg-white'
                  : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedLocation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedLocation(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full">
              <div className="p-6">
                <h3 className="mb-4">
                  {language === 'vi'
                    ? 'Tuyến phổ biến'
                    : 'Popular Routes'}
                </h3>

                {selectedLocation.popularRoutes?.map((route, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setSelectedRoute({
                        from: route.from,
                        to: route.to,
                      })
                    }
                    className="p-4 rounded-xl bg-gray-100 cursor-pointer mb-3"
                  >
                    <div className="flex justify-between">
                      <span>
                        <Bus className="inline w-4 h-4 mr-1" />
                        {route.from} → {route.to}
                      </span>
                      <span>{route.trips} trips</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>
                        <Clock className="inline w-3 h-3 mr-1" />
                        {route.duration}
                      </span>
                      <span>
                        <DollarSign className="inline w-3 h-3 mr-1" />
                        {route.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
