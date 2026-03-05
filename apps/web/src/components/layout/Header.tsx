import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeProvider";

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
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const rawUser = localStorage.getItem("user");
  const user = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null;

  const isUser = user?.roles?.includes("user");

  const handleLogout = () => {
    localStorage.clear();
    setShowUserMenu(false);
    onLogout?.();
    toast.success("Đăng xuất thành công!", {
      duration: 2000,
      position: "top-center",
      icon: "👋",
    });
    navigate("/");
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* LOGO  */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-3"
          >
            <Bus className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Online Bus Ticket Platform
            </span>
          </button>

          {/* NAV */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => navigate("/")}>{t("home")}</button>
            <button onClick={() => navigate("/ticket-lookup")}>
              {t("ticketLookup")}
            </button>
            <button onClick={() => navigate("/contact")}>{t("contact")}</button>
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
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
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
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-xl"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border overflow-hidden">
                    <div className="p-4 border-b bg-linear-to-r from-blue-600/10 to-teal-500/10">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>

                    <div className="py-2">
                      {isUser && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate("/my-trips");
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          <Ticket className="w-5 h-5 text-blue-600" />
                          <span>{t("myTrips")}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/profile");
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <UserCircle className="w-5 h-5 text-blue-600" />
                        <span>{t("profile")}</span>
                      </button>

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
