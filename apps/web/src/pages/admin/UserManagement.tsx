import { Search, Ban, CheckCircle, Eye, Mail, Phone } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { UserAccountStatus, UserRole } from "@obtp/shared-types";
import type { UserRoleUI, UserRow } from "../../features/user-management/types";

interface Props {
  users: UserRow[];
  loading: boolean;
  error: string | null;

  search: string;
  role: "all" | UserRole;
  status: "all" | UserAccountStatus;

  totalUsers: number;
  totalActive: number;
  totalBanned: number;
  totalTrips: number;

  onSearchChange: (v: string) => void;
  onRoleChange: (v: "all" | UserRole) => void;
  onStatusChange: (v: "all" | UserAccountStatus) => void;

  onBan: (id: string) => void;
  onUnban: (id: string) => void;
}

export function UserManagementView({
  users,
  loading,
  error,
  search,
  role,
  status,
  totalUsers,
  totalActive,
  totalBanned,
  totalTrips,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onBan,
  onUnban,
}: Props) {
  const { t, language } = useLanguage();

  const formatPrice = (v: number) =>
    new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US").format(v) +
    (language === "vi" ? "đ" : " VND");


const roleLabel: Record<UserRoleUI, string> = {
  [UserRole.ADMIN]: t("adminRole"),
  [UserRole.USER]: t("userRole"),
  [UserRole.STAFF]: t("staffRole"),
  [UserRole.COMPANY_ADMIN]: t("companyAdminRoleLabel"),
  driver: t("driverRole"), // ✅ UI-only
};


  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">{t("userManagementTitle")}</h2>
        <p className="text-gray-500">{t("userManagementDesc")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label={t("totalUsersStats")} value={totalUsers} />
        <Stat label={t("activeUsers")} value={totalActive} color="text-green-600" />
        <Stat label={t("bannedUsers")} value={totalBanned} color="text-red-600" />
        <Stat label={t("totalTripsColumn")} value={totalTrips} color="text-blue-600" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={t("searchByNameEmailPhone")}
              className="w-full pl-10 pr-4 py-2 rounded-xl border"
            />
          </div>

          <select
            value={role}
            onChange={e => onRoleChange(e.target.value as any)}
            className="px-4 py-2 rounded-xl border"
          >
            <option value="all">{t("allRoles")}</option>
            {Object.values(UserRole).map(r => (
              <option key={r} value={r}>
                {roleLabel[r]}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={e => onStatusChange(e.target.value as any)}
            className="px-4 py-2 rounded-xl border"
          >
            <option value="all">{t("allStatus")}</option>
            <option value={UserAccountStatus.ACTIVE}>{t("activeLabel")}</option>
            <option value={UserAccountStatus.BANNED}>{t("bannedStatus")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden">
        <table className="w-full">
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-6 py-4">{u.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex gap-2"><Mail size={14} />{u.email}</div>
                  <div className="flex gap-2"><Phone size={14} />{u.phone}</div>
                </td>
                <td className="px-6 py-4">{roleLabel[u.role]}</td>
                <td className="px-6 py-4">{formatPrice(u.totalSpent)}</td>
                <td className="px-6 py-4 flex gap-2">
                  <Eye size={16} />
                  {u.status === UserAccountStatus.ACTIVE ? (
                    <Ban onClick={() => onBan(u.id)} size={16} />
                  ) : (
                    <CheckCircle onClick={() => onUnban(u.id)} size={16} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
      <div className={`text-2xl ${color}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
