import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/app/providers";

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const authUserString = localStorage.getItem("authUser");
  const user = authUserString ? JSON.parse(authUserString) : null;

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      path: "/company/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { path: "/company/vehicles", name: "Quản lý xe", icon: <Bus size={20} /> },
    { path: "/company/trips", name: "Chuyến đi", icon: <Calendar size={20} /> },
    { path: "/company/drivers", name: "Tài xế", icon: <Users size={20} /> },
    {
      path: "/company/settings",
      name: "Cài đặt",
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="obtp-shell">
      {mobileSidebarOpen && (
        <div
          className="obtp-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`obtp-sidebar ${!sidebarOpen ? "obtp-collapsed" : ""} ${mobileSidebarOpen ? "obtp-mobile-open" : ""}`}
      >
        <div className="obtp-sidebar-header">
          <div className="obtp-brand">
            <span className="obtp-brand-gradient">OBTP Portal</span>
          </div>

          <button
            className="obtp-icon-btn hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight
              size={18}
              style={{
                transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          <button
            className="obtp-icon-btn md:hidden ml-2"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="obtp-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`obtp-nav-item ${isActive(item.path) ? "obtp-active" : ""}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {sidebarOpen && (
                <span className="obtp-nav-text">{item.name}</span>
              )}
            </Link>
          ))}

          <button onClick={toggleTheme} className="obtp-nav-item mt-2">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            {sidebarOpen && (
              <span className="obtp-nav-text">
                {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
              </span>
            )}
          </button>
        </nav>

        <div className="obtp-sidebar-bottom">
          <div className="obtp-user">
            <div className="obtp-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="obtp-user-meta">
                <div className="obtp-user-name truncate">
                  {user?.name || "Admin"}
                </div>
                <div className="obtp-user-email truncate">
                  {user?.email || ""}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="obtp-danger-link w-full text-left"
            title="Đăng xuất"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="font-bold">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`obtp-main ${!sidebarOpen ? "obtp-collapsed" : ""}`}>
        <div className="obtp-mobile-topbar md:hidden">
          <button
            className="obtp-icon-btn"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="obtp-brand ml-2">
            <span className="obtp-brand-gradient">OBTP</span>
          </div>
        </div>

        <div className="obtp-content p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
