import { tripsApi } from "@obtp/api-client";
import { SeatStatus, type Trip, type TripSeat } from "@obtp/shared-types";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export function useTripDetailLogic(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchTripDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!tripId) throw new Error("Trip ID is missing");

        const data = await tripsApi.getTripById(tripId);

        if (data) {
          setTrip(data);
          setSelectedSeats([]);
          setActiveFloor(1);
        } else {
          setError("Không tìm thấy chuyến đi");
        }
      } catch (error) {
        console.error("Error fetching trip detail:", error);
        setError("Có lỗi xảy ra khi tải thông tin chuyến đi");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [tripId]);

  const handleSeatClick = (seat: TripSeat) => {
    if (seat.status !== SeatStatus.AVAILABLE) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.seatNumber)) {
        return prev.filter((s) => s !== seat.seatNumber);
      } else {
        return [...prev, seat.seatNumber];
      }
    });
  };

  const getSeatColor = (seat: TripSeat) => {
    if (selectedSeats.includes(seat.seatNumber)) {
      return "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-500/50 scale-105";
    }
    if (seat.status === SeatStatus.BOOKED) {
      return "bg-gradient-to-br from-gray-400 to-gray-500 text-white border-gray-400 cursor-not-allowed opacity-60";
    }
    if (seat.status === SeatStatus.HELD) {
      return "bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400 cursor-not-allowed opacity-60";
    }
    return "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105 hover:shadow-md cursor-pointer";
  };

  const sortedSeats = useMemo(() => {
    if (!trip?.seats) return [];
    return [...trip.seats].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.seatNumber.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [trip]);

  const displaySeats = useMemo(() => {
    const hasFloorInfo = sortedSeats.some((seat) => seat.floor !== undefined);
    return hasFloorInfo
      ? sortedSeats.filter((seat) => seat.floor === activeFloor)
      : sortedSeats;
  }, [sortedSeats, activeFloor]);

  const { leftSeats, rightSeats } = useMemo(() => {
    const midPoint = Math.ceil(displaySeats.length / 2);
    return {
      leftSeats: displaySeats.slice(0, midPoint),
      rightSeats: displaySeats.slice(midPoint),
    };
  }, [displaySeats]);

  const totalAmount = selectedSeats.length * (trip?.price || 0);

  const handleBookNow = (t: (key: string) => string) => {
    if (selectedSeats.length === 0) {
      toast.error(t("selectSeat") || "Vui lòng chọn ghế");
      return;
    }
    setShowPaymentModal(true);
  };

  return {
    trip,
    loading,
    error,
    selectedSeats,
    activeFloor,
    setActiveFloor,
    showPaymentModal,
    setShowPaymentModal,
    handleSeatClick,
    getSeatColor,
    leftSeats,
    rightSeats,
    totalAmount,
    handleBookNow,
  };
}
