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
  { label: "Quản lý Đội xe", path: "/vehicles", icon: Bus },
  { label: "Lịch trình", path: "/trips", icon: Map },
  { label: "Đặt vé", path: "/bookings", icon: Ticket },
  { label: "Cấu hình", path: "/settings", icon: Settings },
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
      {/* Lớp nền tối mờ dành cho Mobile khi bật menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar chính */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight text-blue-400">
            OBTP Admin
          </span>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Nút đăng xuất */}
        <div className="shrink-0 p-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Lớp nền mờ click ngoài đóng */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>

          {/* Box chứa thông báo */}
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <LogOut className="h-6 w-6" />
              <h3 className="text-xl font-bold text-gray-900">
                Xác nhận đăng xuất
              </h3>
            </div>

            <p className="text-gray-600 mb-6 mt-2">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị nhà xe?
              Phiên làm việc của bạn sẽ kết thúc.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-24 text-gray-600 border-gray-300"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmLogout}
                className="min-w-28"
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
