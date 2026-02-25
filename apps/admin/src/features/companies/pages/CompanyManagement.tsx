// src/features/companies/pages/CompanyManagement.tsx
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Ban, 
  CheckCircle, 
  Eye, 
  X,
  Clock,
  Building2,
  Users,
  Bus,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { companiesApi } from '@obtp/api-client';
import type { CompanyStatsResponse, CreateCompanyPayload, UpdateCompanyPayload } from '@obtp/shared-types';
import { CompanyStatus } from '@obtp/shared-types';
import toast from 'react-hot-toast';
import { CreateCompanyModal } from '../components/CreateCompanyModal';
import { EditCompanyModal } from '../components/EditCompanyModal';
import { CompanyDetailModal } from '../components/CompanyDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ConfirmActionModal } from '../components/ConfirmActionModal';

export function CompanyManagement() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<CompanyStatsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyStatsResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.getAllWithStats();
      setCompanies(response);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.response?.data?.message || t('errorFetchingCompanies'));
      toast.error(t('errorFetchingCompanies'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (data: CreateCompanyPayload) => {
    try {
      setActionLoading(true);
      const response = await companiesApi.create(data);
      if (response) {
        const newCompany: CompanyStatsResponse = {
          ...response,
          totalTrips: 0,
          totalRevenue: 0,
          averageRating: null
        };
        setCompanies(prev => [...prev, newCompany]);
        toast.success(t('successCreateCompany'));
      }
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Error creating company:', err);
      toast.error(err.response?.data?.message || t('errorCreateCompany'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCompany = async (id: string, data: UpdateCompanyPayload) => {
    try {
      setActionLoading(true);
      const response = await companiesApi.update(id, data);
      if (response) {
        setCompanies(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              ...response,
              totalTrips: c.totalTrips,
              totalRevenue: c.totalRevenue,
              averageRating: c.averageRating
            };
          }
          return c;
        }));
        toast.success(t('successUpdateCompany'));
      }
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Error updating company:', err);
      toast.error(err.response?.data?.message || t('errorUpdateCompany'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      setActionLoading(true);
      await companiesApi.update(selectedCompany.id, { status: CompanyStatus.SUSPENDED });
      setCompanies(prev => prev.map(c => 
        c.id === selectedCompany.id ? { ...c, status: CompanyStatus.SUSPENDED } : c
      ));
      setShowSuspendModal(false);
      toast.success(t('successSuspendCompany'));
    } catch (err: any) {
      console.error('Error suspending company:', err);
      toast.error(err.response?.data?.message || t('errorSuspendCompany'));
    } finally {
      setActionLoading(false);
      setSelectedCompany(null);
    }
  };

  const handleActivateCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      setActionLoading(true);
      await companiesApi.update(selectedCompany.id, { status: CompanyStatus.ACTIVE });
      setCompanies(prev => prev.map(c => 
        c.id === selectedCompany.id ? { ...c, status: CompanyStatus.ACTIVE } : c
      ));
      setShowActivateModal(false);
      toast.success(t('successActivateCompany'));
    } catch (err: any) {
      console.error('Error activating company:', err);
      toast.error(err.response?.data?.message || t('errorActivateCompany'));
    } finally {
      setActionLoading(false);
      setSelectedCompany(null);
    }
  };

  const statusConfig = {
    [CompanyStatus.ACTIVE]: { 
      label: t('companyStatusActive'), 
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      icon: CheckCircle 
    },
    [CompanyStatus.PENDING]: { 
      label: t('companyStatusPending'), 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: Clock 
    },
    [CompanyStatus.SUSPENDED]: { 
      label: t('companyStatusSuspended'), 
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: Ban 
    },
    [CompanyStatus.INACTIVE]: { 
      label: t('companyStatusInactive'), 
      color: 'bg-gray-500',
      textColor: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      icon: X 
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    if (!amount) return '0₫';
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} ${t('billion')}`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} ${t('million')}`;
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(t('locale') === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStats = () => {
    const totalVehicles = companies.reduce((sum, c) => {
      return sum + (c.totalTrips ? Math.ceil(c.totalTrips / 10) : 0);
    }, 0);

    const totalRevenue = companies.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

    return {
      total: companies.length,
      active: companies.filter(c => c.status === CompanyStatus.ACTIVE).length,
      pending: companies.filter(c => c.status === CompanyStatus.PENDING).length,
      suspended: companies.filter(c => c.status === CompanyStatus.SUSPENDED).length,
      totalVehicles,
      totalRevenue
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchCompanies}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('retry')}</span>
        </button>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {t('companyManagement')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('companyManagementDesc')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCompany')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('totalCompanies')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('activeCompanies')}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('pendingCompanies')}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('totalRevenue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCompanies')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            >
              <option value="all">{t('allStatus')}</option>
              <option value={CompanyStatus.ACTIVE}>{t('companyStatusActive')}</option>
              <option value={CompanyStatus.PENDING}>{t('companyStatusPending')}</option>
              <option value={CompanyStatus.SUSPENDED}>{t('companyStatusSuspended')}</option>
              <option value={CompanyStatus.INACTIVE}>{t('companyStatusInactive')}</option>
            </select>
          </div>
          <button
            onClick={fetchCompanies}
            className="p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title={t('refresh')}
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('company')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('contact')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('address')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('stats')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('revenue')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('rating')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('joinDate')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => {
                  const statusInfo = statusConfig[company.status] || statusConfig[CompanyStatus.INACTIVE];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {company.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('code')}: {company.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{company.email || '-'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">{company.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2 max-w-xs">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {company.address || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Bus className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {company.totalTrips || 0} {t('trips')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              -
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(company.totalRevenue || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {company.averageRating ? company.averageRating.toFixed(1) : '5.0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                          <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(company.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowDetailModal(true);
                            }}
                            className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 transition-colors"
                            title={t('viewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowEditModal(true);
                            }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {company.status === CompanyStatus.ACTIVE ? (
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowSuspendModal(true);
                              }}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                              title={t('suspend')}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : company.status === CompanyStatus.SUSPENDED && (
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowActivateModal(true);
                              }}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 transition-colors"
                              title={t('activate')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        {t('noCompaniesFound')}
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {t('addCompany')}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        {filteredCompanies.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('showing')} <span className="font-medium">{filteredCompanies.length}</span> {t('of')}{' '}
              <span className="font-medium">{companies.length}</span> {t('companies')}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCompanyModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleCreateCompany}
        loading={actionLoading}
      />

      {selectedCompany && (
        <>
          <EditCompanyModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCompany(null);
            }}
            onSubmit={(data: UpdateCompanyPayload) => handleUpdateCompany(selectedCompany.id, data)}
            company={selectedCompany}
            loading={actionLoading}
          />

          <CompanyDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCompany(null);
            }}
            company={selectedCompany}
          />
// Trong CompanyManagement.tsx, sửa phần ConfirmActionModal

<ConfirmActionModal
  isOpen={showSuspendModal}
  onClose={() => {
    setShowSuspendModal(false);
    setSelectedCompany(null);
  }}
  onConfirm={handleSuspendCompany}
  title={t('confirmSuspend')}
  message={t('confirmSuspendMessage').replace('{companyName}', selectedCompany.name)}
  confirmText={t('suspend')}
  cancelText={t('cancel')}
  type="danger"
  loading={actionLoading}
/>

<ConfirmActionModal
  isOpen={showActivateModal}
  onClose={() => {
    setShowActivateModal(false);
    setSelectedCompany(null);
  }}
  onConfirm={handleActivateCompany}
  title={t('confirmActivate')}
  message={t('confirmActivateMessage').replace('{companyName}', selectedCompany.name)}
  confirmText={t('activate')}
  cancelText={t('cancel')}
  type="success"
  loading={actionLoading}
/>
        </>
      )}
    </div>
  );
}