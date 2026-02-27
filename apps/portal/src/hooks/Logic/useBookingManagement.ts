import { useEffect, useMemo, useState } from 'react';
import type { BookingUI } from '@obtp/shared-types';
import { BookingStatus } from '@obtp/shared-types';
import { getCompanyBookings } from '../../api/service/booking/booking.api';

export function useBookingManagement() {
  const [bookings, setBookings] = useState<BookingUI[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingUI | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const raw = await getCompanyBookings();

    const mapped: BookingUI[] = raw.map((b: any) => ({
      id: b._id,
      ticketCode: b.ticketCode,
      passengerName: b.contactName,
      phone: b.contactPhone,
      route: `${b.tripId.route.fromLocationId.name} → ${b.tripId.route.toLocationId.name}`,
      departureTime: b.tripId.departureTime,
      seatNumber: b.passengers.map((p: any) => p.seatNumber).join(', '),
      price: b.totalAmount,
      status: b.status,
      bookingDate: b.createdAt,
      vehiclePlate: b.tripId.vehicleId?.licensePlate,
    }));

    setBookings(mapped);
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch =
        b.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.includes(searchQuery);

      const matchStatus =
        filterStatus === 'all' || b.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [bookings, searchQuery, filterStatus]);

  const totalRevenue = useMemo(() => {
    return bookings
      .filter(b => b.status !== BookingStatus.CANCELLED)
      .reduce((sum, b) => sum + b.price, 0);
  }, [bookings]);

  return {
    bookings,
    filteredBookings,
    totalRevenue,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    selectedBooking,
    setSelectedBooking,
  };
}
