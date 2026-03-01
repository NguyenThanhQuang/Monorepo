import { useState, useMemo } from "react";
import { Trash2, Link2, Moon, Sun, Monitor, UserCog } from "lucide-react";
import { useTheme } from "@/app/providers";
import { useCompanySettings } from "../api/useCompanySettings";
import { CompanyProfileForm } from "../components/CompanyProfileForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "profile" | "system";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [cleared, setCleared] = useState(false);

  const { company, isLoading } = useCompanySettings();

  const apiBase = useMemo(() => {
    const env = (import.meta as any).env || {};
    return env.VITE_API_BASE_URL || env.VITE_API_URL || "Chưa cấu hình .env";
  }, []);

  const clearTokens = () => {
    localStorage.clear();
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Cài đặt
        </h1>
        <p className="text-slate-500">
          Quản lý hồ sơ nhà xe và cấu hình hệ thống
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
          )}
        >
          <UserCog size={18} />
          Hồ sơ Nhà xe
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "system"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
          )}
        >
          <Monitor size={18} />
          Hệ thống & Debug
        </button>
      </div>

      {/* Content Area */}
      <div className="py-4">
        {activeTab === "profile" &&
          (isLoading ? (
            <div className="p-12 text-center text-slate-500">
              Đang tải thông tin nhà xe...
            </div>
          ) : company ? (
            <CompanyProfileForm company={company} />
          ) : (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
              Không thể tải thông tin nhà xe. Vui lòng thử lại sau.
            </div>
          ))}

        {activeTab === "system" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Theme Card */}
            <div className="obtp-card obtp-card-strong p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div>
                  <div className="font-bold">Giao diện</div>
                  <div className="text-xs text-slate-500">
                    Hiện tại:{" "}
                    {theme === "light"
                      ? "Sáng"
                      : theme === "dark"
                        ? "Tối"
                        : "Hệ thống"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={
                    theme === "light" ? "border-blue-500 bg-blue-50" : ""
                  }
                >
                  Sáng
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={
                    theme === "dark" ? "border-blue-500 bg-blue-50/10" : ""
                  }
                >
                  Tối
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("system")}
                  className={
                    theme === "system" ? "border-blue-500 bg-blue-50" : ""
                  }
                >
                  Auto
                </Button>
              </div>
            </div>

            {/* API Info Card */}
            <div className="obtp-card obtp-card-strong p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Link2 size={20} />
                </div>
                <div>
                  <div className="font-bold">API Connection</div>
                  <div className="text-xs text-slate-500">
                    Endpoint cấu hình
                  </div>
                </div>
              </div>
              <code className="block bg-slate-100 dark:bg-slate-950 p-2 rounded text-xs font-mono mb-2 break-all border border-slate-200 dark:border-slate-800">
                {apiBase}
              </code>
            </div>

            {/* Danger Zone */}
            <div className="obtp-card obtp-card-strong p-6 border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-red-600">Dọn dẹp Cache</div>
                  <div className="text-xs text-slate-500">
                    Xóa token và đăng xuất
                  </div>
                </div>
              </div>
              <Button variant="danger" className="w-full" onClick={clearTokens}>
                {cleared ? "Đang xử lý..." : "Xóa Token & Reload"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
