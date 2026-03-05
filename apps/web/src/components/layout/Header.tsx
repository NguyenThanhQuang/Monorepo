import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bus,
  User,
  Globe,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Ticket,
  UserCircle,
  Phone,
  Shield,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeProvider";

type SafeUser = {
  name: string;
  email: string;
  roles: string[];
};

function getSafeUser(): SafeUser | null {
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface HeaderProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onHotlineClick?: () => void;
}

export function Header({
  isLoggedIn = false,
  onLoginClick,
  onLogout,
  onHotlineClick,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = isLoggedIn ? getSafeUser() : null;

  const isUser = user?.roles?.includes("user");
  const isCompanyAdmin = user?.roles?.includes("company_admin");
  const isAdmin =
    user?.roles?.includes("admin") || user?.roles?.includes("system-admin");

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const handleCompanyAccess = () => {
    toast.error("Bạn không có quyền truy cập vào trang quản lý nhà xe", {
      duration: 3000,
      position: "top-center",
      icon: "🚫",
      style: {
        background: "#FEE2E2",
        color: "#991B1B",
        border: "1px solid #FCA5A5",
      },
    });
  };

  const handleAdminAccess = () => {
    toast.error("Bạn không có quyền truy cập vào trang quản trị hệ thống", {
      duration: 3000,
      position: "top-center",
      icon: "🚫",
      style: {
        background: "#FEE2E2",
        color: "#991B1B",
        border: "1px solid #FCA5A5",
      },
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    setShowUserMenu(false);
    onLogout?.();
    toast.success("Đăng xuất thành công!", {
      duration: 2000,
      position: "top-center",
      icon: "👋",
      style: { background: "#10B981", color: "#FFFFFF" },
    });
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3">
            <Bus className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Online Bus Ticket Platform
            </span>
          </Link>

          {/* NAV - CHUYỂN THÀNH LINK */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/">{t("home")}</Link>
            <Link to="/ticket-lookup">{t("ticketLookup")}</Link>
            <Link to="/contact">{t("contact")}</Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onHotlineClick}
              className="hidden md:flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t("hotline")}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              {theme === "light" ? <Moon /> : <Sun />}
            </button>

            {/* ================= AUTH ================= */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((p) => !p)}
                  className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-xl"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden">
                    {/* USER INFO */}
                    <div className="p-4 border-b bg-linear-to-r from-blue-600/10 to-teal-500/10">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {isUser && "👤 Khách hàng"}
                        {isCompanyAdmin && "🏢 Quản lý nhà xe"}
                        {isAdmin && "⚙️ Quản trị viên"}
                      </div>
                    </div>

                    <div className="py-2">
                      {isUser && (
                        <Link
                          to="/my-trips"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          <Ticket className="w-5 h-5 text-blue-600" />
                          <span>{t("myTrips")}</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <UserCircle className="w-5 h-5 text-blue-600" />
                        <span>{t("profile")}</span>
                      </Link>

                      {isCompanyAdmin && (
                        <>
                          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleCompanyAccess();
                            }}
                            disabled
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors text-gray-400 cursor-not-allowed"
                          >
                            <Building2 className="w-5 h-5" />
                            <span>Quản lý nhà xe (không khả dụng)</span>
                          </button>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleAdminAccess();
                            }}
                            disabled
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors text-gray-400 cursor-not-allowed"
                          >
                            <Shield className="w-5 h-5" />
                            <span>System Admin (không khả dụng)</span>
                          </button>
                        </>
                      )}

                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>{t("logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-linear-to-r from-blue-600 to-teal-500 text-white px-6 py-2 rounded-xl"
              >
                {t("login")}
              </button>
            )}

            <button className="lg:hidden p-2">
              <Menu />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
