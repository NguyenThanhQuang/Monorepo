import { useMemo, useState } from "react";
import {
  Plus,
  Edit2,
  Ban,
  CheckCircle,
  Eye,
  X,
  Clock,
  RefreshCw,
  AlertCircle,
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
import { ConfirmActionModal } from "../components/ConfirmActionModal";
import { useLanguage } from "@/contexts/LanguageContext";

export function CompanyManagement() {
  const { t } = useLanguage();

  const {
    data: companies = [],
    isLoading,
    error,
    refetch,
    isRefetching,
    createCompany,
    updateCompany,
    isMutating,
  } = useCompanies();

  // States bộ lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // States UI
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyStatsResponse | null>(null);

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
      id: selectedCompany.id,
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
    },
    [CompanyStatus.INACTIVE]: {
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
  }, [companies, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter((c) => c.status === CompanyStatus.ACTIVE).length,
      pending: companies.filter((c) => c.status === CompanyStatus.PENDING)
        .length,
      totalRevenue: companies.reduce(
        (sum, c) => sum + (c.totalRevenue || 0),
        0,
      ),
    };
  }, [companies]);

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
        <p className="text-gray-600 mb-4">Không thể tải danh sách nhà xe</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {t("companyManagement")}
          </h1>
          <p className="text-gray-500">{t("companyManagementDesc")}</p>
        </div>
        <button
          onClick={() => {
            setSelectedCompany(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-500 text-white rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addCompany")}</span>
        </button>
      </div>

      {/* Stats Cards (Giữ nguyên giao diện của bạn) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Tổng nhà xe</p>
          <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.totalRevenue, true)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Bộ lọc */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <input
            type="text"
            placeholder="Tìm theo tên, mã..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-xl"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-xl"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value={CompanyStatus.ACTIVE}>Hoạt động</option>
            <option value={CompanyStatus.SUSPENDED}>Tạm ngưng</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 border rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Nhà xe</th>
                <th className="px-6 py-4">Doanh thu</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCompanies.map((company) => {
                const statusInfo =
                  statusConfig[company.status] ||
                  statusConfig[CompanyStatus.INACTIVE];
                const StatusIcon = statusInfo.icon;
                return (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {formatCurrency(company.totalRevenue || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(company.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />{" "}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDetailModal(true);
                        }}
                        className="text-purple-600 p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {company.status === CompanyStatus.ACTIVE ? (
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowSuspendModal(true);
                          }}
                          className="text-red-600 p-2"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : company.status === CompanyStatus.SUSPENDED ? (
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowActivateModal(true);
                          }}
                          className="text-green-600 p-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddCompanyDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCompany(null);
        }}
        onSave={handleSave}
        companyToEdit={selectedCompany}
        loading={isMutating}
      />

      {selectedCompany && (
        <>
          <CompanyDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCompany(null);
            }}
            company={selectedCompany}
          />

          <ConfirmActionModal
            isOpen={showSuspendModal}
            onClose={() => {
              setShowSuspendModal(false);
              setSelectedCompany(null);
            }}
            onConfirm={() => handleToggleStatus(CompanyStatus.SUSPENDED)}
            title="Tạm ngưng nhà xe"
            message={`Tạm ngưng ${selectedCompany.name}?`}
            type="danger"
            loading={isMutating}
          />

          <ConfirmActionModal
            isOpen={showActivateModal}
            onClose={() => {
              setShowActivateModal(false);
              setSelectedCompany(null);
            }}
            onConfirm={() => handleToggleStatus(CompanyStatus.ACTIVE)}
            title="Kích hoạt nhà xe"
            message={`Kích hoạt lại ${selectedCompany.name}?`}
            type="success"
            loading={isMutating}
          />
        </>
      )}
    </div>
  );
}
