import { useEffect, useMemo, useState } from 'react';
import type { Company, Trip } from '@obtp/shared-types';
import { TripStatus } from '@obtp/shared-types';
import { companyApi } from '../../api/service/company.api.ts/company.api';
import { TripsApi } from '../../api/service/trips/trips.api';

/* ================= SAFE ARRAY ================= */
function toArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
}

export function useCompanyDashboardLogic() {
  const [company, setCompany] = useState<Company | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        /* ===== COMPANY ===== */
        const cmp = await companyApi.getMyCompany();
        setCompany(cmp);

        /* ===== TRIPS (🔥 FIX CHÍNH Ở ĐÂY) ===== */
        const tripRes = await TripsApi.getManagementTrips(cmp.id);
        const tripList = toArray<Trip>(tripRes);

        setTrips(tripList);
      } catch (error) {
        console.error('Company dashboard error:', error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const safeTrips = Array.isArray(trips) ? trips : [];

    return {
      totalVehicles: company?.stats?.totalVehicles ?? 0,

      todayTrips: safeTrips.filter(
        t => new Date(t.departureTime).toDateString() === today,
      ).length,

      totalPassengers: safeTrips.reduce(
        (sum, t) => sum + (t.totalSeats - t.availableSeatsCount),
        0,
      ),

      monthlyRevenue: safeTrips.reduce(
        (sum, t) =>
          t.status === TripStatus.ARRIVED
            ? sum + t.price * (t.totalSeats - t.availableSeatsCount)
            : sum,
        0,
      ),
    };
  }, [company, trips]);

  /* ================= RECENT TRIPS ================= */
  const recentTrips = useMemo(() => {
    return [...trips]
      .sort(
        (a, b) =>
          new Date(b.departureTime).getTime() -
          new Date(a.departureTime).getTime(),
      )
      .slice(0, 5);
  }, [trips]);

  return {
    loading,

    company,
    stats,
    recentTrips,

    showReportModal,
    setShowReportModal,
  };
}
