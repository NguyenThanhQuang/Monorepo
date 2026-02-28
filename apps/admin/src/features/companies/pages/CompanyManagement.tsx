import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Ban,
  CheckCircle,
  Eye,
  Trash2,
  X,
  Clock,
} from "lucide-react";

import {
  CompanyStatus,
  type CompanyStatsResponse,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from "@obtp/shared-types";

import { useLanguage } from "../../../contexts/LanguageContext";
import { companiesApi } from "@obtp/api-client";
import { AddCompanyDialog } from "../components/AddCompanyDialog";

export function CompanyManagement() {
  const { t } = useLanguage();

  const [companies, setCompanies] = useState<CompanyStatsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<CompanyStatus | "all">("all");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyStatsResponse | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] =
    useState<CompanyStatsResponse | null>(null);

  // ================= FETCH =================
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await companiesApi.getAllWithStats();
      setCompanies(res);
    } catch {
      setError("Không thể tải danh sách nhà xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ================= FILTER =================
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [companies, filterStatus, searchQuery]);

  // ================= ACTIONS =================
  const handleSaveCompany = async (
    data: CreateCompanyPayload | UpdateCompanyPayload,
    id?: string
  ) => {
    try {
      setLoading(true);

      if (id) {
        await companiesApi.update(id, data as UpdateCompanyPayload);
      } else {
        await companiesApi.create(data as CreateCompanyPayload);
      }

      setDialogOpen(false);
      fetchCompanies();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhà xe này?")) return;

    try {
      await companiesApi.delete(id);
      fetchCompanies();
    } catch {
      alert("Xóa thất bại");
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: CompanyStatus
  ) => {
    try {
      await companiesApi.update(id, { status: newStatus });
      fetchCompanies();
    } catch {
      alert("Cập nhật trạng thái thất bại");
    }
  };

  const formatPrice = (price: number) => {
    return (price / 1_000_000_000).toFixed(1) + "B";
  };

  // ================= STATUS CONFIG =================
  const statusConfig: Record<
    CompanyStatus,
    { label: string; color: string; icon: any }
  > = {
    [CompanyStatus.ACTIVE]: {
      label: t("activeLabel"),
      color: "bg-green-500",
      icon: CheckCircle,
    },
    [CompanyStatus.INACTIVE]: {
      label: t("inactiveLabel"),
      color: "bg-gray-400",
      icon: Clock,
    },
    [CompanyStatus.PENDING]: {
      label: t("pendingLabel"),
      color: "bg-yellow-500",
      icon: Clock,
    },
    [CompanyStatus.SUSPENDED]: {
      label: t("suspendedLabel"),
      color: "bg-red-500",
      icon: Ban,
    },
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 dark:text-white">
          {t("companyManagementTitle")}
        </h2>

        <button
          onClick={() => {
            setCompanyToEdit(null);
            setDialogOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addCompany")}</span>
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchByNameEmail")}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value === "all"
                ? "all"
                : (e.target.value as CompanyStatus)
            )
          }
          className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value={CompanyStatus.ACTIVE}>
            {t("activeLabel")}
          </option>
          <option value={CompanyStatus.INACTIVE}>
            {t("inactiveLabel")}
          </option>
          <option value={CompanyStatus.PENDING}>
            {t("pendingLabel")}
          </option>
          <option value={CompanyStatus.SUSPENDED}>
            {t("suspendedLabel")}
          </option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Trips</th>
              <th className="p-4 text-left">Revenue</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCompanies.map((company) => {
              const statusInfo = statusConfig[company.status];

              return (
                <tr key={company._id} className="border-t">
                  <td className="p-4">{company.name}</td>
                  <td className="p-4">{company.email ?? "-"}</td>
                  <td className="p-4">{company.totalTrips}</td>
                  <td className="p-4">{formatPrice(company.totalRevenue)}</td>

                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                      {statusInfo.label}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setCompanyToEdit(company);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 size={18} />
                      </button>

                      {company.status === CompanyStatus.ACTIVE ? (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              company._id,
                              CompanyStatus.SUSPENDED
                            )
                          }
                        >
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              company._id,
                              CompanyStatus.ACTIVE
                            )
                          }
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(company._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DIALOG */}
      <AddCompanyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveCompany}
        companyToEdit={companyToEdit}
      />

      {/* DETAIL MODAL */}
      {showDetailModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[500px]">
            <div className="flex justify-between mb-4">
              <h3>{selectedCompany.name}</h3>
              <button onClick={() => setShowDetailModal(false)}>
                <X />
              </button>
            </div>

            <p>Email: {selectedCompany.email ?? "-"}</p>
            <p>Phone: {selectedCompany.phone ?? "-"}</p>
            <p>Address: {selectedCompany.address ?? "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}