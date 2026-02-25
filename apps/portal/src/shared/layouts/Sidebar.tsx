import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  Map,
  Settings,
  LogOut,
  X,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "../../core/auth/auth-store";
import { cn } from "../utils/cn";
import { Button } from "../components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
  { label: "Đội xe & Nhân sự", path: "/vehicles", icon: Bus },
  { label: "Điều phối & Lịch", path: "/trips", icon: Map },
  { label: "Bán vé & Đối soát", path: "/bookings", icon: Ticket },
  { label: "Tùy chỉnh hệ thống", path: "/settings", icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const logout = useAuthStore((s) => s.logout);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      {/* ================================== */}
      {/* 1. LAYER ẢO CHỞ NGÀY NHUỐM BÓNG MỜ CHỈ ÁP DỤNG TRÊN PHONE & TABLET KHI BẤM MENU TỪ HAMBURGER.*/}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden", // Dấu nhẹm nó luôn nếu trên pc
        )}
        onClick={onClose} // Nếu thò tay click nền mù -> Hụp menu
        aria-hidden="true"
      />

      {/* ================================== */}
      {/* 2. CHÚ SIDEBAR "QUÂN ĐOÀN" NÈ! DÙ CỐ THẾ NÀO TA CŨNG PHẢI FLEXBOX ĐỂ KO CÃI LOGIC 
           Nếu Mobile -> Nó thành "tách mình bóc màng fixed vào góc trài ngả ra" 
           Còn nếu Destop -> "Cột đứng đàng hoàng kềm chiều rộng vững như non tĩnh". 
      */}
      <aside
        className={cn(
          /* Mấu chốt làm đẹp nề */
          "flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 text-slate-300",

          /* CHỈ TRONG MOBILE / CỬA SỔ NHỎ: Tôi trốn mình kiểu `Fixed`, đóng mở xấp qua viền theo props lg*/
          "fixed z-50 h-full w-64 top-0 left-0",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:static lg:h-screen lg:z-auto",
        )}
      >
        {/* LOGO GỐC SIDEBAR: BĂM GẬY CHE CHỐN CÁCH BIỆT MOBILE / LOGO PC */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
          {/* Biểu Tượng App Đơn*/}
          <div className="flex gap-2.5 items-center justify-center pointer-events-none select-none text-blue-500 font-extrabold text-2xl uppercase tracking-tighter">
            {/* Thổi miếng Gadian bóng chẻ Text... */}
            <span className="bg-gradient-to-tr from-sky-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-md">
              OBTP APP
            </span>
          </div>

          {/* Mobile-Dànhêng nút thoát lặn tắt Sidebar */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 -mr-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
          >
            <span className="sr-only">Thu nhỏ Menu Này</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* KHÔNG GIAN MAIN NENU LINKS CỦA CHÚNG TA (Cắt Khỏi Logo và Bottom/Ngang Chót). Cho overflow cuộn đỡ rộp rớt màn hình bé xíu. */}
        <nav className="flex-1 overflow-y-auto space-y-1 p-4 select-none">
          {/* Chặn Lái Header Xoay */}
          <h2 className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-4 mt-2 px-3 opacity-80 pointer-events-none">
            Hành Tích Admin
          </h2>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              // React Router Auto pass qua Nav Link props. Ta mix vào biến "Active/is-thường".  Lưu y có chênh nhẹm do Icon...
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 px-3 py-2.5 my-1 rounded-xl text-sm font-semibold transition-all shadow-none relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/95 to-indigo-600/90 text-white !shadow-lg shadow-blue-900/20" // Menu đc Bôi Tượng / Sang trọng / Bóng đàng..
                    : "hover:bg-slate-800 hover:text-slate-50", // Hoàn Mỹ bình tâm, không đánh mờ gắt quÁ.
                )
              }
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  "text-blue-200 group-hover:scale-105 transition-transform duration-200",
                )}
              />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* THE FINAL STACK LOG-OUT FOOTER THÁNG LÃI TAI*/}
        <div className="shrink-0 border-t border-slate-800/60 p-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400/90 transition-all hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none"
          >
            <LogOut className="h-[18px] w-[18px]" /> Trôi Thoát / Xóa Dấu Phiên
            ĐK
          </button>
        </div>
      </aside>

      {/* --- CỤM CONFIRM (Khôn) TỘC GIÚP - THÒ LÒ ĐẠO 1 ---*/}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setShowLogoutConfirm(false)}
          />

          <div className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-100">
            <div className="flex gap-4 sm:flex-row flex-col">
              {/* Ẻm Đồ Icoon Khè  ...*/}
              <div className="h-10 w-10 shrink-0 bg-rose-100 flex items-center justify-center rounded-full mx-auto sm:mx-0">
                <LogOut className="text-rose-500 h-5 w-5" strokeWidth={2.5} />
              </div>

              <div className="flex-1 mt-0.5 text-center sm:text-left">
                <h4 className="text-lg font-bold text-slate-800 mb-1">
                  Kết Thúc & Hủy Quyền App
                </h4>
                <p className="text-sm text-slate-500 leading-snug">
                  Lịch Sử Session Auth Mới, Mã Key Và Cookie của Hệ App Local -
                  Tất cả Đều Đi Ngủ? Xác Khí / Quay Cấp Ghi Ra?
                </p>
              </div>
            </div>

            {/* Phanh GẤP Buttons Tái... */}
            <div className="flex mt-6 gap-2 sm:gap-3 w-full items-center">
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full h-11 text-sm bg-white hover:bg-slate-50 text-slate-700 shadow-none border border-slate-200 focus-visible:ring-slate-300"
              >
                Nhẩm Quay Điểm Mơ
              </Button>
              <Button
                onClick={handleConfirmLogout}
                className="w-full h-11 text-sm bg-rose-500 hover:bg-rose-600 shadow shadow-rose-500/30 focus-visible:ring-rose-500 font-bold border-0 text-white transition-transform active:scale-95"
              >
                Xoá Tan Thoát
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
