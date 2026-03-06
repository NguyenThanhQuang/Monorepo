import { 
  RefreshCw, 
  Ticket, 
  Users, 
  Building2, 
  TrendingUp, 
  Star, 
  MessageSquare, 
  Activity, 
  Server, 
  Database, 
  Globe, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatNumber } from "@obtp/business-logic";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl text-center max-w-lg mx-auto mt-10 border border-red-100 dark:border-red-800/30 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
          {t("errorFetchingDashboard")}
        </h3>
        <p className="text-red-600/80 dark:text-red-300/80 text-sm mb-6">
          Vui lòng kiểm tra lại kết nối mạng.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  // Dữ liệu thật từ API
  const todayReviews = (stats as any).todayReviews || 0; 
  const topRatedToday = (stats as any).topRatedToday || 0;

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("dashboardTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {t("welcomeBack")}, <strong className="text-gray-700 dark:text-gray-200">{user?.name || t("admin")}</strong>!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:block bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg">
            {t("dashboardDataAutoRefresh")}
          </span>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-600 transition-all shadow-sm"
            title={t("refresh")}
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? "animate-spin text-purple-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ROW 1: MAIN STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center shadow-inner">
              <Ticket className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              {t("totalBookings")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {formatNumber(stats.totalBookings)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                +{formatNumber(stats.todayBookings)}
              </span>
              <span className="text-gray-400 dark:text-gray-500">{t("today")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center shadow-inner">
              <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              {t("systemCustomers")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {formatNumber(stats.totalUsers)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 flex items-center justify-center shadow-inner">
              <Building2 className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              {t("company")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {formatNumber(stats.totalCompanies)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <span className="text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-md">
                +{formatNumber(stats.newCompaniesToday)}
              </span>
              <span className="text-gray-400 dark:text-gray-500">{t("newToday")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="relative">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              {t("activeTrips")}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {formatNumber(stats.activeTrips)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <span className="text-gray-400 dark:text-gray-500 truncate">
                {t("runningOnRoad")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: FEEDBACK & HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column Left: Reviews */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-2 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm">
          
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                <Star className="w-7 h-7 text-yellow-300 fill-yellow-300 drop-shadow-md" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {t("today")}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-1">{t("topRatedToday")}</h3>
              <p className="text-white/80 text-sm mb-4 font-medium">{t("excellentServiceQuality")}</p>
              
              <div className="flex items-end gap-4">
                <p className="text-5xl font-black drop-shadow-lg leading-none">
                  {formatNumber(topRatedToday)}
                </p>
                <div className="pb-1">
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-300 text-yellow-300" />)}
                  </div>
                  <p className="text-xs text-white/90 font-medium">
                    {t("reviews")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center shadow-inner border border-gray-200 dark:border-gray-600">
                  <MessageSquare className="w-7 h-7 text-gray-700 dark:text-gray-300" />
               </div>
               <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
                    {t("customerFeedbackToday")}
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    {formatNumber(todayReviews)} <span className="text-lg text-gray-400 font-medium">{t("reviews")}</span>
                  </p>
               </div>
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("realFeedbackDesc")}
            </p>
          </div>
        </div>

        {/* Column Right: System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              {t("systemHealth")}
            </h3>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          <div className="space-y-5 flex-1">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-green-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:text-green-500 transition-colors">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">API Server</p>
                  <p className="text-xs text-gray-500">{t("serverStatusActive")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">Online</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-green-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:text-green-500 transition-colors">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Database</p>
                  <p className="text-xs text-gray-500">{t("dbStatusStable")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">Online</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-green-200 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:text-green-500 transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">PayOS Gateway</p>
                  <p className="text-xs text-gray-500">Webhook Active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{t("gatewayStatusReady")}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 3: QUICK ACTIONS */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 ml-2">
          {t("quickActions")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/companies')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-200 dark:hover:border-orange-800 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/40 rounded-xl text-orange-600 dark:text-orange-400">
                <Building2 size={20} />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {t("companyManagement")}
              </span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
          </button>

          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400">
                <Users size={20} />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {t("userManagement")}
              </span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-green-500 transition-transform group-hover:translate-x-1" />
          </button>

          <button 
            onClick={() => navigate('/admin/reviews')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
                <MessageSquare size={20} />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {t("reviewManagement")}
              </span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

    </div>
  );
}