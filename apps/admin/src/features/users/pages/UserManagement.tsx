import { useState, useMemo } from "react";
import {
  Search,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  RefreshCw,
  Users as UsersIcon,
  AlertCircle,
  Calendar,
  Wallet,
  MapPin,
} from "lucide-react";
import { UserRole } from "@obtp/shared-types";
import { formatCurrency, formatDate, formatNumber } from "@obtp/business-logic";
import { useUsers } from "../hooks/useUsers";
import { useLanguage } from "@/contexts/LanguageContext";

export function UserManagement() {
  const { t } = useLanguage();

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
    isRefetching,
    toggleBanStatus,
    isMutating,
  } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchQuery);

      const matchesRole =
        filterRole === "all" || user.roles.includes(filterRole as UserRole);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !user.isBanned) ||
        (filterStatus === "banned" && user.isBanned);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => !u.isBanned).length,
      banned: users.filter((u) => u.isBanned).length,
    }),
    [users],
  );

  const getRoleLabel = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) return t("systemAdmin");
    if (roles.includes(UserRole.COMPANY_ADMIN)) return t("companyAdminRoleLabel");
    if (roles.includes(UserRole.STAFF)) return t("staffRole");
    return t("userRole");
  };

  const getRoleBadgeColor = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (roles.includes(UserRole.COMPANY_ADMIN)) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 bg-red-50/50 rounded-2xl border border-red-100">
      <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
      <p className="text-gray-600 mb-4 font-medium">Không thể tải danh sách người dùng</p>
      <button onClick={() => refetch()} className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("userManagementTitle")}
          </h1>
          <p className="text-gray-500 mt-1">{t("userManagementDesc")}</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Tổng người dùng", val: stats.total, icon: UsersIcon, color: "blue" },
          { label: "Đang hoạt động", val: stats.active, icon: CheckCircle, color: "green" },
          { label: "Đã khóa", val: stats.banned, icon: Ban, color: "red" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center text-${item.color}-600`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-bold dark:text-white">{formatNumber(item.val)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar - Styled like Review Page */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 
                bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="min-w-[180px]">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value={UserRole.USER}>Khách hàng</option>
              <option value={UserRole.COMPANY_ADMIN}>Quản trị nhà xe</option>
              <option value={UserRole.ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="min-w-[180px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            Không tìm thấy người dùng phù hợp
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              {/* User Identity */}
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-100 dark:shadow-none">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      {user.name}
                    </h4>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${getRoleBadgeColor(user.roles)}`}>
                      {getRoleLabel(user.roles)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Activity */}
              <div className="flex flex-wrap gap-6 items-center">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Chi tiêu</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(user.totalSpent || 0)}</p>
                </div>
                <div className="text-right hidden lg:block border-l pl-6 border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Chuyến đi</p>
                  <p className="font-bold text-gray-900 dark:text-white">{user.totalTrips || 0}</p>
                </div>
                
                {/* Status Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${user.isBanned ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                   <div className={`w-2 h-2 rounded-full ${user.isBanned ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                   <span className="text-xs font-bold uppercase">{user.isBanned ? "Bị khóa" : "Hoạt động"}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBanStatus({ userId: user.id, isBanned: !user.isBanned })}
                    disabled={isMutating}
                    title={user.isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                    className={`p-2.5 rounded-xl border transition-all ${
                      user.isBanned
                        ? "text-green-600 border-green-200 hover:bg-green-100"
                        : "text-red-600 border-red-200 hover:bg-red-100"
                    } disabled:opacity-50`}
                  >
                    {user.isBanned ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}