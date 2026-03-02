// src/pages/trip-detail/TripDetail.logic.ts

import { useEffect, useMemo, useState } from 'react';
import { SeatStatus, type TripDetailResponse, type TripSeat } from '@obtp/shared-types';
import { tripsApi } from '@obtp/api-client';

export function useTripDetailLogic(tripId: string) {
  const [trip, setTrip] = useState<TripDetailResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetail = async () => {
      if (!tripId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Gọi API và lấy dữ liệu
        const response = await tripsApi.getTripDetail(tripId);
        
        // Xử lý response dựa trên cấu trúc thực tế
        // Nếu API trả về { data: TripDetailResponse }
        if (response.data && response.data.data) {
          setTrip(response.data.data);
        } 
        // Nếu API trả về TripDetailResponse trực tiếp trong data
        else if (response.data) {
          setTrip(response.data);
        }
        // Nếu response là TripDetailResponse trực tiếp
        else {
          setTrip(response as unknown as TripDetailResponse);
        }
        
      } catch (error) {
        console.error('Error fetching trip detail:', error);
        setError('Không thể tải thông tin chuyến đi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [tripId]);

  const seatsByFloor = useMemo(() => {
    if (!trip) return { left: [], right: [] };

    const seats = trip.seats.filter((s) => s.floor === activeFloor);

    // Lọc ghế theo vị trí dựa vào seatNumber hoặc position
    const left = seats.filter((s) => {
      if (s.position && typeof s.position === 'object' && 'col' in s.position) {
        // Nếu có position với col, dùng tọa độ để xác định
        const totalCols = Math.ceil(Math.sqrt(trip.vehicleId.totalSeats)) || 4;
        return s.position.col <= Math.ceil(totalCols / 2);
      }
      // Fallback: dùng seatNumber để phân loại
      const seatNum = parseInt(s.seatNumber.replace(/\D/g, '')) || 0;
      return seatNum % 2 !== 0; // Số lẻ bên trái
    });

    const right = seats.filter((s) => {
      if (s.position && typeof s.position === 'object' && 'col' in s.position) {
        const totalCols = Math.ceil(Math.sqrt(trip.vehicleId.totalSeats)) || 4;
        return s.position.col > Math.ceil(totalCols / 2);
      }
      const seatNum = parseInt(s.seatNumber.replace(/\D/g, '')) || 0;
      return seatNum % 2 === 0; // Số chẵn bên phải
    });

    return { left, right };
  }, [trip, activeFloor]);

  const toggleSeat = (seat: TripSeat) => {
    if (seat.status !== SeatStatus.AVAILABLE) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((s) => s !== seat.seatNumber)
        : [...prev, seat.seatNumber],
    );
  };

  const totalAmount = useMemo(() => {
    if (!trip) return 0;
    return selectedSeats.length * trip.price;
  }, [selectedSeats, trip]);

  const isSeatSelected = (seatNumber: string) => {
    return selectedSeats.includes(seatNumber);
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
  };

  return {
    trip,
    loading,
    error,
    activeFloor,
    setActiveFloor,
    seatsByFloor,
    selectedSeats,
    toggleSeat,
    totalAmount,
    isSeatSelected,
    clearSelectedSeats,
  };
}