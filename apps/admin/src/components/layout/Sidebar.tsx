import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Building2, LogOut, UserCircle2 } from "lucide-react";

type AdminUser = { id?: string; name?: string; email?: string } | null;

function parseJwt(token: string | null): any | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function Sidebar() {
  const nav = useNavigate();

  const menu = [
    { label: "Doanh thu", path: "/admin/revenue", icon: BarChart3 },
    { label: "Nhà xe", path: "/admin/companies", icon: Building2 },
  ];

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminUser");
    nav("/login", { replace: true });
  };

  const token = localStorage.getItem("accessToken");
  const jwt = parseJwt(token);
  const storedUser: AdminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "null");
    } catch {
      return null;
    }
  })();

  const name = storedUser?.name || jwt?.name || jwt?.fullName || "Admin";
  const email = storedUser?.email || jwt?.email || jwt?.username || "";

  return (
    <aside className="w-64 h-screen bg-[#0F172A] text-white flex flex-col border-r border-white/10">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 font-semibold text-lg">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <UserCircle2 size={18} />
        </span>
        <span>Admin</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition ${
                  isActive ? "bg-blue-600" : "hover:bg-white/10 text-white/90"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Account + Logout */}
      <div className="px-4 pb-5 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5">
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            {String(name || "A").trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{name}</div>
            <div className="text-xs text-white/60 truncate">{email || "Tài khoản quản trị"}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-3 flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
