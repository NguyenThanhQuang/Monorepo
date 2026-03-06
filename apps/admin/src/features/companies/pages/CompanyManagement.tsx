import { useMemo, useState } from "react";
import {
  Plus,
  Ban,
  CheckCircle,
  Eye,
  X,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  CompanyStatus,
  type CompanyStatsResponse,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from "@obtp/shared-types";
import { formatCurrency, formatDate } from "@obtp/business-logic";
import { useCompanies } from "../hooks/useCompanies";
import { AddCompanyDialog } from "../components/AddCompanyDialog";
import { CompanyDetailModal } from "../components/CompanyDetailModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";

export function CompanyManagement() {
  const { t } = useLanguage();

  const {
    data: companies =[],
    isLoading,
    error,
    refetch,
    isRefetching,
    createCompany,
    updateCompany,
    isMutating,
  } = useCompanies();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const[showDetailModal, setShowDetailModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const[selectedCompany, setSelectedCompany] =
    useState<CompanyStatsResponse | null>(null);

  const[currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSave = async (
    data: CreateCompanyPayload | UpdateCompanyPayload,
    id?: string,
  ) => {
    if (id) {
      await updateCompany({ id, data: data as UpdateCompanyPayload });
    } else {
      await createCompany(data as CreateCompanyPayload);
    }
    setIsDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleToggleStatus = async (newStatus: CompanyStatus) => {
    if (!selectedCompany) return;

    await updateCompany({
      id: selectedCompany.id || (selectedCompany as any)._id,
      data: { status: newStatus },
    });

    setShowSuspendModal(false);
    setShowActivateModal(false);
    setSelectedCompany(null);
  };

  const statusConfig = {
    [CompanyStatus.ACTIVE]: {
      label: t("companyStatusActive"),
      textColor: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      icon: CheckCircle,
    },
    [CompanyStatus.PENDING]: {
      label: t("companyStatusPending"),
      textColor: "text-yellow-700 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      icon: Clock,
    },
    [CompanyStatus.SUSPENDED]: {
      label: t("companyStatusSuspended"),
      textColor: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      icon: Ban,
    },[CompanyStatus.INACTIVE]: {
      label: t("companyStatusInactive"),
      textColor: "text-gray-700 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/30",
      icon: X,
    },
  };

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return companies.filter((c) => {
      const name = (c.name ?? "").toLowerCase();
      const code = (c.code ?? "").toLowerCase();
      const matchesSearch = !q || name.includes(q) || code.includes(q);
      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  },[companies, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  },[filteredCompanies, currentPage]);

  const stats = useMemo(() => ({
    total: companies.length,
    active: companies.filter((c) => c.status === CompanyStatus.ACTIVE).length,
    pending: companies.filter((c) => c.status === CompanyStatus.PENDING).length,
  }), [companies]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <p className="text-gray-600 mb-4">{t("errorFetchingCompanies")}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-purple-600 text-white rounded-xl">{t("retry")}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t("companyManagement")}</h1>
          <p className="text-gray-500">{t("companyManagementDesc")}</p>
        </div>
        <button
          onClick={() => { setSelectedCompany(null); setIsDialogOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:opacity-90 transition font-bold shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addCompany")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">{t("totalCompanies")}</p>
          <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">{t("activeCompanies")}</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500">{t("pendingCompanies")}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b dark:border-gray-700 flex gap-4">
          <input
            type="text"
            placeholder={t("searchCompanies")}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">{t("allStatus")}</option>
            <option value={CompanyStatus.ACTIVE}>{t("companyStatusActive")}</option>
            <option value={CompanyStatus.SUSPENDED}>{t("companyStatusSuspended")}</option>
          </select>
          <button onClick={() => refetch()} className="p-2 border dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">{t("company")}</th>
                <th className="px-6 py-4 font-bold text-right">{t("revenue")}</th>
                <th className="px-6 py-4 font-bold text-center">{t("createdAt")}</th>
                <th className="px-6 py-4 font-bold text-center">{t("status")}</th>
                <th className="px-6 py-4 font-bold text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {paginatedCompanies.map((company) => {
                const statusInfo = statusConfig[company.status] || statusConfig[CompanyStatus.INACTIVE];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={company.id || (company as any)._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{company.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{company.code}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600 text-right">
                      {formatCurrency(company.totalRevenue || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {formatDate(company.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => { setSelectedCompany(company); setShowDetailModal(true); }}
                        className="text-purple-600 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title={t("viewDetails")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {company.status === CompanyStatus.ACTIVE && (
                        <button
                          onClick={() => { setSelectedCompany(company); setShowSuspendModal(true); }}
                          className="text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t("suspend")}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {company.status === CompanyStatus.SUSPENDED && (
                        <button
                          onClick={() => { setSelectedCompany(company); setShowActivateModal(true); }}
                          className="text-green-600 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title={t("activate")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    {t("noCompaniesFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredCompanies.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("page")} {currentPage} {t("of")} {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmActionModal
        isOpen={showSuspendModal}
        onClose={() => { setShowSuspendModal(false); setSelectedCompany(null); }}
        onConfirm={() => handleToggleStatus(CompanyStatus.SUSPENDED)}
        title={t("suspendCompanyTitle")}
        message={`${t("suspendWarning")} ${selectedCompany?.name}?`}
        type="danger"
        loading={isMutating}
        countdownSeconds={10} // Bắt buộc đợi 10 giây mới được cấm
      />

      <ConfirmActionModal
        isOpen={showActivateModal}
        onClose={() => { setShowActivateModal(false); setSelectedCompany(null); }}
        onConfirm={() => handleToggleStatus(CompanyStatus.ACTIVE)}
        title={t("activateCompanyTitle")}
        message={`${t("activateWarning")} ${selectedCompany?.name}?`}
        type="success"
        loading={isMutating}
      />

      <CompanyDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} company={selectedCompany!} />
      
      <AddCompanyDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={async (d) => { await createCompany(d as any); setIsDialogOpen(false); }} 
        loading={isMutating} 
      />
    </div>
  );
}