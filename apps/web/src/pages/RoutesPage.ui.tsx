import { MapPin, Clock, DollarSign } from 'lucide-react';
import type { RouteCardVM } from '../features/RoutesPage/types';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Props {
  routes: RouteCardVM[];
  onBack: () => void;
  onRouteClick?: (from: string, to: string) => void;
}

export function RoutesPageUI({ routes, onBack, onRouteClick }: Props) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route, index) => (
        <div
          key={index}
          onClick={() => onRouteClick?.(route.from, route.to)}
          className="cursor-pointer bg-white rounded-3xl shadow-lg"
        >
          <div className="relative h-48">
            <ImageWithFallback
              src={route.image}
              alt={`${route.from} to ${route.to}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{route.from} → {route.to}</span>
            </div>

            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{route.durationText}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>{route.minPrice.toLocaleString()}đ</span>
              </div>
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-xl">
              {t('search')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
