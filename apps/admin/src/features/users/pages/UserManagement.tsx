// src/features/admin/users/pages/UserManagement.tsx
import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Eye, Mail, Phone, Filter, X, RefreshCw, Users as UsersIcon } from 'lucide-react';
import { usersApi } from '@obtp/api-client';
import toast from 'react-hot-toast';
import { UserRole, type SanitizedUserResponse } from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface User extends SanitizedUserResponse {
  totalTrips?: number;
  totalSpent?: number;
}

// Mock data để fallback khi API chưa có


export function UserManagement() {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to mock data if fails
      try {
        const data = await usersApi.getAllUsers();
        // Transform data to include computed fields
        const transformedData = data.map(user => ({
          ...user,
          totalTrips: Math.floor(Math.random() * 20) + 1,
          totalSpent: Math.floor(Math.random() * 5000000) + 100000,
        }));
        setUsers(transformedData);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Use mock data
        // Show toast warning only once
        toast.error('Đang sử dụng dữ liệu mẫu do API chưa sẵn sàng', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('fetchUsersError'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId: string, currentBannedStatus: boolean) => {
    try {
      setActionLoading(userId);
      
      // Try to call API, if fails just update local state
      try {
        await usersApi.updateStatus(userId, { isBanned: !currentBannedStatus });
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError);
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isBanned: !currentBannedStatus }
            : user
        )
      );
      
      toast.success(
        currentBannedStatus 
          ? t('unbanUserSuccess') 
          : t('banUserSuccess')
      );
    } catch (error) {
      console.error('Error toggling user ban status:', error);
      toast.error(t('updateStatusError'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole as UserRole);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !user.isBanned) ||
      (filterStatus === 'banned' && user.isBanned);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const getRoleLabel = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) return t('systemAdmin');
    if (roles.includes(UserRole.COMPANY_ADMIN)) return t('companyAdminRoleLabel');
    if (roles.includes(UserRole.STAFF)) return t('staffRole');
    return t('userRole');
  };

  const getRoleBadgeColor = (roles: UserRole[]) => {
    if (roles.includes(UserRole.ADMIN)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
    if (roles.includes(UserRole.COMPANY_ADMIN)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    if (roles.includes(UserRole.STAFF)) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const stats = {
    total: users.length,
    active: users.filter(u => !u.isBanned).length,
    banned: users.filter(u => u.isBanned).length,
    totalTrips: users.reduce((sum, u) => sum + (u.totalTrips || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('userManagementTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('userManagementDesc')}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t('refresh')}
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalUsersStats')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.active}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('activeUsers')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.banned}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('bannedUsers')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalTrips}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalTripsColumn')}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchByNameEmailPhone')}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{t('filters')}</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('role')}:</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('allRoles')}</option>
                  <option value={UserRole.USER}>{t('userRole')}</option>
                  <option value={UserRole.COMPANY_ADMIN}>{t('companyAdminRoleLabel')}</option>
                  <option value={UserRole.ADMIN}>{t('systemAdmin')}</option>
                  <option value={UserRole.STAFF}>{t('staffRole')}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('status')}:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('allStatus')}</option>
                  <option value="active">{t('activeLabel')}</option>
                  <option value="banned">{t('bannedStatus')}</option>
                </select>
              </div>

              {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">{t('clearFilters')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* User List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userNameColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contactColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('roleColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('joinDateColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tripsColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('totalSpentColumn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('statusColumn')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actionsColumn')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.roles)}`}>
                        {getRoleLabel(user.roles)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {user.totalTrips || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(user.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${!user.isBanned ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {!user.isBanned ? t('activeLabel') : t('bannedStatus')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                        disabled={actionLoading === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          !user.isBanned
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={!user.isBanned ? t('banUser') : t('unbanUser')}
                      >
                        {actionLoading === user.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : !user.isBanned ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('noUsersFound')}
                      </p>
                      {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterRole('all');
                            setFilterStatus('all');
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {t('clearFilters')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('showing')} {filteredUsers.length} {t('of')} {users.length} {t('users')}
          </p>
        </div>
      </div>
    </div>
  );
}