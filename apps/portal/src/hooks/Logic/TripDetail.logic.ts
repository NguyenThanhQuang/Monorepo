// src/pages/trip-detail/TripDetail.logic.ts

import { useEffect, useMemo, useState } from 'react';
import { getTripDetail } from './tripDetail.api';
import { SeatStatus, type TripDetailResponse, type TripSeat } from '@obtp/shared-types';

export function useTripDetailLogic(tripId: string) {
  const [trip, setTrip] = useState<TripDetailResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTripDetail(tripId)
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [tripId]);

  const seatsByFloor = useMemo(() => {
    if (!trip) return { left: [], right: [] };

    const seats = trip.seats.filter((s) => s.floor === activeFloor);

    return {
      left: seats.filter((s) => s.position === 'left'),
      right: seats.filter((s) => s.position === 'right'),
    };
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

  return {
    trip,
    loading,
    activeFloor,
    setActiveFloor,
    seatsByFloor,
    selectedSeats,
    toggleSeat,
    totalAmount,
  };
}
