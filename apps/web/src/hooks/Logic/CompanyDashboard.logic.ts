'use client';

import { useEffect, useState } from 'react';
import { Bus, Route, Users, Wallet } from 'lucide-react';
import { CompanyDashboardApi } from '../../api/service/admin/CompanyDashboard.api';
import type { CompanyDashboardStat, CompanyDashboardTrip } from '@obtp/shared-types';



export function useCompanyDashboardLogic() {
  const [stats, setStats] = useState<CompanyDashboardStat[]>([]);
  const [trips, setTrips] = useState<CompanyDashboardTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [statsRes, tripsRes] = await Promise.all([
      CompanyDashboardApi.getStats(),
      CompanyDashboardApi.getTrips(),
    ]);

    setStats([
      {
        label: 'Tổng chuyến',
        value: String(statsRes.totalTrips),
        icon: Route,
        color: 'text-blue-600',
      },
      {
        label: 'Xe đang chạy',
        value: String(statsRes.activeVehicles),
        icon: Bus,
        color: 'text-green-600',
      },
      {
        label: 'Khách hôm nay',
        value: String(statsRes.todayPassengers),
        icon: Users,
        color: 'text-purple-600',
      },
      {
        label: 'Doanh thu',
        value: `${statsRes.revenue.toLocaleString()}₫`,
        icon: Wallet,
        color: 'text-orange-600',
      },
    ]);

    setTrips(tripsRes);
    setLoading(false);
  }

  return {
    stats,
    trips,
    loading,
    reload: load,
  };
}
