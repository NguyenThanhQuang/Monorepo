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
  Phone,
  Mail,
  Map,
} from 'lucide-react';

import type { Trip, TripSeat } from '@obtp/shared-types';
import { SeatStatus } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';

import { PaymentModal } from '../../payment/PaymentModal';
import { tripsApi } from '@obtp/api-client';

interface TripDetailProps {
  tripId: string;
  onBack: () => void;
  onBooking: (selectedSeats: string[]) => void;
}

export function TripDetail({ tripId, onBack, onBooking }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTripDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Kiểm tra ID hợp lệ trước khi gọi API
        if (!tripId || tripId === 'undefined' || tripId === 'null') {
          console.error('❌ Invalid trip ID (null/undefined):', tripId);
          setError('ID chuyến đi không hợp lệ');
          setTrip(null);
          return;
        }

        // Kiểm tra độ dài ID (ObjectId chuẩn 24 ký tự)
        if (tripId.length !== 24) {
          console.error('❌ Invalid trip ID length:', tripId.length);
          console.error('   Expected: 24, Got:', tripId.length);
          setError(`ID chuyến đi không đúng định dạng (${tripId.length}/24 ký tự)`);
          setTrip(null);
          return;
        }

        // Kiểm tra ký tự hex
        if (!/^[0-9a-fA-F]+$/.test(tripId)) {
          console.error('❌ ID contains non-hex characters:', tripId);
          setError('ID chuyến đi chứa ký tự không hợp lệ');
          setTrip(null);
          return;
        }

        console.log('🔍 Fetching trip detail for ID:', tripId);
        const data = await tripsApi.getTripById(tripId);
        
        console.log('📦 Data received from API:', data);
        
        if (data) {
          // Kiểm tra dữ liệu có đầy đủ không
          console.log('✅ Trip data received:', {
            id: data._id,
            company: tripsApi.getCompanyName(data),
            from: tripsApi.getFromLocationName(data),
            to: tripsApi.getToLocationName(data),
            departureTime: data.departureTime,
            hasSeats: data.seats ? data.seats.length : 0
          });
          
          // Log chi tiết về ghế để debug
          if (data.seats) {
            console.log('💺 Seats data:', {
              total: data.seats.length,
              available: data.seats.filter(s => s.status === SeatStatus.AVAILABLE).length,
              booked: data.seats.filter(s => s.status === SeatStatus.BOOKED).length,
              held: data.seats.filter(s => s.status === SeatStatus.HELD).length,
              sample: data.seats.slice(0, 3),
              hasFloor: data.seats.some(s => s.floor !== undefined)
            });
          }
          
          setTrip(data);
          
          // Reset selected seats khi chuyển trip mới
          setSelectedSeats([]);
          setActiveFloor(1);
        } else {
          console.error('❌ Trip not found or invalid data');
          setError('Không tìm thấy chuyến đi');
          setTrip(null);
        }
      } catch (error) {
        console.error('❌ Error fetching trip detail:', error);
        setError('Có lỗi xảy ra khi tải thông tin chuyến đi');
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [tripId]);

  const handleSeatClick = (seat: TripSeat) => {
    console.log('🎯 Seat clicked:', seat.seatNumber, 'Status:', seat.status);
    
    // Kiểm tra trạng thái ghế - chỉ cho phép chọn ghế AVAILABLE
    if (seat.status !== SeatStatus.AVAILABLE) {
      console.log('⛔ Cannot select seat with status:', seat.status);
      return;
    }

    // Cập nhật selectedSeats
    setSelectedSeats(prev => {
      if (prev.includes(seat.seatNumber)) {
        // Bỏ chọn ghế
        console.log('➖ Deselecting seat:', seat.seatNumber);
        return prev.filter(s => s !== seat.seatNumber);
      } else {
        // Thêm ghế mới
        console.log('➕ Selecting seat:', seat.seatNumber);
        return [...prev, seat.seatNumber];
      }
    });
  };

  const getSeatColor = (seat: TripSeat) => {
    // Kiểm tra ghế đã được chọn chưa
    if (selectedSeats.includes(seat.seatNumber)) {
      return 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105';
    }
    
    // Trạng thái ghế từ API
    if (seat.status === SeatStatus.BOOKED) {
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white border-gray-400 cursor-not-allowed opacity-60';
    }
    if (seat.status === SeatStatus.HELD) {
      return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400 cursor-not-allowed opacity-60';
    }
    
    // Ghế AVAILABLE - có thể chọn
    return 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105 hover:shadow-md cursor-pointer';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Lấy tất cả ghế (không lọc theo tầng nếu không có thông tin floor)
  const getAllSeats = (): TripSeat[] => {
    if (!trip?.seats) return [];
    return trip.seats;
  };

  // Sắp xếp ghế theo số ghế
  const sortSeatsByNumber = (seats: TripSeat[]): TripSeat[] => {
    return [...seats].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/\D/g, ''));
      const numB = parseInt(b.seatNumber.replace(/\D/g, ''));
      return numA - numB;
    });
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

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-4">
            <p className="text-lg font-medium mb-2">❌ {error || 'Không tìm thấy chuyến đi'}</p>
            <p className="text-sm">ID: {tripId}</p>
          </div>
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

  // Lấy dữ liệu từ helpers
  const companyName = tripsApi.getCompanyName(trip);
  const companyLogo = tripsApi.getCompanyLogo(trip);
  const companyPhone = tripsApi.getCompanyPhone(trip);
  const vehicleType = tripsApi.getVehicleType(trip);
  const vehicleNumber = tripsApi.getVehicleNumber(trip);
  const amenities = tripsApi.getVehicleAmenities(trip);
  const totalSeats = tripsApi.getTotalSeats(trip);
  const totalFloors = tripsApi.getVehicleFloors(trip);
  
  const fromLocationName = tripsApi.getFromLocationName(trip);
  const fromLocationProvince = tripsApi.getFromLocationProvince(trip);
  const fromLocationAddress = tripsApi.getFromLocationAddress(trip);
  
  const toLocationName = tripsApi.getToLocationName(trip);
  const toLocationProvince = tripsApi.getToLocationProvince(trip);
  const toLocationAddress = tripsApi.getToLocationAddress(trip);
  
  const departureTime = tripsApi.formatTripTime(trip.departureTime);
  const departureDate = tripsApi.formatTripDate(trip.departureTime);
  const arrivalTime = tripsApi.formatTripTime(trip.expectedArrivalTime);
  const arrivalDate = tripsApi.formatTripDate(trip.expectedArrivalTime);
  const duration = tripsApi.calculateTripDuration(trip.departureTime, trip.expectedArrivalTime);

  // Lấy tất cả ghế và sắp xếp
  const allSeats = sortSeatsByNumber(getAllSeats());
  
  // Kiểm tra xem ghế có thông tin floor không
  const hasFloorInfo = allSeats.some(seat => seat.floor !== undefined);
  
  // Nếu có thông tin floor, lọc theo tầng, nếu không thì hiển thị tất cả
  const displaySeats = hasFloorInfo 
    ? allSeats.filter(seat => seat.floor === activeFloor)
    : allSeats;
  
  // Chia ghế thành 2 cột (trái và phải) - mỗi cột 1 nửa số ghế
  const midPoint = Math.ceil(displaySeats.length / 2);
  const leftSeats = displaySeats.slice(0, midPoint);
  const rightSeats = displaySeats.slice(midPoint);

  const amenityIcons: Record<string, { icon: any; label: string }> = {
    wifi: { icon: Wifi, label: 'Wi-Fi' },
    coffee: { icon: Coffee, label: 'Đồ uống' },
    ac: { icon: Snowflake, label: 'Điều hòa' },
    tv: { icon: Monitor, label: 'TV' },
    'điều hòa': { icon: Snowflake, label: 'Điều hòa' },
    'nước uống': { icon: Coffee, label: 'Nước uống' },
    'giải trí': { icon: Monitor, label: 'Giải trí' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('tripDetails')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {/* Trip Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          {/* Company Info */}
          <div className="flex items-center space-x-4 mb-6">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={companyName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white">
                {companyName.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{companyName}</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">4.8</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">(234 {t('reviews')})</span>
                {companyPhone && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{companyPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Route Timeline */}
          <div className="relative mb-8">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-teal-500"></div>
            
            {/* Departure */}
            <div className="flex items-start space-x-4 mb-6 relative">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center z-10">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('departure')}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{fromLocationName}</p>
                <p className="text-base text-gray-600 dark:text-gray-400">{fromLocationProvince}</p>
                {fromLocationAddress && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{fromLocationAddress}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-base text-gray-700 dark:text-gray-300">
                    {departureTime} - {departureDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="flex items-start space-x-4 relative">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center z-10">
                <MapPin className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('arrival')}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{toLocationName}</p>
                <p className="text-base text-gray-600 dark:text-gray-400">{toLocationProvince}</p>
                {toLocationAddress && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{toLocationAddress}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-base text-gray-700 dark:text-gray-300">
                    {arrivalTime} - {arrivalDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                ⏱️ {duration}
              </span>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 rounded-2xl p-6 mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('vehicleDetails')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('vehicleType')}</div>
                <div className="text-base font-medium text-gray-900 dark:text-white">{vehicleType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('capacity')}</div>
                <div className="text-base font-medium text-gray-900 dark:text-white">
                  {totalSeats} {t('seats')}
                  {totalFloors > 1 && ` (${totalFloors} ${t('floors')})`}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('licensePlate')}</div>
                <div className="text-base font-medium text-gray-900 dark:text-white">
                  {vehicleNumber || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('amenities')}</div>
                <div className="flex flex-wrap gap-2">
                  {amenities.slice(0, 4).map((amenity) => {
                    const amenityKey = amenity.toLowerCase().trim();
                    const amenityConfig = amenityIcons[amenityKey] || amenityIcons[amenity];
                    
                    if (amenityConfig) {
                      const Icon = amenityConfig.icon;
                      return (
                        <div
                          key={amenity}
                          className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm"
                          title={amenityConfig.label}
                        >
                          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      );
                    }
                    
                    return (
                      <span key={amenity} className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs shadow-sm">
                        {amenity}
                      </span>
                    );
                  })}
                  {amenities.length > 4 && (
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs shadow-sm">
                      +{amenities.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-600 dark:text-gray-400">{t('ticketPrice')}</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(trip.price)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500 ml-1">/vé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('selectSeat')}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {trip.seats?.filter(s => s.status === SeatStatus.AVAILABLE).length} {t('available')}
            </span>
          </div>

          {/* Floor Toggle - Chỉ hiển thị nếu có thông tin floor */}
          {hasFloorInfo && totalFloors > 1 && (
            <div className="flex items-center space-x-2 mb-6">
              {Array.from({ length: totalFloors }, (_, i) => i + 1).map((floor) => (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(floor)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-base ${
                    activeFloor === floor
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {language === 'vi' ? `Tầng ${floor}` : `Floor ${floor}`}
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center flex-wrap gap-6 mb-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-600 rounded-lg shadow-lg shadow-blue-500/50"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('selected')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 border-2 border-gray-400 rounded-lg opacity-60"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('booked')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 border-2 border-orange-400 rounded-lg opacity-60"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('holding')}</span>
            </div>
          </div>

          {/* Seat Map */}
          <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8">
            {/* Driver seat indicator */}
            <div className="flex justify-end mb-6">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('driver')}</span>
              </div>
            </div>

            {/* Seat Grid - Hiển thị 2 cột */}
            {displaySeats.length > 0 ? (
              <div className="flex gap-8 justify-center">
                {/* Left Column */}
                <div className="w-1/2 max-w-[250px] space-y-3">
                  {leftSeats.map((seat) => (
                    <button
                      key={seat.seatNumber}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status !== SeatStatus.AVAILABLE}
                      className={`w-full h-16 border-2 rounded-xl transition-all flex items-center justify-center ${
                        seat.status === SeatStatus.AVAILABLE ? 'cursor-pointer' : 'cursor-not-allowed'
                      } ${getSeatColor(seat)}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Armchair className="w-5 h-5" />
                        <span className="text-lg font-medium">{seat.seatNumber}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right Column */}
                <div className="w-1/2 max-w-[250px] space-y-3">
                  {rightSeats.map((seat) => (
                    <button
                      key={seat.seatNumber}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status !== SeatStatus.AVAILABLE}
                      className={`w-full h-16 border-2 rounded-xl transition-all flex items-center justify-center ${
                        seat.status === SeatStatus.AVAILABLE ? 'cursor-pointer' : 'cursor-not-allowed'
                      } ${getSeatColor(seat)}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Armchair className="w-5 h-5" />
                        <span className="text-lg font-medium">{seat.seatNumber}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Armchair className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {language === 'vi' ? 'Không có ghế nào' : 'No seats available'}
                </p>
              </div>
            )}

            {/* Aisle indicator */}
            {displaySeats.length > 0 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8">
                <div className="h-32 w-0.5 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
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
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {selectedSeats.length > 0 
                ? `${t('selected')} ${selectedSeats.length} ${t('seats')}: ${selectedSeats.sort((a, b) => {
                    const numA = parseInt(a.replace(/\D/g, ''));
                    const numB = parseInt(b.replace(/\D/g, ''));
                    return numA - numB;
                  }).join(', ')}`
                : language === 'vi' ? 'Chưa chọn ghế' : 'No seats selected'}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(totalAmount)}
            </div>
          </div>
          <button
            onClick={handleBookNow}
            disabled={selectedSeats.length === 0}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
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