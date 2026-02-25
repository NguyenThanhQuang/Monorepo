import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 1. Tự điển tiếng Việt
const viDict = {
  translation: {
    sidebar: {
      dashboard: "Tổng quan",
      vehicles: "Quản lý Đội xe",
      trips: "Lịch trình",
      bookings: "Đặt vé",
      settings: "Cấu hình",
      logout: "Đăng xuất",
    },
    common: {
      cancel: "Hủy",
      confirm: "Xác nhận",
      loading: "Đang tải...",
      // Biến (interpolation)
      welcome_back: "Chào mừng trở lại, {{name}}",
    },
    errors: {
      UNAUTHORIZED: "Phiên đăng nhập hết hạn.",
      NETWORK_ERROR: "Lỗi đường truyền mạng.",
    },
  },
};

// 2. Tự điển tiếng Anh
const enDict = {
  translation: {
    sidebar: {
      dashboard: "Dashboard",
      vehicles: "Fleet Management",
      trips: "Schedules",
      bookings: "Bookings",
      settings: "Settings",
      logout: "Logout",
    },
    common: {
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading...",
      welcome_back: "Welcome back, {{name}}",
    },
    errors: {
      UNAUTHORIZED: "Session expired.",
      NETWORK_ERROR: "Network error occurred.",
    },
  },
};

// Cấu hình khởi chạy i18n
i18n.use(initReactI18next).init({
  resources: {
    vi: viDict,
    en: enDict,
  },
  // Ưu tiên load ngôn ngữ lưu trong LocalStorage hoặc ngôn ngữ mặc định vi
  lng: localStorage.getItem("portal_lang") || "vi",
  fallbackLng: "vi",

  interpolation: {
    escapeValue: false, // react đã an toàn chống xss rồi
  },
});

export default i18n;
