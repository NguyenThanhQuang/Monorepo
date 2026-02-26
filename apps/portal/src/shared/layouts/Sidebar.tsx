import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

/**
 * Định nghĩa danh sách menu.
 * Phần 'labelKey' sẽ khớp với các khóa (keys) trong file i18n.ts
 */
const NAV_ITEMS = [
  { labelKey: "sidebar.dashboard", path: "/dashboard", icon: LayoutDashboard },
  { labelKey: "sidebar.vehicles", path: "/vehicles", icon: Bus },
  { labelKey: "sidebar.trips", path: "/trips", icon: Map },
  { labelKey: "sidebar.bookings", path: "/bookings", icon: Ticket },
  { labelKey: "sidebar.settings", path: "/settings", icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      {/* 1. Mobile Overlay: Lớp nền mờ khi mở menu trên điện thoại */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* 2. Sidebar Main Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header: Logo & Nút đóng (Mobile) */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight text-blue-400">
            OBTP Admin
          </span>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation: Danh sách menu động */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {/* Dịch nhãn menu dựa trên key */}
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Footer: Nút Đăng xuất */}
        <div className="shrink-0 p-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {t("sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* 3. Chuyên nghiệp hóa: Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <LogOut className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {t("sidebar.logout")}?
              </h3>
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">
              {t(
                "common.logout_confirm_msg",
                "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?",
              )}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmLogout}
                className="flex-1 shadow-lg shadow-red-200"
              >
                {t("sidebar.logout")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
