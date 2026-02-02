// src/features/system-dashboard/SystemDashboard.container.tsx
import { useEffect, useState } from "react";
import { adminApi } from "../../api/service/admin/admin.api";
import { SystemDashboard } from "../../pages/admin/SystemDashboard";
import type { CompanyRow, SystemDashboardStats } from "@obtp/shared-types";

export function SystemDashboardContainer() {
  const [stats, setStats] = useState<SystemDashboardStats | null>(null);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [statsData, companiesData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getCompanies(),
        ]);

        if (!mounted) return;

        setStats(statsData);

        // map backend → UI row
        setCompanies(
          companiesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            vehicles: c.totalVehicles ?? 0,
            trips: c.totalTrips ?? 0,
            revenue: `${(c.totalRevenue / 1e9).toFixed(1)}B`,
            status: c.status,
            rating: c.averageRating ?? 0,
          })),
        );
      } catch (e) {
        if (mounted) setError("Không thể tải dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SystemDashboard
      stats={stats}
      companies={companies}
      loading={loading}
      error={error}
    />
  );
}
