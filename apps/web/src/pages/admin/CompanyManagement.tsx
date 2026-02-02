import { useEffect, useState } from 'react';
import {

  Ban,
  CheckCircle,
  Eye,
  X,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { mapCompanyStatsToUI } from '../../contexts/mappers/company.mapper';
import { companyApi } from '../../api/service/company.api.ts/company.api';
import type { CompanyStatus, CompanyUI } from '@obtp/shared-types';

export function CompanyManagement() {
  const { t } = useLanguage();

  const [companies, setCompanies] = useState<CompanyUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyUI | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setLoading(true);
    try {
      const data = await companyApi.getAllWithStats();
      setCompanies(data.map(mapCompanyStatsToUI));
    } finally {
      setLoading(false);
    }
  }

const statusConfig: Record<
  CompanyStatus,
  { label: string; color: string; icon: any }
> = {
  active: {
    label: t('activeLabel'),
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  inactive: {
    label: t('inactiveLabel'),
    color: 'bg-gray-400',
    icon: Clock,
  },
  pending: {
    label: t('pendingLabel'),
    color: 'bg-yellow-500',
    icon: Clock,
  },
  suspended: {
    label: t('suspendedLabel'),
    color: 'bg-red-500',
    icon: Ban,
  },
};


  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) =>
    (price / 1_000_000_000).toFixed(1) + 'B';

  async function handleStatusChange(
    id: string,
    status: 'active' | 'suspended'
  ) {
    await companyApi.updateStatus(id, status);
    loadCompanies();
  }

  return (
    <div className="p-6">
      <h2 className="mb-6">{t('companyManagementTitle')}</h2>

      {loading && <div>Loading...</div>}

      <table className="w-full bg-white dark:bg-gray-800 rounded-xl">
        <thead>
          <tr>
            <th>{t('companyColumn')}</th>
            <th>{t('tripsColumn')}</th>
            <th>{t('revenueColumn')}</th>
            <th>{t('ratingColumn')}</th>
            <th>{t('statusColumn')}</th>
            <th>{t('actionsColumn')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredCompanies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.trips}</td>
              <td>{formatPrice(c.revenue)}</td>
              <td>{c.rating}</td>
              <td>{statusConfig[c.status].label}</td>
              <td className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCompany(c);
                    setShowDetailModal(true);
                  }}
                >
                  <Eye size={16} />
                </button>

                {c.status === 'active' ? (
                  <button
                    onClick={() =>
                      handleStatusChange(c.id, 'suspended')
                    }
                  >
                    <Ban size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleStatusChange(c.id, 'active')
                    }
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDetailModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <div className="flex justify-between">
              <h3>{selectedCompany.name}</h3>
              <button onClick={() => setShowDetailModal(false)}>
                <X />
              </button>
            </div>

            <p>{selectedCompany.email}</p>
            <p>{selectedCompany.phone}</p>
            <p>{selectedCompany.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
