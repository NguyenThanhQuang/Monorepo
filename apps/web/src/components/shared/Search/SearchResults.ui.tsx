import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  Star,
  Wifi,
  Coffee,
  Snowflake,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Trip } from '@obtp/shared-types';
import { tripApi } from '../../../api/service/trips/trips.api';
import { da } from 'zod/locales';

/* ================= FIX TYPE ================= */

type TripWithVehicleAmenities = Trip & {
  vehicle?: {
    amenities?: string[];
  };
};

/* ================= PROPS ================= */

interface SearchResultsProps {
  fromId: string;
  toId: string;
  date?: string;
  onBack: () => void;
  onTripSelect: (tripId: string) => void;
}

export function SearchResults({
  fromId,
  toId,
  date,
  onBack,
  onTripSelect,
}: SearchResultsProps) {
  const { t } = useLanguage();

  const [trips, setTrips] = useState<TripWithVehicleAmenities[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('time');

  /* ================= FETCH ================= */

useEffect(() => {
  const fetchTrips = async () => {
    setLoading(true);
    try {
      let data: TripWithVehicleAmenities[];
      console.log(date)
      if (date !== undefined && date !== '') {
        data = await tripApi.search(fromId, toId, date);
      } else {
        data = await tripApi.searchByRoute(fromId);
      }

      setTrips(data);
    } catch (err) {
      console.error('SEARCH ERROR', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  fetchTrips();
}, [fromId, toId, date]);


  /* ================= HELPERS ================= */

  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    coffee: Coffee,
    ac: Snowflake,
    tv: Monitor,
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return (
      new Date(a.departureTime).getTime() -
      new Date(b.departureTime).getTime()
    );
  });

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('loading')}</p>
      </div>
    );
  }

  /* ================= EMPTY ================= */

  if (!sortedTrips.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">🚫 {t('noMatchingRoutes')}</h2>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl"
        >
          {t('backToSearch')}
        </button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 shadow-sm">
        <div className="px-4 py-4 flex justify-between items-center">
          <button onClick={onBack}>
            <ArrowLeft />
          </button>
          <h1>{t('searchResults')}</h1>
          <SlidersHorizontal />
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button onClick={() => setSortBy('time')}>⏰ {t('sortByTime')}</button>
          <button onClick={() => setSortBy('price')}>💰 {t('sortByPrice')}</button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {sortedTrips.map((trip) => (
          <div
            key={trip._id}
            onClick={() => onTripSelect(trip._id)}
            className="bg-white rounded-2xl p-6 shadow cursor-pointer"
          >
            <div className="flex justify-between mb-4">
              <div>
                <h3>{trip.companyId}</h3>
                <div className="flex gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400" /> 4.8
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl text-blue-600">
                  {formatPrice(trip.price)}
                </div>
                <div className="text-sm text-gray-500">
                  {trip.availableSeatsCount} {t('seatsAvailable')}
                </div>
              </div>
            </div>

            <div className="flex justify-between mb-4">
              <div>
                <div className="text-lg">
                  {new Date(trip.departureTime).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-500">
                  <MapPin className="inline w-4 h-4" /> {trip.route.from?.name}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg">
                  {new Date(trip.expectedArrivalTime).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-500">
                  <MapPin className="inline w-4 h-4" /> {trip.route.to?.name}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <div className="flex gap-2">
                {trip.vehicle?.amenities?.map((a) => {
                  const Icon = amenityIcons[a];
                  return Icon ? <Icon key={a} className="w-4 h-4" /> : null;
                })}
              </div>

              <span className="text-blue-600 flex gap-1">
                {t('viewDetails')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
