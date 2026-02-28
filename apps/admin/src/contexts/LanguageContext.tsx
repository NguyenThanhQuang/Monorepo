'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const STORAGE_KEY = 'preferredLanguage';

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // ===== Admin core =====
    adminPanel: 'Admin',
    admin: 'Quản trị viên',
    dashboard: 'Bảng điều khiển',
    revenue: 'Doanh thu',
    finance: 'Tài chính',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    lightTheme: 'Sáng',
    darkTheme: 'Tối',

    // ===== Sidebar labels =====
    companyManagement: 'Quản lý nhà xe',
    userManagement: 'Người dùng',
    reviewManagement: 'Đánh giá',

    // ===== Company management =====
    companyManagementDesc: 'Quản lý thông tin và trạng thái các nhà xe trên hệ thống',
    addCompany: 'Thêm nhà xe',
    searchCompanies: 'Tìm theo tên, email, mã nhà xe...',
    allStatus: 'Tất cả trạng thái',

    company: 'Nhà xe',
    email: 'Email',
    phone: 'Số điện thoại',
    status: 'Trạng thái',
    actions: 'Thao tác',
    trips: 'Chuyến',
    rating: 'Đánh giá',
    joinDate: 'Ngày đăng ký',
    code: 'Mã',

    viewDetails: 'Xem chi tiết',
    edit: 'Chỉnh sửa',
    suspend: 'Tạm ngưng',
    activate: 'Kích hoạt',
    noCompaniesFound: 'Không tìm thấy nhà xe nào',

    showing: 'Hiển thị',
    of: 'trên',
    companies: 'nhà xe',
    retry: 'Thử lại',

    billion: 'tỷ',
    million: 'triệu',

    // Status text
    companyStatusActive: 'Đang hoạt động',
    companyStatusPending: 'Chờ duyệt',
    companyStatusSuspended: 'Tạm ngưng',
    companyStatusInactive: 'Ngừng hoạt động',

    // Company errors/success
    errorFetchingCompanies: 'Không thể tải danh sách nhà xe',
    errorCreateCompany: 'Không thể tạo nhà xe',
    errorUpdateCompany: 'Không thể cập nhật nhà xe',
    errorSuspendCompany: 'Không thể tạm ngưng nhà xe',
    errorActivateCompany: 'Không thể kích hoạt nhà xe',
    successCreateCompany: 'Tạo nhà xe thành công',
    successUpdateCompany: 'Cập nhật nhà xe thành công',
    successSuspendCompany: 'Đã tạm ngưng nhà xe',
    successActivateCompany: 'Đã kích hoạt nhà xe',

    // Confirm messages
    confirmSuspend: 'Tạm ngưng nhà xe',
    confirmSuspendMessage:
      'Bạn có chắc chắn muốn tạm ngưng nhà xe "{companyName}"? Nhà xe sẽ không thể thực hiện các giao dịch mới.',
    confirmActivate: 'Kích hoạt nhà xe',
    confirmActivateMessage: 'Bạn có chắc chắn muốn kích hoạt lại nhà xe "{companyName}"?',

    // Company detail modal
    companyDetails: 'Chi tiết nhà xe',
    companyCode: 'Mã nhà xe',
    unknown: 'Không xác định',
    address: 'Địa chỉ',
    activityStats: 'Thống kê hoạt động',
    vehicles: 'Xe khách',
    passengers: 'Lượt khách',
    averageRating: 'Đánh giá trung bình',
    description: 'Giới thiệu',
    createdAt: 'Ngày tạo',
    lastUpdated: 'Cập nhật lần cuối',

    // Create/Edit modal
    addNewCompany: 'Thêm nhà xe mới',
    editCompany: 'Chỉnh sửa nhà xe',
    companyInformation: 'Thông tin nhà xe',
    companyName: 'Tên nhà xe',
    companyNamePlaceholder: 'VD: Phương Trang',
    companyCodePlaceholder: 'VD: FUTA',
    emailPlaceholder: 'contact@company.com',
    phonePlaceholder: '0901234567',
    addressPlaceholder: 'Địa chỉ công ty',
    descriptionPlaceholder: 'Mô tả về nhà xe...',
    logoUrl: 'Logo URL',
    logoUrlPlaceholder: 'https://example.com/logo.png',
    adminInformation: 'Thông tin quản trị viên',
    adminName: 'Họ tên',
    adminNamePlaceholder: 'Nguyễn Văn A',
    createCompany: 'Tạo nhà xe',
    update: 'Cập nhật',

    // Form validation
    errorCompanyNameRequired: 'Tên nhà xe không được để trống',
    errorCompanyCodeRequired: 'Mã nhà xe không được để trống',
    errorCompanyCodeFormat: 'Mã nhà xe chỉ chứa chữ hoa và số',
    errorEmailRequired: 'Email không được để trống',
    errorEmailInvalid: 'Email không hợp lệ',
    errorPhoneRequired: 'Số điện thoại không được để trống',
    errorPhoneInvalid: 'Số điện thoại không hợp lệ',
    errorAdminNameRequired: 'Tên quản trị viên không được để trống',
    errorAdminEmailRequired: 'Email quản trị viên không được để trống',
    errorAdminPhoneRequired: 'Số điện thoại quản trị viên không được để trống',

    // ===== Revenue (Admin) =====
    revenueStatistics: 'Thống kê doanh thu',
    revenueStatisticsDesc: 'Quản lý doanh thu theo nhà xe và thời gian',
    filterBy: 'Lọc theo:',
    searchCompany: 'Tìm kiếm nhà xe...',
    totalRevenue: 'Tổng doanh thu',
    totalBookings: 'Tổng số vé',
    activeCompanies: 'Đang hoạt động',
    averageOrderValue: 'Giá trị TB/đơn',
    estimatedValue: 'Giá trị ước tính',
    revenueByCompany: 'Chi tiết doanh thu theo nhà xe',
    monthYear: 'Tháng {month}/{year}',
    outOf: '/{total} tổng số',
    growth: 'Tăng trưởng',
    noRevenueData: 'Không có dữ liệu doanh thu trong tháng này',
    total: 'Tổng cộng',
    average: 'Trung bình',
    monthlyTrend: 'Xu hướng doanh thu 6 tháng',
    loadingRevenueData: 'Đang tải dữ liệu doanh thu...',
    exportError: 'Không thể xuất báo cáo. Vui lòng thử lại sau.',

    january: 'Tháng 1',
    february: 'Tháng 2',
    march: 'Tháng 3',
    april: 'Tháng 4',
    may: 'Tháng 5',
    june: 'Tháng 6',
    july: 'Tháng 7',
    august: 'Tháng 8',
    september: 'Tháng 9',
    october: 'Tháng 10',
    november: 'Tháng 11',
    december: 'Tháng 12',

    // ===== Users management (Admin) =====
    fetchUsersError: 'Không thể tải danh sách người dùng',
    banUserSuccess: 'Đã cấm người dùng thành công',
    unbanUserSuccess: 'Đã bỏ cấm người dùng thành công',
    updateStatusError: 'Không thể cập nhật trạng thái người dùng',
    filters: 'Bộ lọc',
    role: 'Vai trò',
    clearFilters: 'Xóa bộ lọc',
    noUsersFound: 'Không tìm thấy người dùng nào',
    users: 'người dùng',
    refresh: 'Làm mới',
    staffRole: 'Nhân viên',

    // ===== Common =====
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    processing: 'Đang xử lý...',
    loading: 'Đang tải...',
    close: 'Đóng',
    save: 'Lưu',
    delete: 'Xóa',
    add: 'Thêm',
  },

  en: {
    // ===== Admin core =====
    adminPanel: 'Admin',
    admin: 'Admin',
    dashboard: 'Dashboard',
    revenue: 'Revenue',
    finance: 'Finance',
    settings: 'Settings',
    logout: 'Logout',
    lightTheme: 'Light',
    darkTheme: 'Dark',

    // ===== Sidebar labels =====
    companyManagement: 'Company Management',
    userManagement: 'Users',
    reviewManagement: 'Reviews',

    // ===== Company management =====
    companyManagementDesc: 'Manage companies and their status in the system',
    addCompany: 'Add Company',
    searchCompanies: 'Search by name, email, company code...',
    allStatus: 'All Status',

    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    actions: 'Actions',
    trips: 'Trips',
    rating: 'Rating',
    joinDate: 'Join Date',
    code: 'Code',

    viewDetails: 'View Details',
    edit: 'Edit',
    suspend: 'Suspend',
    activate: 'Activate',
    noCompaniesFound: 'No companies found',

    showing: 'Showing',
    of: 'of',
    companies: 'companies',
    retry: 'Retry',

    billion: 'B',
    million: 'M',

    // Status text
    companyStatusActive: 'Active',
    companyStatusPending: 'Pending',
    companyStatusSuspended: 'Suspended',
    companyStatusInactive: 'Inactive',

    // Company errors/success
    errorFetchingCompanies: 'Failed to fetch companies',
    errorCreateCompany: 'Failed to create company',
    errorUpdateCompany: 'Failed to update company',
    errorSuspendCompany: 'Failed to suspend company',
    errorActivateCompany: 'Failed to activate company',
    successCreateCompany: 'Company created successfully',
    successUpdateCompany: 'Company updated successfully',
    successSuspendCompany: 'Company suspended successfully',
    successActivateCompany: 'Company activated successfully',

    // Confirm messages
    confirmSuspend: 'Suspend Company',
    confirmSuspendMessage:
      'Are you sure you want to suspend "{companyName}"? The company will not be able to make new transactions.',
    confirmActivate: 'Activate Company',
    confirmActivateMessage: 'Are you sure you want to activate "{companyName}"?',

    // Company detail modal
    companyDetails: 'Company Details',
    companyCode: 'Company Code',
    unknown: 'Unknown',
    address: 'Address',
    activityStats: 'Activity Statistics',
    vehicles: 'Vehicles',
    passengers: 'Passengers',
    averageRating: 'Average rating',
    description: 'Description',
    createdAt: 'Created at',
    lastUpdated: 'Last updated',

    // Create/Edit modal
    addNewCompany: 'Add New Company',
    editCompany: 'Edit Company',
    companyInformation: 'Company Information',
    companyName: 'Company name',
    companyNamePlaceholder: 'E.g: Phuong Trang',
    companyCodePlaceholder: 'E.g: FUTA',
    emailPlaceholder: 'contact@company.com',
    phonePlaceholder: '0901234567',
    addressPlaceholder: 'Company address',
    descriptionPlaceholder: 'Company description...',
    logoUrl: 'Logo URL',
    logoUrlPlaceholder: 'https://example.com/logo.png',
    adminInformation: 'Admin Information',
    adminName: 'Full name',
    adminNamePlaceholder: 'John Doe',
    createCompany: 'Create Company',
    update: 'Update',

    // Form validation
    errorCompanyNameRequired: 'Company name is required',
    errorCompanyCodeRequired: 'Company code is required',
    errorCompanyCodeFormat: 'Company code must contain only uppercase letters and numbers',
    errorEmailRequired: 'Email is required',
    errorEmailInvalid: 'Invalid email format',
    errorPhoneRequired: 'Phone number is required',
    errorPhoneInvalid: 'Invalid phone number format',
    errorAdminNameRequired: 'Admin name is required',
    errorAdminEmailRequired: 'Admin email is required',
    errorAdminPhoneRequired: 'Admin phone number is required',

    // ===== Revenue (Admin) =====
    revenueStatistics: 'Revenue Statistics',
    revenueStatisticsDesc: 'Manage revenue by company and time period',
    filterBy: 'Filter by:',
    searchCompany: 'Search company...',
    totalRevenue: 'Total Revenue',
    totalBookings: 'Total Bookings',
    activeCompanies: 'Active Companies',
    averageOrderValue: 'Avg. Order Value',
    estimatedValue: 'Estimated value',
    revenueByCompany: 'Revenue by Company',
    monthYear: '{month}/{year}',
    outOf: '/{total} total',
    growth: 'Growth',
    noRevenueData: 'No revenue data for this month',
    total: 'Total',
    average: 'Average',
    monthlyTrend: '6-Month Revenue Trend',
    loadingRevenueData: 'Loading revenue data...',
    exportError: 'Cannot export report. Please try again later.',

    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',

    // ===== Users management (Admin) =====
    fetchUsersError: 'Failed to fetch users',
    banUserSuccess: 'User banned successfully',
    unbanUserSuccess: 'User unbanned successfully',
    updateStatusError: 'Failed to update user status',
    filters: 'Filters',
    role: 'Role',
    clearFilters: 'Clear filters',
    noUsersFound: 'No users found',
    users: 'users',
    refresh: 'Refresh',
    staffRole: 'Staff',

    // ===== Common =====
    cancel: 'Cancel',
    confirm: 'Confirm',
    processing: 'Processing...',
    loading: 'Loading...',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    add: 'Add',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function isLanguage(v: unknown): v is Language {
  return v === 'vi' || v === 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const lang: Language = isLanguage(saved) ? saved : 'vi';
    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next: Language = prev === 'vi' ? 'en' : 'vi';
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
      return next;
    });
  };

  const t = (key: string): string => {
    const dict = translations[language];
    const fallback = translations.vi;
    return dict[key] ?? fallback[key] ?? key;
  };

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}