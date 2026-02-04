import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  SlidersHorizontal,
  Clock,
  MapPin,
  Star,
  Wifi,
  Coffee,
  Snowflake,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { tripApi,  } from './trips.api';
import type { TripResponse, TripUI } from '@obtp/shared-types';


interface SearchResultsProps {
  onBack: () => void;
  onTripSelect: (tripId: string) => void;

  fromId: string;
  toId: string;
  date: string;
}


export function SearchResults({
  onBack,
  onTripSelect,
  fromId,
  toId,
  date,
}: SearchResultsProps) {
  const { t } = useLanguage();

  const [trips, setTrips] = useState<TripUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState<'price' | 'time' | 'duration'>('time');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [fromId, toId, date]);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      const res: TripResponse[] = await tripApi.searchTrips(
        fromId,
        toId,
        date
      );

      const mapped: TripUI[] = res.map((trip) => {
        const depart = new Date(trip.departureTime);
        const arrive = new Date(trip.expectedArrivalTime);

        const durationMs = arrive.getTime() - depart.getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        return {
          id: trip._id,
          companyName: trip.companyId?.name || 'Unknown',
          companyLogo: '🚌',
          departureTime: depart.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          arrivalTime: arrive.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          duration: `${durationHours}h ${durationMinutes}m`,
          from: trip.route?.fromLocationId?.name || '',
          to: trip.route?.toLocationId?.name || '',
          price: trip.price,
          availableSeats: trip.availableSeatsCount || 0,
          totalSeats: trip.totalSeats || 40,
          busType: trip.vehicleId?.type || 'Xe khách',
          rating: 4.5,
          reviewCount: 120,
          amenities: ['wifi', 'ac'],
        };
      });

      setTrips(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const amenityIcons: any = {
    wifi: { icon: Wifi, label: t('amenityWifi') },
    coffee: { icon: Coffee, label: t('amenityDrink') },
    ac: { icon: Snowflake, label: t('amenityAC') },
    tv: { icon: Monitor, label: t('amenityTV') },
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'time') return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between mb-4">
            <button onClick={onBack}>
              <ArrowLeft />
            </button>

            <h1>{t('searchResults')}</h1>

            <button onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal />
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl">
            <MapPin />
            <div>{date}</div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => setSortBy('time')}>
              {t('sortByTime')}
            </button>

            <button onClick={() => setSortBy('price')}>
              {t('sortByPrice')}
            </button>

            <button onClick={() => setSortBy('duration')}>
              {t('sortByDuration')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && <p>Loading...</p>}

        <div className="space-y-4">
          {sortedTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => onTripSelect(trip.id)}
              className="bg-white rounded-3xl p-6 shadow cursor-pointer"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <h3>{trip.companyName}</h3>
                  <div className="flex">
                    <Star />
                    {trip.rating}
                  </div>
                </div>

                <div>
                  <div>{formatPrice(trip.price)}</div>
                  <div>{trip.availableSeats} seats</div>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <div>
                  <div>{trip.departureTime}</div>
                  <div>{trip.from}</div>
                </div>

                <Clock />
                <div>{trip.duration}</div>

                <div>
                  <div>{trip.arrivalTime}</div>
                  <div>{trip.to}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <span>{trip.busType}</span>

                <button className="text-blue-500 flex">
                  {t('viewDetails')}
                  <ArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
