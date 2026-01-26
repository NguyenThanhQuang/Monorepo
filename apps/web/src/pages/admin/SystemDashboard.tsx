// src/features/system-dashboard/SystemDashboard.tsx
import {
  Building2,
  Users,
  Bus,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { CompanyRow, SystemDashboardStats } from "../../features/system-dashboard/types";
import { useLanguage } from "../../contexts/LanguageContext";

interface Props {
  stats: SystemDashboardStats | null;
  companies: CompanyRow[];
  loading: boolean;
  error: string | null;
}

export function SystemDashboard({
  stats,
  companies,
  loading,
  error,
}: Props) {
  const { t } = useLanguage();

  const statusConfig = {
    active: { label: t("activeLabel"), color: "bg-green-500", icon: CheckCircle },
    pending: { label: t("pendingLabel"), color: "bg-yellow-500", icon: AlertCircle },
    suspended: { label: t("suspendedLabel"), color: "bg-red-500", icon: XCircle },
  };

  const statsUI = [
    { label: t("totalCompaniesStats"), value: stats?.totalCompanies ?? "-", icon: Building2 },
    { label: t("usersStats"), value: stats?.totalUsers ?? "-", icon: Users },
    { label: t("totalVehiclesStats"), value: stats?.totalTrips ?? "-", icon: Bus },
    { label: t("monthlyRevenueStats"), value: stats?.totalRevenue ?? "-", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {error && <div className="text-red-500 p-4">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 p-6">
        {statsUI.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl">
              <Icon />
              <div className="text-2xl">
                {loading ? "..." : s.value}
              </div>
              <div>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Companies */}
      <table className="w-full bg-white">
        <tbody>
          {companies.map(c => {
            const status = statusConfig[c.status];
            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.vehicles}</td>
                <td>{c.trips}</td>
                <td>{c.revenue}</td>
                <td>
                  <span className={`${status.color} w-2 h-2 rounded-full`} />
                  {status.label}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <TrendingUp className="mx-auto mt-10 opacity-30" />
    </div>
  );
}
