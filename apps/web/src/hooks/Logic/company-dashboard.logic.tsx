import { useEffect, useMemo, useState } from 'react';
import type { Company, Trip } from '@obtp/shared-types';
import { TripStatus } from '@obtp/shared-types';
import { companyApi } from '../../api/service/company.api.ts/company.api';
import { TripsApi } from '../../api/service/trips/trips.api';

export function useCompanyDashboardLogic() {
  const [company, setCompany] = useState<Company | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const cmp = await companyApi.getMyCompany();
      setCompany(cmp);

      const tripList = await TripsApi.getManagementTrips(cmp.id);
      setTrips(tripList);

      setLoading(false);
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    return {
      totalVehicles: company?.stats?.totalVehicles ?? 0,
      todayTrips: trips.filter(
        t => new Date(t.departureTime).toDateString() === today,
      ).length,
      totalPassengers: trips.reduce(
        (sum, t) => sum + (t.totalSeats - t.availableSeatsCount),
        0,
      ),
      monthlyRevenue: trips.reduce(
        (sum, t) =>
          t.status === TripStatus.ARRIVED 
            ? sum + t.price * (t.totalSeats - t.availableSeatsCount)
            : sum,
        0,
      ),
    };
  }, [company, trips]);

  const recentTrips = useMemo(() => {
    return trips
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
