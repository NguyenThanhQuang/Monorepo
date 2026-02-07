// src/components/search/SearchResults.tsx
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Coffee,
  Snowflake,
  Monitor,
  Clock,
  Star,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Trip } from '@obtp/shared-types';
import { tripApi } from '../../../api/service/trips/trips.api';

type TripWithVehicleAmenities = Trip & {
  vehicle?: {
    amenities?: string[];
  };
};

interface SearchResultsProps {
  fromProvince: string;
  toProvince: string;
  date?: string;
  onBack: () => void;
  onTripSelect: (tripId: string) => void;
}

export function SearchResults({
  fromProvince,
  toProvince,
  date,
  onBack,
  onTripSelect,
}: SearchResultsProps) {
  const { t } = useLanguage();
  const [trips, setTrips] = useState<TripWithVehicleAmenities[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'duration'>('time');

  useEffect(() => {
    // ⛔ Không gọi API khi thiếu param
    if (!fromProvince || !toProvince) return;

    const fetchTrips = async () => {
      setLoading(true);
      try {
        const finalDate =
          date ?? new Date().toISOString().split('T')[0];

        const data = await tripApi.searchTrips(
          fromProvince,
          toProvince,
          finalDate,
        );

        setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log('API PARAMS', {
          fromProvince,
          toProvince,
          date,
        });
        console.error('SEARCH ERROR', err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [fromProvince, toProvince, date]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Calculate duration in hours and minutes
  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const diffMs = arrTime.getTime() - depTime.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Sort trips
  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'time') {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    }
    if (sortBy === 'duration') {
      const durationA = new Date(a.expectedArrivalTime).getTime() - new Date(a.departureTime).getTime();
      const durationB = new Date(b.expectedArrivalTime).getTime() - new Date(b.departureTime).getTime();
      return durationA - durationB;
    }
    return 0;
  });

  const amenityIcons: Record<string, { icon: any; label: string }> = {
    wifi: { icon: Wifi, label: 'Wi-Fi' },
    coffee: { icon: Coffee, label: 'Đồ uống' },
    ac: { icon: Snowflake, label: 'Điều hòa' },
    tv: { icon: Monitor, label: 'TV' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!trips.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('noMatchingRoutes')}</p>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Kết quả tìm kiếm</h1>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <SlidersHorizontal className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trips[0]?.route?.from?.name} → {trips[0]?.route?.to?.name}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {date ? new Date(date).toLocaleDateString('vi-VN') : 'Hôm nay'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSortBy('time')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                sortBy === 'time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Giờ đi
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                sortBy === 'price'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Giá
            </button>
            <button
              onClick={() => setSortBy('duration')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                sortBy === 'duration'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Thời gian
            </button>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Tìm thấy <span className="text-blue-600 dark:text-blue-400">{sortedTrips.length} chuyến xe</span>
          </p>
        </div>

        <div className="space-y-4">
          {sortedTrips.map((trip) => {
            const duration = calculateDuration(trip.departureTime.toString(), trip.expectedArrivalTime.toString());
            const companyName = (trip.companyId as any)?.name ?? 'Nhà xe';
            const companyRating = (trip as any)?.companyAvgRating ?? 4;
            const companyReviewCount = (trip as any)?.companyReviewCount ?? 0;
            const availableSeats = trip.availableSeatsCount ?? trip.seats?.filter(s => s.status === 'available').length ?? 0;
            // Sử dụng loại xe mặc định nếu không có thông tin
            const busType = 'Xe khách';

            return (
              <div
                key={trip._id}
                onClick={() => onTripSelect(trip._id)}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                {/* Company Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">{companyName}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{companyRating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-400">({companyReviewCount} đánh giá)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(trip.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {availableSeats} chỗ còn trống
                    </div>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-2xl text-gray-900 dark:text-white mb-1">
                      {new Date(trip.departureTime).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trip.route?.from?.name}
                    </div>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="relative">
                      <div className="border-t-2 border-gray-300 dark:border-gray-600"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 dark:bg-gray-800 px-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-2xl text-gray-900 dark:text-white mb-1">
                      {new Date(trip.expectedArrivalTime).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trip.route?.to?.name}
                    </div>
                  </div>
                </div>

                {/* Bus Type & Amenities */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                      {busType}
                    </span>
                    <div className="flex items-center space-x-2">
                      {trip.vehicle?.amenities?.map((amenity) => {
                        const amenityConfig = amenityIcons[amenity];
                        if (!amenityConfig) return null;
                        
                        const Icon = amenityConfig.icon;
                        return (
                          <div
                            key={amenity}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                            title={amenityConfig.label}
                          >
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <span>Chi tiết</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}