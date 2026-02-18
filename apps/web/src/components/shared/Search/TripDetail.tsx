// src/components/trip/TripDetail.tsx
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Wifi,
  Coffee,
  Snowflake,
  Monitor,
  Star,
  User,
  Info,
  Armchair,
  Users,
  Shield,
} from 'lucide-react';

import type { Trip, TripSeat } from '@obtp/shared-types';
import { SeatStatus } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getCompanyLogo, getCompanyName, getFromLocationName, getToLocationName, getVehicleAmenities, getVehicleType, tripApi } from '../../../api/service/trips/trips.api';
import { PaymentModal } from '../../payment/PaymentModal';

interface TripDetailProps {
  tripId: string;
  onBack: () => void;
  onBooking: (selectedSeats: string[]) => void;
}

export function TripDetail({ tripId, onBack, onBooking }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { t, language } = useLanguage();

// Trong TripDetail.tsx, sửa hàm fetchTripDetail:

useEffect(() => {
  const fetchTripDetail = async () => {
    setLoading(true);
    try {
      // Kiểm tra ID hợp lệ trước khi gọi API
      if (!tripId || tripId.length !== 24) {
        console.error('Invalid trip ID:', tripId);
        setTrip(null);
        return;
      }

      const data = await tripApi.getTripById(tripId);
      
      if (data) {
        setTrip(data);
      } else {
        console.error('Trip not found or invalid data');
        setTrip(null);
      }
    } catch (error) {
      console.error('Error fetching trip detail:', error);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  fetchTripDetail();
}, [tripId]);

  const handleSeatClick = (seat: TripSeat) => {
    if (seat.status === SeatStatus.BOOKED || seat.status === SeatStatus.HELD) return;

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const getSeatColor = (seat: TripSeat) => {
    if (selectedSeats.includes(seat.seatNumber)) {
      return 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105';
    }
    if (seat.status === SeatStatus.BOOKED) {
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white border-gray-400 cursor-not-allowed opacity-60';
    }
    if (seat.status === SeatStatus.HELD) {
      return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400 cursor-not-allowed opacity-60';
    }
    return 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105 hover:shadow-md';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (departureTime: string | Date, arrivalTime: string | Date) => {
    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const diffMs = arrTime.getTime() - depTime.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Lọc ghế theo tầng
  const getSeatsByFloor = (floor: number): TripSeat[] => {
    if (!trip?.seats) return [];
    return trip.seats.filter(s => s.floor === floor);
  };

  const handleBookNow = () => {
    if (selectedSeats.length === 0) {
      alert(t('selectSeat'));
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    onBooking(selectedSeats);
  };

  const totalAmount = selectedSeats.length * (trip?.price || 0);

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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Không tìm thấy chuyến đi</p>
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

  const companyName = getCompanyName(trip);
  const companyLogo = getCompanyLogo(trip);
  const vehicleType = getVehicleType(trip);
  const amenities = getVehicleAmenities(trip);
  const fromLocationName = getFromLocationName(trip);
  const toLocationName = getToLocationName(trip);
  const duration = calculateDuration(trip.departureTime, trip.expectedArrivalTime);
  const departureDate = formatDate(trip.departureTime);
  const departureTime = formatTime(trip.departureTime);
  const arrivalTime = formatTime(trip.expectedArrivalTime);

  const floorSeats = getSeatsByFloor(activeFloor);
  const totalFloors = trip.vehicleId && typeof trip.vehicleId === 'object' 
    ? (trip.vehicleId as any).floors || 1 
    : 1;

  const amenityIcons: Record<string, { icon: any; label: string }> = {
    wifi: { icon: Wifi, label: 'Wi-Fi' },
    coffee: { icon: Coffee, label: 'Đồ uống' },
    ac: { icon: Snowflake, label: 'Điều hòa' },
    tv: { icon: Monitor, label: 'TV' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl text-gray-900 dark:text-white">{t('tripDetails')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {/* Trip Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={companyName}
                className="w-16 h-16 rounded-2xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-3xl">
                🚌
              </div>
            )}
            <div>
              <h2 className="text-xl text-gray-900 dark:text-white mb-1">{t('busCompany')}: {companyName}</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-base text-gray-700 dark:text-gray-300">4.8</span>
                <span className="text-sm text-gray-400">(234 {t('reviews')})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('departureTime')}</div>
                <div className="text-base text-gray-900 dark:text-white">{departureTime} - {departureDate}</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('route')}</div>
                <div className="text-base text-gray-900 dark:text-white">{fromLocationName} → {toLocationName}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm">
              {vehicleType}
            </span>
            <div className="flex items-center space-x-2">
              {amenities.slice(0, 4).map((amenity) => {
                const amenityKey = amenity.toLowerCase();
                const amenityConfig = amenityIcons[amenityKey];
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

          {/* Vehicle Details */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-2xl p-4 mb-4">
            <h4 className="text-base text-gray-600 dark:text-gray-400 mb-3">{t('vehicleDetails')}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{t('vehicleType')}</div>
                <div className="text-sm text-gray-900 dark:text-white">{vehicleType}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{t('capacity')}</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {trip.vehicleId && typeof trip.vehicleId === 'object' 
                    ? (trip.vehicleId as any).totalSeats || trip.seats?.length || 0
                    : trip.seats?.length || 0} {t('seats')}
                  {totalFloors > 1 && ` (${totalFloors} ${t('floors')})`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{t('licensePlate')}</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {trip.vehicleId && typeof trip.vehicleId === 'object' 
                    ? (trip.vehicleId as any).vehicleNumber || 'N/A'
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{t('amenities')}</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {amenities.slice(0, 3).join(', ')}
                  {amenities.length > 3 && '...'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600 dark:text-gray-400">{t('ticketPrice')}</span>
              <span className="text-2xl text-blue-600 dark:text-blue-400">{formatPrice(trip.price)}</span>
            </div>
          </div>
        </div>

        {/* Seat Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="text-xl text-gray-900 dark:text-white mb-4">{t('selectSeat')}</h3>

          {/* Floor Toggle - Chỉ hiển thị nếu có nhiều tầng */}
          {totalFloors > 1 && (
            <div className="flex items-center space-x-2 mb-6">
              {Array.from({ length: totalFloors }, (_, i) => i + 1).map((floor) => (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(floor)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-base ${
                    activeFloor === floor
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`floor${floor}`) || `Tầng ${floor}`}
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-600 rounded-lg shadow-lg shadow-blue-500/50"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('selected')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 border-2 border-gray-400 rounded-lg opacity-60"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('booked')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 border-2 border-orange-400 rounded-lg opacity-60"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('holding')}</span>
            </div>
          </div>

          {/* Seat Map */}
          <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6">
            {/* Driver seat indicator */}
            <div className="flex justify-end mb-4">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-600 dark:text-blue-400">{t('driver')}</span>
              </div>
            </div>

            {/* Hiển thị ghế theo layout đơn giản (2 cột) */}
            {floorSeats.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Cột trái */}
                <div className="space-y-3">
                  {floorSeats
                    .filter((_, index) => index % 2 === 0)
                    .map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === SeatStatus.BOOKED || seat.status === SeatStatus.HELD}
                        className={`w-full h-16 border-2 rounded-xl transition-all flex items-center justify-center ${getSeatColor(seat)}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Armchair className="w-5 h-5" />
                          <span className="text-base font-medium">{seat.seatNumber}</span>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Cột phải */}
                <div className="space-y-3">
                  {floorSeats
                    .filter((_, index) => index % 2 === 1)
                    .map((seat) => (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === SeatStatus.BOOKED || seat.status === SeatStatus.HELD}
                        className={`w-full h-16 border-2 rounded-xl transition-all flex items-center justify-center ${getSeatColor(seat)}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Armchair className="w-5 h-5" />
                          <span className="text-base font-medium">{seat.seatNumber}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Không có ghế nào trên tầng này
              </div>
            )}

            {/* Lối đi ở giữa (visual) */}
            {floorSeats.length > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-3/4">
                <div className="h-full w-1 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            {language === 'vi' 
              ? 'Vui lòng chọn ghế và tiến hành đặt vé. Ghế sẽ được giữ trong 15 phút.'
              : 'Please select seats and proceed with booking. Seats will be held for 15 minutes.'}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSeats.length > 0 
                ? `${t('selected')} ${selectedSeats.length} ${t('seats')}: ${selectedSeats.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}`
                : language === 'vi' ? 'Chưa chọn ghế' : 'No seats selected'}
            </div>
            <div className="text-2xl text-gray-900 dark:text-white">
              {formatPrice(totalAmount)}
            </div>
          </div>
          <button
            onClick={handleBookNow}
            disabled={selectedSeats.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
          >
            {t('completePayment')}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && trip && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
          amount={totalAmount}
          ticketInfo={{
            route: `${fromLocationName} → ${toLocationName}`,
            date: departureDate,
            time: departureTime,
            seats: selectedSeats,
            companyName: companyName,
            vehicleType: vehicleType,
          }}
        />
      )}
    </div>
  );
}