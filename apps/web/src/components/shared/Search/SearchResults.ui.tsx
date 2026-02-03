import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  SlidersHorizontal,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';

import type { Trip } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { tripApi } from '../../../api/service/trips/trips.api';

interface SearchResultsProps {
  fromId: string;
  toId: string;
  date: string;
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

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('time');

  useEffect(() => {
    setLoading(true);
    tripApi
      .search(fromId, toId, date)
      .then(setTrips)
      .finally(() => setLoading(false));
  }, [fromId, toId, date]);

  /* =====================
     HELPERS
  ===================== */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const formatTime = (date: Date | string) =>
    new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}p`;
  };

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return (
      new Date(a.departureTime).getTime() -
      new Date(b.departureTime).getTime()
    );
  });

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack}>
              <ArrowLeft />
            </button>
            <h1>{t('searchResults')}</h1>
            <SlidersHorizontal />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600" />
            {date}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSortBy('time')}
              className={`px-4 py-2 rounded-full ${
                sortBy === 'time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {t('sortByTime')}
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`px-4 py-2 rounded-full ${
                sortBy === 'price'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {t('sortByPrice')}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && <p>{t('loading')}...</p>}

        {!loading && sortedTrips.length === 0 && (
          <p>{t('noTripsFound')}</p>
        )}

        <div className="space-y-4">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id || trip._id}
              onClick={() => onTripSelect(trip.id || trip._id)}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg cursor-pointer"
            >
              {/* TOP */}
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-semibold">
                    Xe {trip.vehicle?.vehicleNumber || '---'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {trip.route.from?.name} → {trip.route.to?.name}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-blue-600 text-xl">
                    {formatPrice(trip.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trip.availableSeatsCount}/{trip.totalSeats}{' '}
                    {t('seatsAvailable')}
                  </div>
                </div>
              </div>

              {/* TIME */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl">
                    {formatTime(trip.departureTime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trip.route.from?.name}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {formatDuration(trip.route.duration)}
                </div>

                <div className="text-right">
                  <div className="text-xl">
                    {formatTime(trip.expectedArrivalTime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trip.route.to?.name}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end border-t pt-4">
                <ArrowRight className="text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
