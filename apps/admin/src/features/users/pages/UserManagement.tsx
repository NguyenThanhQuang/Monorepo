import { useState, useMemo } from "react";
import {
  Search,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Filter,
  X,
  RefreshCw,
  Users as UsersIcon,
  AlertCircle,
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

  // State bộ lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Derived state (Lọc data)
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

  // Aggregate Stats
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => !u.isBanned).length,
      banned: users.filter((u) => u.isBanned).length,
      totalTrips: users.reduce((sum, u) => sum + (u.totalTrips || 0), 0),
    }),
    [users],
  );

  // Helpers
  const getRoleLabel = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) return t("systemAdmin");
    if (roles.includes(UserRole.COMPANY_ADMIN))
      return t("companyAdminRoleLabel");
    if (roles.includes(UserRole.STAFF)) return t("staffRole");
    return t("userRole");
  };

  const getRoleBadgeColor = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN))
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
    if (roles.includes(UserRole.COMPANY_ADMIN))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    if (roles.includes(UserRole.STAFF))
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  // Render trạng thái
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <p className="text-gray-600 mb-4">Không thể tải danh sách người dùng</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("userManagementTitle")}
          </h1>
          <p className="text-gray-500 mt-1">{t("userManagementDesc")}</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <UsersIcon className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold dark:text-white">
              {formatNumber(stats.total)}
            </span>
          </div>
          <p className="text-sm text-gray-500">Tổng người dùng</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {formatNumber(stats.active)}
            </span>
          </div>
          <p className="text-sm text-gray-500">Đang hoạt động</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
              <Ban className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-red-600">
              {formatNumber(stats.banned)}
            </span>
          </div>
          <p className="text-sm text-gray-500">Bị khóa</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {formatNumber(stats.totalTrips)}
            </span>
          </div>
          <p className="text-sm text-gray-500">Lượt đặt vé</p>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, email, sđt..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Filter className="w-5 h-5" /> Lọc
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t dark:border-gray-700">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2 rounded-lg border bg-gray-50 dark:bg-gray-900"
              >
                <option value="all">Tất cả vai trò</option>
                <option value={UserRole.USER}>Người dùng</option>
                <option value={UserRole.COMPANY_ADMIN}>Quản trị nhà xe</option>
                <option value={UserRole.ADMIN}>Super Admin</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 rounded-lg border bg-gray-50 dark:bg-gray-900"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="banned">Bị khóa</option>
              </select>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterRole("all");
                  setFilterStatus("all");
                }}
                className="flex items-center gap-1 text-red-500 hover:bg-red-50 p-2 rounded-lg"
              >
                <X className="w-4 h-4" /> Xóa lọc
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4">Chuyến</th>
                <th className="px-6 py-4">Đã chi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Không tìm thấy người dùng
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <Mail className="inline w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                      <div className="mt-1">
                        <Phone className="inline w-3 h-3 mr-1" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.roles)}`}
                      >
                        {getRoleLabel(user.roles)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.totalTrips}
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-white">
                      {formatCurrency(user.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${user.isBanned ? "bg-red-500" : "bg-green-500"}`}
                        />
                        <span className="text-sm dark:text-white">
                          {user.isBanned ? "Bị khóa" : "Hoạt động"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleBanStatus({
                            userId: user.id,
                            isBanned: !user.isBanned,
                          })
                        }
                        disabled={isMutating}
                        className={`p-2 rounded-lg transition-colors ${user.isBanned ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"} disabled:opacity-50`}
                      >
                        {user.isBanned ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Ban className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
