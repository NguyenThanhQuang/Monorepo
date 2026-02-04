import {
  Bus,
  Route,
  Users,
  DollarSign,
  FileText,
  Download,
  PlusCircle,
} from 'lucide-react';
import { useCompanyDashboardLogic } from '../hooks/Logic/company-dashboard.logic';
import { useLanguage } from '../contexts/LanguageContext';
import type { Page } from '../App';
import { CompanyLayout } from '../components/layout/CompanyLayout';

interface Props {
  onNavigate: (page: Page) => void;
}

export function CompanyDashboard({ onNavigate }: Props) {
  const { t } = useLanguage();
  const {
    company,
    stats,
    recentTrips,
    showReportModal,
    setShowReportModal,
  } = useCompanyDashboardLogic();

  const statCards = [
    { label: 'Tổng số xe', value: stats.totalVehicles, icon: Bus },
    { label: 'Chuyến hôm nay', value: stats.todayTrips, icon: Route },
    {
      label: 'Doanh thu tháng',
      value: `${stats.monthlyRevenue.toLocaleString()}₫`,
      icon: DollarSign,
    },
  ];

  const handleAddTrip = () => {
    // Điều hướng đến trang tạo chuyến đi
    onNavigate('add-trip' as Page);
  };

  const handleViewTripDetail = (tripId: string) => {
    // Điều hướng đến trang chi tiết chuyến đi
    // Cần đảm bảo 'trip-detail' tồn tại trong type Page
    onNavigate('trip-detail' as Page);
    // Hoặc nếu bạn có cách xử lý khác:
    // window.location.href = `/company/trip-detail/${tripId}`;
  };

  const handleViewAllTrips = () => {
    onNavigate('trips-management' as Page);
  };

  const handleManageVehicles = () => {
    onNavigate('vehicles-management' as Page);
  };

  return (
    <CompanyLayout
      onNavigate={onNavigate}
      active="company-dashboard"
    >
      {/* ===== HEADER ===== */}
      <div className="px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Dashboard Nhà Xe
          </h1>
          <p className="text-gray-400">
            {company?.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Tạo chuyến đi */}
          <button
            onClick={handleAddTrip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition-colors"
          >
            <PlusCircle size={18} />
            Tạo chuyến đi
          </button>

          {/* Nút Báo cáo */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FileText size={18} />
            Báo cáo
          </button>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-[#0F172A] rounded-2xl p-6 hover:bg-[#1e293b] transition-colors"
            >
              <Icon className="mb-2 text-blue-500" />
              <div className="text-2xl font-semibold">
                {s.value}
              </div>
              <div className="text-gray-400 text-sm">
                {s.label}
              </div>
            </div>
          );
        })}
        
        {/* Thêm stat card cho tổng số chuyến */}
        <div className="bg-[#0F172A] rounded-2xl p-6 hover:bg-[#1e293b] transition-colors">
          <Users className="mb-2 text-green-500" />
          <div className="text-2xl font-semibold">
            {recentTrips.length}
          </div>
          <div className="text-gray-400 text-sm">
            Chuyến đang chạy
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="px-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Chuyến Đi Gần Đây
          </h3>
          <button 
            onClick={handleViewAllTrips}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="bg-[#0F172A] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 text-left text-sm">
              <tr>
                <th className="p-4">Tuyến</th>
                <th>Thời gian</th>
                <th>Xe</th>
                <th>Đã đặt</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map(trip => {
                // Lấy thông tin vehicle type - kiểm tra tồn tại
                const vehicleType = (trip.vehicle as any)?.type || 
                                   (trip as any).vehicleType || 
                                   'N/A';
                const vehicleNumber = trip.vehicle?.vehicleNumber || 'N/A';
                
                return (
                  <tr
                    key={trip.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium">
                        {(trip.route?.from?.name || 'N/A')} → {(trip.route?.to?.name || 'N/A')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {trip.price?.toLocaleString()}₫
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {trip.departureTime ? new Date(trip.departureTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {trip.departureTime ? new Date(trip.departureTime).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {vehicleNumber}
                      </div>
                      <div className="text-sm text-gray-400">
                        {vehicleType}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {trip.totalSeats && trip.availableSeatsCount !== undefined 
                          ? `${trip.totalSeats - trip.availableSeatsCount}/${trip.totalSeats}`
                          : 'N/A'}
                      </div>
                      {trip.totalSeats && trip.availableSeatsCount !== undefined && (
                        <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ 
                              width: `${((trip.totalSeats - trip.availableSeatsCount) / trip.totalSeats) * 100}%` 
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trip.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        trip.status === 'departed' ? 'bg-yellow-500/20 text-yellow-400' :
                        trip.status === 'arrived' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {trip.status === 'scheduled' ? 'Sắp chạy' :
                         trip.status === 'departed' ? 'Đang chạy' :
                         trip.status === 'arrived' ? 'Đã đến' :
                         'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewTripDetail(trip.id)}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {recentTrips.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Route className="mx-auto mb-4 text-gray-500" size={48} />
              <p>Chưa có chuyến đi nào</p>
              <button 
                onClick={handleAddTrip}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <PlusCircle className="inline mr-2" size={16} />
                Tạo chuyến đi đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="px-8 mt-8">
        <h3 className="mb-4 font-semibold text-lg">
          Hành động nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleAddTrip}
            className="bg-[#0F172A] p-6 rounded-2xl text-left hover:bg-[#1e293b] transition-colors group"
          >
            <PlusCircle className="mb-3 text-green-500 group-hover:text-green-400" size={24} />
            <h4 className="font-medium mb-1">Tạo chuyến đi mới</h4>
            <p className="text-sm text-gray-400">Thêm chuyến đi mới vào lịch trình</p>
          </button>
          
          <button 
            onClick={handleManageVehicles}
            className="bg-[#0F172A] p-6 rounded-2xl text-left hover:bg-[#1e293b] transition-colors group"
          >
            <Bus className="mb-3 text-blue-500 group-hover:text-blue-400" size={24} />
            <h4 className="font-medium mb-1">Quản lý xe</h4>
            <p className="text-sm text-gray-400">Xem và quản lý danh sách xe</p>
          </button>
          
          <button 
            onClick={() => setShowReportModal(true)}
            className="bg-[#0F172A] p-6 rounded-2xl text-left hover:bg-[#1e293b] transition-colors group"
          >
            <FileText className="mb-3 text-yellow-500 group-hover:text-yellow-400" size={24} />
            <h4 className="font-medium mb-1">Báo cáo doanh thu</h4>
            <p className="text-sm text-gray-400">Xuất báo cáo doanh thu chi tiết</p>
          </button>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showReportModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowReportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-[#0F172A] rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl mb-4">
                Xuất Báo Cáo
              </h3>
              
              <div className="space-y-3 mb-6">
                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="text-left">
                    <div className="font-medium">Báo cáo doanh thu</div>
                    <div className="text-sm text-gray-400">Xuất doanh thu theo tháng/quý</div>
                  </div>
                  <Download className="text-blue-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="text-left">
                    <div className="font-medium">Báo cáo chuyến đi</div>
                    <div className="text-sm text-gray-400">Thống kê chuyến đi đã chạy</div>
                  </div>
                  <Download className="text-blue-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="text-left">
                    <div className="font-medium">Báo cáo đặt vé</div>
                    <div className="text-sm text-gray-400">Thống kê vé đã bán</div>
                  </div>
                  <Download className="text-blue-400" />
                </button>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </CompanyLayout>
  );
}