import React from "react";
import { X, Building2, Calendar, DollarSign, PieChart, Info } from "lucide-react";
import { formatCurrency, formatNumber, calculatePlatformCommission, calculateCompanyNetRevenue } from "@obtp/business-logic";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CompanyRevenueStats } from "@obtp/shared-types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: CompanyRevenueStats | null;
}

export const CompanyRevenueDetailModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const { t } = useLanguage();
  if (!isOpen || !data) return null;

  const commission = calculatePlatformCommission(data.totalRevenue);
  const netRevenue = calculateCompanyNetRevenue(data.totalRevenue);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {data.companyName}
              </h3>
              <p className="text-xs font-mono text-gray-400">ID: {data.companyId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                <DollarSign size={14} /> Tổng doanh thu (Gross)
              </p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(data.totalRevenue)}
              </h4>
            </div>

            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs font-bold text-blue-500 uppercase mb-2 flex items-center gap-2">
                <PieChart size={14} /> Hoa hồng hệ thống (10%)
              </p>
              <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(commission)}
              </h4>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-4">
            <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">Chi tiết thanh toán</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <DollarSign size={18} />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Nhà xe thực nhận</span>
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(netRevenue)}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    <Calendar size={18} />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Tổng số lượng vé</span>
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-white">{formatNumber(data.totalBookings)} vé</span>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="flex gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <Info className="text-orange-500 shrink-0" size={20} />
            <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
              Dữ liệu doanh thu được tính dựa trên các đơn hàng có trạng thái <b>Đã thanh toán (PAID)</b>. 
              Phí hệ thống 10% được tự động khấu trừ vào mỗi giao dịch thành công qua cổng thanh toán.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-transform active:scale-95">
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};