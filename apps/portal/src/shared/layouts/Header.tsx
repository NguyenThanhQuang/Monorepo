import { Menu, Bell, User } from "lucide-react";
import { useAuthStore } from "../../core/auth/auth-store";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Menu Button dành riêng cho màn hình Mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Open Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Một div rỗng dùng "flex-1" để đẩy các items bên dưới sang sát lề phải */}
      <div className="flex-1" />

      {/* Cụm chức năng (Thông báo + Profile) */}
      <div className="flex items-center gap-4">
        {/* Nút Chuông thông báo */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <Bell className="h-5 w-5" />
          {/* Dấu chấm đỏ giả lập có thông báo */}
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Dòng phân cách mỏng màu xám */}
        <div className="h-8 w-[1px] bg-slate-200" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || "Đang cập nhật"}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {user?.email || "admin@obtp"}
            </p>
          </div>

          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
            {user?.name ? (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
