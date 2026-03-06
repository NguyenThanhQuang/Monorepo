"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Language = "vi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const STORAGE_KEY = "preferredLanguage";

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Header
    home: "Trang chủ",
    routes: "Tyumen đường",
    ticketLookup: "Tra cứu vé",
    contact: "Liên hệ",
    hotline: "Hotline",
    login: "Đăng nhập",
    logout: "Đăng xuất",
    account: "Tài khoản",
    myTrips: "Chuyến xe của tôi",
    profile: "Thông tin cá nhân",

    reviewManagement: "Quản lý đánh giá",
    reviewManagementDesc: "Quản lý đánh giá từ khách hàng",
    totalReviews: "Tổng đánh giá",
    published: "Đã đăng",
    hidden: "Đã ẩn",
    fiveStarReviews: "Đánh giá 5 sao",
    satisfaction: "Hài lòng",
    ratingDistribution: "Phân bố đánh giá",
    star: "sao",
    stars: "sao",
    searchReviews: "Tìm kiếm đánh giá...",
    allRatings: "Tất cả đánh giá",
    allStatus: "Tất cả trạng thái",
    reviewer: "Người đánh giá",
    route: "Tuyến đường",
    rating: "Đánh giá",
    comment: "Bình luận",
    date: "Ngày",
    status: "Trạng thái",
    actions: "Thao tác",
    hideReview: "Ẩn",
    showReview: "Hiện",
    deleteReview: "Xóa",
    confirmDelete: "Xác nhận xóa",
    deleteReviewConfirm:
      "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
    deleting: "Đang xóa...",
    showing: "Hiển thị",
    of: "trên",
    reviews: "đánh giá",
    ofTotal: "tổng số",

    // Hero
    heroTitle: "Đặt Vé Xe Khách Trực Tuyến",
    heroSubtitle: "Nhanh chóng - An toàn - Tiện lợi",
    departure: "Điểm đi",
    destination: "Điểm đến",
    search: "Tìm kiếm",
    selectDeparture: "Chọn điểm đi",
    selectDestination: "Chọn điểm đến",

    // Popular Routes
    popularRoutes: "Tuyến Đường Phổ Biến",
    popularDestinations: "Điểm đến phổ biến",
    tripsPerDay: "chuyến/ngày",
    from: "Từ",
    selectDepartureFirst: "Vui lòng chọn điểm đi",
    selectDestinationFirst: "Vui lòng chọn điểm đến",
    sameLocation: "Điểm đi và điểm đến không thể giống nhau",
    searching: "Đang tìm kiếm...",
    searchSuccess: "Tìm kiếm thành công!",
    searchError: "Có lỗi xảy ra khi tìm kiếm",
    swapSuccess: "Đã hoán đổi điểm đi và điểm đến",
    noLocationsToSwap: "Chưa có địa điểm để hoán đổi",
    errorLoadingLocations: "Không thể tải danh sách địa điểm",
    // Features
    features: "Tại Sao Chọn Chúng Tôi",
    feature1Title: "Đặt Vé Nhanh",
    feature1Desc: "Chỉ với vài thao tác đơn giản",
    feature2Title: "An Toàn",
    feature2Desc: "Thanh toán bảo mật 100%",
    feature3Title: "Hỗ Trợ 24/7",
    feature3Desc: "Luôn sẵn sàng hỗ trợ bạn",
    feature4Title: "Giá Tốt Nhất",
    feature4Desc: "Cam kết giá cạnh tranh nhất",
    featuresSubtitle: "Trải nghiệm dịch vụ đặt vé xe khách tốt nhất",
    safeAndSecure: "An toàn & Bảo mật",
    safeAndSecureDesc:
      "Thông tin thanh toán của bạn được bảo vệ bằng mã hóa cao cấp",
    timeSaving: "Tiết kiệm thời gian",
    timeSavingDesc: "Đặt vé chỉ trong vài phút mà không cần đến bến xe",
    bestPrice: "Giá tốt nhất",
    bestPriceDesc: "So sánh giá và tìm ưu đãi tốt nhất cho chuyến đi của bạn",
    support247: "Hỗ trợ 24/7",
    support247Desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn",
    qualityAssured: "Chất lượng đảm bảo",
    qualityAssuredDesc: "Đối tác nhà xe uy tín với tiêu chuẩn phục vụ cao",
    multiplePayments: "Thanh toán đa dạng",
    multiplePaymentsDesc:
      "Hỗ trợ nhiều hình thức thanh toán tiện lợi và an toàn",

    // Promo Banner
    limitedOffer: "Ưu đãi có thời hạn",
    specialOfferTitle: "Ưu Đãi Đặc Biệt - Giảm 20% Cho Đơn Hàng Đầu Tiên!",
    // useCode: 'Sử dụng mã', // DUPLICATE REMOVED
    whenCheckout: "khi thanh toán. Chỉ áp dụng cho khách hàng mới.",
    bookNowAndSave: "Đặt vé ngay & Tiết kiệm",

    // Footer
    platformDescription:
      "Nền tảng đặt vé xe khách trực tuyến hàng đầu Việt Nam",
    aboutUs: "Về chúng tôi",
    aboutCompany: "Giới thiệu",
    faq: "Câu hỏi thường gặp",
    termsOfService: "Điều khoản sử dụng",
    privacyPolicy: "Chính sách bảo mật",
    support: "Hỗ trợ",
    bookingGuide: "Hướng dẫn đặt vé",
    refundPolicy: "Chính sách hoàn vé",
    feedbackAndComplaint: "Góp ý - Khiếu nại",
    // contactInfo: 'Thông tin liên hệ', // DUPLICATE REMOVED
    // addressLabel: 'Địa chỉ', // DUPLICATE REMOVED
    addressValue: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
    // phoneLabel: 'Điện thoại', // DUPLICATE REMOVED
    emailLabel: "Email",
    mapLocation: "Bản đồ vị trí",
    sendMessage: "Gửi tin nhắn",
    allRightsReserved: "All rights reserved",

    // Contact
    contactTitle: "Liên Hệ Với Chúng Tôi",
    contactSubtitle: "Chúng tôi luôn sẵn sàng hỗ trợ bạn",
    fullName: "Họ và tên",
    email: "Email",
    phone: "Số điện thoại",
    message: "Tin nhắn",
    send: "Gửi tin nhắn",

    // Routes Page
    allRoutes: "Tất Cả Tuyến Đường",
    routesSubtitle: "Khám phá các tuyến đường phổ biến",

    // Search Results
    searchResults: "Kết quả tìm kiếm",
    foundTrips: "Tìm thấy",
    // tripsCount: 'chuyến', // DUPLICATE REMOVED
    sortByTime: "Giờ đi",
    sortByPrice: "Giá thấp nhất",
    sortByDuration: "Thời gian",
    seatsAvailable: "chỗ trống",
    // viewDetails: 'Xem chi tiết', // DUPLICATE REMOVED
    amenityWifi: "WiFi",
    amenityDrink: "Nước uống",
    amenityAC: "Điều hòa",
    amenityTV: "TV",

    // Hotline
    hotlineTitle: "Hotline Hỗ Trợ 24/7",
    hotlineSubtitle: "Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc",
    customerService: "Tổng đài chăm sóc khách hàng",
    bookingSupport: "Hỗ trợ đặt vé",
    technicalSupport: "Hỗ trợ kỹ thuật",
    complaint: "Khiếu nại & Góp ý",

    // Ticket Lookup
    ticketLookupTitle: "Tra Cứu Vé",
    ticketLookupHeader: "Tra Cứu Thông Tin Vé",
    ticketLookupSubtitle: "Nhập mã vé và số điện thoại để tra cứu thông tin",
    ticketCode: "Mã vé",
    ticketCodePlaceholder: "Nhập mã vé (VD: VX2024123001)",
    phoneNumber: "Số điện thoại",
    phoneNumberPlaceholder: "Nhập số điện thoại đặt vé",
    lookupButton: "Tra cứu",
    // ticketConfirmed: 'Vé đã được xác nhận', // DUPLICATE REMOVED
    bookingCode: "Mã đặt vé",
    time: "Thời gian",
    passenger: "Hành khách",
    seatAndPrice: "Số ghế & Giá vé",
    seat: "Ghế",
    // seatNumber: 'Số ghế', // DUPLICATE REMOVED
    busCompany: "Nhà xe",
    busType: "Loại xe",
    pickupPoint: "Điểm đón",
    printTicket: "In vé",
    cancelTicket: "Hủy vé",
    sleeper: "Giường nằm",
    seating: "Ghế ngồi",

    // My Trips
    myTripsTitle: "Chuyến Xe Của Tôi",
    allTrips: "Tất cả",
    upcoming: "Sắp đi",
    // completed: 'Đã hoàn thành', // DUPLICATE REMOVED
    cancelled: "Đã hủy",
    noTripsYet: "Chưa có chuyến đi nào",
    noTripsDesc: "Đặt vé ngay để bắt đầu hành trình của bạn",
    downloadTicket: "Tải vé",
    rateTrip: "Đánh giá",
    ratingModalTitle: "Đánh giá chuyến đi",
    yourRating: "Đánh giá của bạn",
    shareExperience: "Chia sẻ trải nghiệm của bạn...",
    submitRating: "Gửi đánh giá",
    upcomingStatus: "Sắp đi",
    // completedStatus: 'Đã đi', // DUPLICATE REMOVED
    // cancelledStatus: 'Đã hủy', // DUPLICATE REMOVED

    // Messages
    selectBothLocations: "Vui lòng chọn điểm đi và điểm đến",
    messageSent: "Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm.",

    // Settings Page
    settings: "Cài Đặt",
    settingsSubtitle: "Quản lý cài đặt hệ thống nhà xe",
    general: "Tổng quan",
    companyInfo: "Thông tin công ty",
    notifications: "Thông báo",
    security: "Bảo mật",
    // payment: 'Thanh toán', // DUPLICATE REMOVED
    backup: "Sao lưu",

    // General Settings
    generalSettings: "Cài Đặt Tổng Quan",
    generalSettingsDesc: "Cấu hình chung cho hệ thống",
    timezone: "Múi giờ",
    defaultLanguage: "Ngôn ngữ mặc định",
    currentLanguage: "Ngôn ngữ hiện tại",
    dateFormat: "Định dạng ngày",
    currency: "Đơn vị tiền tệ",
    businessHours: "Giờ Hoạt Động",
    businessHoursDesc: "Cấu hình giờ làm việc",
    weekdays: "Thứ 2 - Thứ 6",
    weekend: "Thứ 7 - Chủ nhật",

    // Company Settings
    companySettings: "Thông Tin Công Ty",
    companySettingsDesc: "Cập nhật thông tin nhà xe",
    companyName: "Tên công ty",
    address: "Địa chỉ",
    taxCode: "Mã số thuế",
    website: "Website",
    companyLogo: "Logo công ty",
    uploadLogo: "Tải lên logo",

    // Pricing Settings
    pricingSettings: "Cài Đặt Giá Cước",
    pricingSettingsDesc: "Quản lý chính sách giá vé",
    baseRate: "Giá cơ bản (VNĐ)",
    perKmRate: "Giá/km (VNĐ)",
    cancellationFee: "Phí hủy vé (%)",
    lateCancellationHours: "Thời gian hủy muộn (giờ)",
    childDiscount: "Giảm giá trẻ em (%)",
    studentDiscount: "Giảm giá sinh viên (%)",

    // Notification Settings
    notificationSettings: "Cài Đặt Thông Báo",
    notificationSettingsDesc: "Quản lý thông báo của hệ thống",
    emailNotifications: "Thông báo Email",
    emailNotificationsDesc: "Nhận thông báo qua email về đặt vé, hủy vé",
    pushNotifications: "Thông báo đẩy",
    pushNotificationsDesc: "Nhận thông báo đẩy trên thiết bị di động",
    smsNotifications: "Thông báo SMS",
    smsNotificationsDesc: "Gửi SMS xác nhận đặt vé cho khách hàng",
    emailTemplates: "Email Templates",
    bookingConfirmEmail: "Email xác nhận đặt vé",
    bookingConfirmEmailDesc: "Cấu hình nội dung email xác nhận",
    cancellationEmail: "Email hủy vé",
    cancellationEmailDesc: "Thông báo hủy vé cho khách hàng",
    reminderEmail: "Email nhắc nhở chuyến đi",
    reminderEmailDesc: "Nhắc khách 24h trước giờ khởi hành",

    // Security Settings
    securitySettings: "Bảo Mật",
    securitySettingsDesc: "Cài đặt bảo mật tài khoản và hệ thống",
    changePassword: "Đổi mật khẩu",
    changePasswordDesc: "Cập nhật mật khẩu đăng nhập",
    twoFactorAuth: "Xác thực hai yếu tố (2FA)",
    twoFactorAuthDesc: "Tăng cường bảo mật với 2FA",
    loginHistory: "Lịch sử đăng nhập",
    loginHistoryDesc: "Xem các lần đăng nhập gần đây",
    manageSession: "Quản lý phiên đăng nhập",
    manageSessionDesc: "Đăng xuất khỏi các thiết bị khác",
    securityPolicies: "Chính Sách Bảo Mật",
    sessionTimeout: "Thời gian hết phiên (phút)",
    maxLoginAttempts: "Số lần đăng nhập sai tối đa",

    // Payment Settings
    paymentGateway: "Cổng Thanh Toán",
    paymentGatewayDesc: "Quản lý phương thức thanh toán",
    vnpay: "VNPay",
    vnpayDesc: "Cổng thanh toán VNPay",
    momo: "MoMo",
    momoDesc: "Ví điện tử MoMo",
    zalopay: "ZaloPay",
    zalopayDesc: "Ví điện tử ZaloPay",
    // bankTransfer: 'Chuyển khoản ngân hàng', // DUPLICATE REMOVED
    // bankTransferDesc: 'Thanh toán qua chuyển khoản', // DUPLICATE REMOVED
    cash: "Tiền mặt",
    cashDesc: "Thanh toán trực tiếp",

    // Backup Settings
    backupSettings: "Sao Lưu Dữ Liệu",
    backupSettingsDesc: "Quản lý sao lưu tự động và phục hồi",
    autoBackup: "Sao lưu tự động",
    autoBackupDesc: "Sao lưu dữ liệu hàng ngày lúc 02:00",
    backupFrequency: "Tần suất sao lưu",
    retentionDays: "Thời gian lưu trữ (ngày)",
    backupNow: "Sao lưu ngay",
    recentBackups: "Sao Lưu Gần Đây",
    restore: "Phục hồi",
    daily: "Hàng ngày",
    weekly: "Hàng tuần",
    monthly: "Hàng tháng",

    // Common
    save: "Lưu",
    saveChanges: "Lưu thay đổi",
    saveAllChanges: "Lưu tất cả thay đổi",
    // cancel: 'Hủy', // DUPLICATE REMOVED
    delete: "Xóa",
    edit: "Sửa",
    add: "Thêm",
    close: "Đóng",
    // confirm: 'Xác nhận', // DUPLICATE REMOVED
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước",
    loading: "Đang tải...",
    success: "Thành công",
    error: "Lỗi",
    warning: "Cảnh báo",
    info: "Thông tin",

    // Admin Dashboard
    dashboard: "Bảng điều khiển",
    statistics: "Thống kê",
    trips: "Chuyến đi",
    buses: "Xe khách",
    drivers: "Tài xế",
    revenue: "Doanh thu",
    customers: "Khách hàng",
    bookings: "Đặt vé",

    // Admin Menu Items
    companyAdmin: "Company",
    systemAdmin: "Admin",
    vehicleManagement: "Quản lý xe",
    routeManagement: "Chuyến đi",
    bookingManagement: "Đặt vé",
    driverManagement: "Tài xế",
    driverApplications: "Đơn đăng ký",
    companyManagement: "Nhà xe",
    userManagement: "Người dùng",
    dataManagement: "Dữ liệu",
    promoCodeManagement: "Mã khuyến mãi",
    routeImagesManagement: "Ảnh tuyến đường",
    underDevelopment: "Đang phát triển",
    pageUnderConstruction: "đang được xây dựng",
    lightTheme: "Sáng",
    darkTheme: "Tối",
    switchToLight: "Chuyển sang sáng",
    switchToDark: "Chuyển sang tối",
    switchToEnglish: "Switch to English",
    switchToVietnamese: "Chuyển sang Tiếng Việt",

    // Driver Portal
    driverPortal: "Cổng Tài Xế",
    mySchedule: "Lịch Trình Của Tôi",
    // todayTrips: 'Chuyến Đi Hôm Nay', // DUPLICATE REMOVED
    upcomingTrips: "Chuyến Sắp Tới",
    // tripHistory: 'Lịch Sử Chuyến Đi', // DUPLICATE REMOVED
    passengers: "Hành khách",
    checkIn: "Check-in",
    scanQR: "Quét mã QR",
    // driverInfo: 'Thông Tin Tài Xế', // DUPLICATE REMOVED
    // licenseNumber: 'Số bằng lái xe', // DUPLICATE REMOVED
    idCard: "Số CCCD",
    achievements: "Thành Tích & Đánh Giá",
    ratings: "Đánh giá",
    // totalTrips: 'Tổng số chuyến', // DUPLICATE REMOVED
    onTimeRate: "Tỷ lệ đúng giờ",
    safetyScore: "Điểm an toàn",

    // Driver Home
    // navigation: 'Dẫn đường', // DUPLICATE REMOVED
    earnings: "Doanh thu",
    theme: "Giao diện",
    language: "Ngôn ngữ",
    driver: "Tài xế",
    hello: "Xin chào",
    today: "Hôm nay",
    tripToday: "Chuyến hôm nay",
    // aboutToDepart: 'Sắp khởi hành', // DUPLICATE REMOVED
    // running: 'Đang chạy', // DUPLICATE REMOVED
    arrived: "Đã đến",
    searchTrips: "Tìm chuyến đi...",
    distance: "Khoảng cách",
    boarded: "Đã lên",

    // Notifications
    notificationsTitle: "Thông báo",
    viewAll: "Xem tất cả",
    newTripAssigned: "Chuyến mới được giao",
    scheduleChanged: "Thay đổi lịch trình",
    tripCompleted: "Hoàn thành chuyến đi",
    minutesAgo: "phút trước",
    hourAgo: "giờ trước",
    hoursAgo: "giờ trước",

    // Trip Details
    // vehiclePlate: 'Biển số xe', // DUPLICATE REMOVED
    noTrips: "Không có chuyến đi nào",

    // Promo Codes
    promoCodes: "Mã giảm giá",
    promoCode: "Mã giảm giá",
    applyPromoCode: "Áp dụng mã",
    enterPromoCode: "Nhập mã giảm giá",
    promoCodeApplied: "Mã đã áp dụng",
    promoCodeInvalid: "Mã không hợp lệ",
    promoCodeDetails: "Chi tiết mã giảm giá",
    discount: "Giảm giá",
    validUntil: "Có hiệu lực đến",
    applicableRoutes: "Áp dụng cho tuyến",
    minAmount: "Số tiền tối thiểu",
    maxDiscount: "Giảm tối đa",
    useCode: "Sử dụng mã",
    // viewDetails: 'Xem chi tiết', // DUPLICATE REMOVED
    availablePromoCodes: "Mã giảm giá có sẵn",
    selectAndApply: "Chọn và áp dụng mã phù hợp",

    // Seat Selection
    selectSeat: "Chọn ghế",
    seatMap: "Sơ đồ ghế",
    floor1: "Tầng 1",
    floor2: "Tầng 2",
    // available: 'Trống', // DUPLICATE REMOVED
    selected: "Đang chọn",
    booked: "Đã đặt",
    holding: "Đang giữ",

    // Vehicle Types
    vehicleType: "Loại xe",
    sleeperBus: "Giường nằm",
    seatBus: "Ghế ngồi",
    limousine: "Limousine",
    vipBus: "VIP",
    beds: "giường",
    seats: "ghế",
    vehicleDetails: "Chi tiết xe",

    // Forgot Password
    forgotPassword: "Quên mật khẩu",
    resetPassword: "Đặt lại mật khẩu",
    enterEmail: "Nhập email của bạn",
    sendResetLink: "Gửi liên kết đặt lại",
    backToLogin: "Quay lại đăng nhập",
    resetEmailSent: "Email đặt lại mật khẩu đã được gửi",
    checkYourEmail: "Vui lòng kiểm tra email của bạn",
    forgotPasswordDriver: "Quên mật khẩu - Tài xế",
    forgotPasswordCompany: "Quên mật khẩu - Quản lý nhà xe",
    forgotPasswordSystem: "Quên mật khẩu - Quản trị hệ thống",
    forgotPasswordCustomer: "Quên mật khẩu",
    enterEmailToReset: "Nhập email để nhận liên kết đặt lại mật khẩu",
    registeredEmail: "Email đăng ký",
    // emailPlaceholder: 'example@email.com', // DUPLICATE REMOVED
    sendingEmail: "Đang gửi...",
    sendResetLinkButton: "Gửi liên kết đặt lại",
    emailSentSuccess: "Email đã được gửi!",
    checkEmailMessage: "Vui lòng kiểm tra email",
    checkEmailFor: "để nhận liên kết đặt lại mật khẩu.",
    noteLabel: "Lưu ý:",
    checkSpamFolder:
      "Kiểm tra cả thư mục spam nếu không thấy email trong hộp thư chính.",
    resetLinkNote: "Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến email này",

    // Dashboard Company
    companyDashboard: "Dashboard Nhà Xe",
    totalVehicles: "Tổng số xe",
    todayTrips: "Chuyến đi hôm nay",
    totalPassengers: "Tổng hành khách",
    monthlyRevenue: "Doanh thu tháng",
    revenue7Days: "Doanh Thu 7 Ngày Gần Nhất",
    recentTrips: "Chuyến Đi Gần Đây",
    report: "Báo cáo",
    days7: "7 ngày",
    days30: "30 ngày",
    running: "Đang chạy",
    aboutToDepart: "Sắp khởi hành",
    completed: "Đã hoàn thành",
    vehiclePlate: "Biển số xe",
    bookedSeats: "Đã đặt",

    // System Dashboard
    systemDashboard: "Dashboard Hệ Thống",
    totalCompanies: "Tổng số nhà xe",
    totalUsers: "Tổng người dùng",
    totalBookings: "Tổng đặt vé",
    systemRevenue: "Doanh thu hệ thống",
    activeCompanies: "Nhà xe hoạt động",
    pendingApproval: "Chờ phê duyệt",
    recentActivities: "Hoạt Động Gần Đây",
    newCompanyRegistered: "Nhà xe mới đăng ký",
    newDriverApplication: "Đơn tài xế mới",
    bookingCompleted: "Hoàn thành đặt vé",
    systemAlert: "Cảnh báo hệ thống",

    // Vehicle Management
    vehicleList: "Danh Sách Xe",
    addNewVehicle: "Thêm Xe Mới",
    vehicleInfo: "Thông Tin Xe",
    licensePlate: "Biển số xe",
    model: "Mẫu xe",
    manufacturer: "Hãng sản xuất",
    // year: 'Năm sản xuất', // DUPLICATE REMOVED
    capacity: "Số chỗ",
    active: "Hoạt động",
    inactive: "Ngừng hoạt động",
    maintenance: "Bảo trì",
    lastMaintenance: "Bảo trì lần cuối",
    nextMaintenance: "Bảo trì tiếp theo",
    totalDistance: "Tổng quãng đường",
    fuelType: "Loại nhiên liệu",
    diesel: "Dầu diesel",
    gasoline: "Xăng",
    electric: "Điện",
    hybrid: "Hybrid",
    amenities: "Tiện nghi",
    wifi: "WiFi",
    ac: "Điều hòa",
    tv: "TV",
    charger: "Sạc điện thoại",
    blanket: "Chăn",
    water: "Nước uống",
    tissue: "Khăn giấy",
    vehicleManagementTitle: "Quản Lý Xe",
    vehicleManagementDesc: "Quản lý đội xe của nhà xe",
    totalVehiclesCount: "Tổng số xe",
    activeVehicles: "Đang hoạt động",
    maintenanceVehicles: "Đang bảo trì",
    totalSeats: "Tổng số ghế",
    searchVehicle: "Tìm kiếm theo biển số, loại xe...",
    editVehicle: "Chỉnh Sửa Xe",
    deleteVehicleConfirm: "Bạn có chắc muốn xóa xe này?",
    vehicleTypeLabel: "Loại xe",
    sleeperBusOption: "Giường nằm",
    vipSleeperBus: "Giường nằm VIP",
    seatBusOption: "Ghế ngồi",
    limousineOption: "Limousine",
    seatNumber: "Số ghế",
    yearOfManufacture: "Năm sản xuất",
    manufacturerBrand: "Hãng xe",

    // Driver Management
    driverManagementTitle: "Quản Lý Tài Xế",
    driverManagementDesc: "Quản lý đội ngũ tài xế",
    addDriver: "Thêm tài xế",
    totalDriversCount: "Tổng tài xế",
    availableDrivers: "Sẵn sàng",
    busyDrivers: "Đang bận",
    averageRating: "Đánh giá TB",
    // searchDriver: 'Tìm kiếm theo tên, SĐT, GPLX...', // DUPLICATE REMOVED
    // allStatus: 'Tất cả trạng thái', // DUPLICATE REMOVED
    availableStatus: "Sẵn sàng",
    busyStatus: "Đang bận",
    offDutyStatus: "Nghỉ phép",
    // driverColumn: 'Tài xế', // DUPLICATE REMOVED
    // contactColumn: 'Liên hệ', // DUPLICATE REMOVED
    licenseColumn: "GPLX",
    assignedVehicleColumn: "Xe phụ trách",
    // ratingColumn: 'Đánh giá', // DUPLICATE REMOVED
    // tripsColumn: 'Chuyến đi', // DUPLICATE REMOVED
    // joinedDate: 'Tham gia', // DUPLICATE REMOVED
    addNewDriverTitle: "Thêm Tài Xế Mới",
    licenseNumberLabel: "Số GPLX",

    // Route Management
    routeManagementTitle: "Quản Lý Chuyến Đi",
    routeManagementDesc: "Quản lý lịch trình và chuyến đi",
    createNewTrip: "Tạo chuyến mới",
    totalTrips: "Tổng số chuyến",
    scheduledTrips: "Đã lên lịch",
    runningTrips: "Đang chạy",
    totalTicketsSold: "Tổng vé đã bán",
    searchRoute: "Tìm kiếm theo tuyến đường, biển số...",
    scheduledStatus: "Đã lên lịch",
    runningStatus: "Đang chạy",
    completedStatus: "Hoàn thành",
    cancelledStatus: "Đã hủy",
    routeColumn: "Tuyến đường",
    timeColumn: "Thời gian",
    dateColumn: "Ngày",
    priceColumn: "Giá vé",
    seatsColumn: "Số ghế",
    // assignDriver: 'Phân công tài xế', // DUPLICATE REMOVED
    driverAssigned: "Đã phân công tài xế thành công!",

    // Booking Management
    bookingManagementTitle: "Quản Lý Đặt Vé",
    bookingManagementDesc: "Xem và quản lý các vé đã đặt",
    totalBookingsCount: "Tổng đặt vé",
    confirmedBookings: "Đã xác nhận",
    cancelledBookings: "Đã hủy",
    totalRevenueLabel: "Tổng doanh thu",
    searchBooking: "Tìm kiếm theo mã vé, tên, SĐT...",
    ticketCodeColumn: "Mã vé",
    passengerColumn: "Hành khách",
    bookingDateColumn: "Ngày đặt",
    viewBookingDetails: "Chi tiết đặt vé",
    bookingDetails: "Chi Tiết Đặt Vé",
    bookingInformation: "Thông Tin Đặt Vé",
    tripInformation: "Thông Tin Chuyến Đi",
    passengerInformation: "Thông Tin Hành Khách",
    exportBookings: "Xuất danh sách",

    // Additional Route Management
    selectVehicle: "Chọn xe",
    createTrip: "Tạo chuyến đi",
    ticketPrice: "Giá vé",

    // Driver Applications
    // driverApplicationsTitle: 'Đơn Đăng Ký Tài Xế', // DUPLICATE REMOVED
    driverApplicationsDesc: "Quản lý và phê duyệt đơn đăng ký tài xế mới",
    // exportExcel: 'Xuất Excel', // DUPLICATE REMOVED
    // totalApplications: 'Tổng đơn', // DUPLICATE REMOVED
    // pendingApplications: 'Chờ duyệt', // DUPLICATE REMOVED
    // approvedApplications: 'Đã duyệt', // DUPLICATE REMOVED
    // rejectedApplications: 'Từ chối', // DUPLICATE REMOVED
    // searchApplications: 'Tìm kiếm theo tên, SĐT, email...', // DUPLICATE REMOVED
    allApplications: "Tất cả",
    driverInfo: "Thông tin tài xế",
    contactInfo: "Thông tin liên hệ",
    // licenseInfo: 'Bằng lái', // DUPLICATE REMOVED
    submittedDate: "Ngày nộp",
    // viewDetails: 'Xem chi tiết', // DUPLICATE REMOVED
    // approve: 'Phê duyệt', // DUPLICATE REMOVED
    // reject: 'Từ chối', // DUPLICATE REMOVED
    // noApplicationsFound: 'Không tìm thấy đơn đăng ký nào', // DUPLICATE REMOVED
    // tryChangeFilter: 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm', // DUPLICATE REMOVED
    // applicationCode: 'Mã đơn', // DUPLICATE REMOVED
    personalInformation: "Thông tin cá nhân",
    username: "Tên đăng nhập",
    // professionalInfo: 'Thông tin nghề nghiệp', // DUPLICATE REMOVED
    licenseImage: "Ảnh bằng lái xe",
    // experienceYears: 'năm kinh nghiệm', // DUPLICATE REMOVED
    notes: "Ghi chú",
    // addNote: 'Thêm ghi chú (tùy chọn):', // DUPLICATE REMOVED
    rejectReason: "Nhập lý do từ chối (sẽ được gửi đến tài xế):",
    // approveSuccess: 'Đã phê duyệt đơn đăng ký! Tài xế sẽ nhận được email thông báo.', // DUPLICATE REMOVED
    // rejectSuccess: 'Đã từ chối đơn đăng ký! Email thông báo đã được gửi đến tài xế.', // DUPLICATE REMOVED
    pendingStatus: "Chờ duyệt",
    approvedStatus: "Đã duyệt",
    rejectedStatus: "Từ chối",

    // FAQ Page
    faqTitle: "Câu Hỏi Thường Gặp",
    faqSubtitle: "Tìm câu trả lời cho các thắc mắc của bạn",
    searchFAQ: "Tìm kiếm câu hỏi...",
    allCategories: "Tất cả",
    bookingCategory: "Đặt vé",
    paymentCategory: "Thanh toán",
    tripCategory: "Chuyến đi",
    supportCategory: "Hỗ trợ",
    backToHome: "Về trang chủ",

    // FAQ Questions & Answers
    faq1Q: "Làm thế nào để đặt vé xe trên VeXe.com?",
    faq1A:
      "Rất đơn giản! Bạn chỉ cần: (1) Chọn điểm đi, điểm đến và ngày đi trên trang chủ. (2) Xem danh sách các chuyến xe và chọn chuyến phù hợp. (3) Chọn ghế ngồi yêu thích. (4) Điền thông tin hành khách và thanh toán. (5) Nhận vé điện tử qua email và SMS.",
    faq2Q: "Tôi có thể đặt vé trước bao lâu?",
    faq2A:
      "Bạn có thể đặt vé trước tối đa 30 ngày kể từ ngày đi. Tuy nhiên, mỗi nhà xe có thể có chính sách riêng về thời gian mở bán vé.",
    faq3Q: "Làm sao để hủy hoặc đổi vé đã đặt?",
    faq3A:
      'Bạn có thể hủy/đổi vé trong mục "Chuyến xe của tôi". Lưu ý: Phí hủy/đổi vé tùy thuộc vào chính sách của từng nhà xe và thời gian hủy/đổi. Nếu hủy trước 24h, phí thường là 10-20% giá vé. Nếu hủy trong vòng 24h, phí có thể lên đến 50%.',
    faq4Q: "Có những phương thức thanh toán nào?",
    faq4A:
      "VeXe.com hỗ trợ đa dạng phương thức thanh toán: (1) Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB). (2) Ví điện tử (MoMo, ZaloPay, VNPay). (3) Chuyển khoản ngân hàng. (4) Thanh toán tại cửa hàng tiện lợi. Tất cả đều được mã hóa và bảo mật 100%.",
    faq5Q: "Thanh toán có an toàn không?",
    faq5A:
      "Hoàn toàn an toàn! VeXe.com sử dụng công nghệ mã hóa SSL 256-bit, chuẩn bảo mật quốc tế PCI DSS. Thông tin thẻ của bạn sẽ không bao giờ được lưu trữ trên hệ thống của chúng tôi.",
    faq6Q: "Tôi có nhận được hóa đơn VAT không?",
    faq6A:
      "Có, bạn có thể yêu cầu xuất hóa đơn VAT khi đặt vé hoặc liên hệ với bộ phận CSKH trong vòng 7 ngày kể từ ngày đi. Vui lòng cung cấp thông tin công ty đầy đủ.",
    faq7Q: "Tôi cần mang theo gì khi lên xe?",
    faq7A:
      "Bạn cần mang theo: (1) Vé điện tử (có thể là mã QR trên điện thoại hoặc bản in). (2) CMND/CCCD hoặc giấy tờ tùy thân. (3) Hành lý cá nhân. Lưu ý: Mỗi hành khách được mang tối đa 20kg hành lý miễn phí.",
    faq8Q: "Xe có WiFi và sạc điện thoại không?",
    faq8A:
      "Hầu hết các xe cao cấp (VIP, Limousine) đều có WiFi miễn phí và cổng sạc USB. Tuy nhiên, tùy từng nhà xe sẽ có trang thiết bị khác nhau. Bạn có thể kiểm tra tiện ích xe trước khi đặt.",
    faq9Q: "Nếu tôi đến muộn thì sao?",
    faq9A:
      "Xe sẽ khởi hành đúng giờ đã định. Nếu bạn đến muộn, xe có thể đã rời bến và bạn sẽ không được hoàn tiền. Chúng tôi khuyên bạn nên đến bến xe trước 15-30 phút.",
    faq10Q: "Làm sao để liên hệ với bộ phận CSKH?",
    faq10A:
      "Bạn có thể liên hệ với chúng tôi qua: (1) Hotline: 1900 6067 (24/7). (2) Email: support@vexe.com. (3) Live chat trên website. (4) Fanpage Facebook: VeXe.com. (5) Zalo OA: VeXe Official. Chúng tôi sẵn sàng hỗ trợ bạn mọi lúc!",
    faq11Q: "Tôi quên mất mã đặt vé, làm sao để tìm lại?",
    faq11A:
      'Đừng lo! Bạn có thể: (1) Kiểm tra email đã dùng để đặt vé. (2) Vào mục "Tra cứu vé" trên website và nhập số điện thoại. (3) Liên hệ hotline 1900 6067 để được hỗ trợ tra cứu.',
    faq12Q: "VeXe.com có ứng dụng di động không?",
    faq12A:
      "Có! Bạn có thể tải ứng dụng VeXe.com trên App Store (iOS) và Google Play (Android). Ứng dụng có giao diện thân thiện, dễ sử dụng và nhận nhiều ưu đãi độc quyền.",

    // Auth Pages
    driverPortalTitle: "Cổng Tài Xế",
    driverLoginSubtitle: "Đăng nhập để bắt đầu làm việc",
    companyAdminTitle: "Quản Lý Nhà Xe",
    companyLoginSubtitle: "Đăng nhập để quản lý nhà xe",
    systemAdminTitle: "Quản Trị Hệ Thống",
    systemLoginSubtitle: "Đăng nhập với quyền quản trị viên",
    mobilePreviewTitle: "Xem Giao Diện Mobile",
    previewApp: "Preview ứng dụng di động",
    managementPortal: "Cổng quản lý",
    manageTrips: "Quản lý chuyến đi",
    manageBusiness: "Điều hành doanh nghiệp",
    manageSystem: "Quản lý toàn hệ thống",
    // usernameLabel: 'Tên đăng nhập', // DUPLICATE REMOVED
    enterUsername: "Nhập tên đăng nhập",
    password: "Mật khẩu",
    enterPassword: "Nhập mật khẩu",
    rememberLogin: "Ghi nhớ đăng nhập",
    rememberMe: "Ghi nhớ đăng nhập",
    loggingIn: "Đang đăng nhập...",
    noAccountYet: "Chưa có tài khoản?",
    noAccount: "Chưa có tài khoản?",
    registerNow: "Đăng ký ngay",
    demoNote: "Demo:",
    demoInstructions: "Nhập bất kỳ tên và mật khẩu để đăng nhập",
    // demoExample: 'Ví dụ:', // DUPLICATE REMOVED
    pleaseEnterAllInfo: "Vui lòng nhập đầy đủ thông tin!",

    // Driver Registration
    driverRegistrationTitle: "Đăng Ký Tài Xế",
    driverRegistrationSubtitle:
      "Gia nhập đội ngũ tài xế chuyên nghiệp của chúng tôi",
    backToLoginPage: "Về trang đăng nhập",
    backToHomePage: "Về trang chủ",
    avatarSection: "Ảnh đại diện",
    chooseAvatar: "Chọn ảnh đại diện",
    imageFormat: "Định dạng: JPG, PNG (Max 5MB)",
    // personalInfoSection: 'Thông tin cá nhân', // DUPLICATE REMOVED
    professionalInfoSection: "Thông tin nghề nghiệp",
    accountInfoSection: "Thông tin tài khoản",
    // fullNameLabel: 'Họ và tên', // DUPLICATE REMOVED
    fullNamePlaceholder: "Nguyễn Văn A",
    phoneLabel: "Số điện thoại",
    phonePlaceholder: "0123456789",
    emailPlaceholder: "email@example.com",
    // addressLabel: 'Địa chỉ', // DUPLICATE REMOVED
    addressPlaceholder: "123 Đường ABC, Quận 1, TP.HCM",
    licenseNumberField: "Số bằng lái xe",
    licenseNumberPlaceholder: "123456789",
    experienceLabel: "Kinh nghiệm lái xe (năm)",
    experiencePlaceholder: "5",
    // licenseImageLabel: 'Ảnh bằng lái xe', // DUPLICATE REMOVED
    uploadLicenseImage: "Click để tải lên ảnh bằng lái xe",
    usernameField: "Tên đăng nhập",
    usernamePlaceholder: "driver123",
    passwordField: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    confirmPasswordField: "Xác nhận mật khẩu",
    confirmPasswordPlaceholder: "••••••••",
    agreeToTerms: "Tôi đồng ý với",
    termsAndConditions: "Điều khoản dịch vụ",
    and: "và",
    privacyPolicyLink: "Chính sách bảo mật",
    ofVeXe: "của VeXe.com",
    registerButton: "Đăng ký ngay",
    processing: "Đang xử lý...",
    registrationNote: "Lưu ý:",
    registrationNoteText:
      "Sau khi đăng ký, đơn của bạn sẽ được quản lý nhà xe xem xét và phê duyệt trong vòng 24-48h. Chúng tôi sẽ liên hệ với bạn qua email hoặc số điện thoại đã đăng ký.",
    passwordMismatch: "Mật khẩu xác nhận không khớp!",
    passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự!",
    registrationSuccessMessage:
      "Đăng ký thành công! Đơn đăng ký của bạn đang chờ phê duyệt. Chúng tôi sẽ liên hệ với bạn trong vòng 24-48h.",
    required: "*",

    // Driver Profile & Settings
    profileAndSettings: "Hồ Sơ & Cài Đặt",
    // personalInfo: 'Thông tin cá nhân', // DUPLICATE REMOVED
    tripHistory: "Lịch sử chuyến đi",
    changePasswordOption: "Đổi mật khẩu",
    achievementsAndRatings: "Thành tích & Đánh giá",
    employeeCode: "Mã NV",
    excellentDriver: "Tài xế xuất sắc",
    // tripsCount: 'Chuyến đi', // DUPLICATE REMOVED
    onTime: "Đúng giờ",
    thisMonthStats: "Thống Kê Tháng Này",
    totalTripsThisMonth: "Tổng chuyến",
    revenueLabel: "Doanh thu",
    comparedToLastMonth: "so với tháng trước",
    loginSubtitle: "Đăng nhập",
    register: "Đăng ký",
    haveAccount: "Đã có tài khoản?",
    loginNow: "Đăng nhập ngay",
    emailField: "Email",
    confirmPassword: "Xác nhận mật khẩu",
    enterConfirmPassword: "Nhập lại mật khẩu",

    // Driver Profile Detail
    backToProfile: "Quay lại",
    editProfile: "Chỉnh sửa",
    saveProfile: "Lưu",
    cancelEdit: "Hủy",
    personalInfoSection: "Thông tin cá nhân",
    licenseInfoSection: "Thông Tin Bằng Lái",
    // fullNameLabel: 'Họ và tên', // DUPLICATE REMOVED
    dateOfBirth: "Ngày sinh",
    // phoneNumberLabel: 'Số điện thoại', // DUPLICATE REMOVED
    emailAddress: "Email",
    idCardNumber: "Số CCCD",
    joinedDate: "Ngày tham gia",
    addressInfo: "Địa chỉ",
    licenseNumberInfo: "Số bằng lái",
    licenseExpiry: "Ngày hết hạn",
    licenseImages: "Ảnh bằng lái",
    frontSide: "Mặt trước",
    backSide: "Mặt sau",
    employeeCodeLabel: "Mã nhân viên",
    professionalDriver: "Tài xế chuyên nghiệp",

    // Trip History
    tripHistoryTitle: "Lịch Sử Chuyến Đi",
    tripHistorySubtitle: "Xem lại các chuyến đi đã hoàn thành",
    thisWeek: "Tuần này",
    // thisMonth: 'Tháng này', // DUPLICATE REMOVED
    // thisYear: 'Năm nay', // DUPLICATE REMOVED
    tripsCompleted: "Chuyến đi",
    kmDriven: "Km đã chạy",
    passengersServed: "Hành khách",
    totalRevenue: "Doanh thu",
    averageRatingLabel: "Đánh giá TB",
    tripDetails: "Chi tiết chuyến đi",
    completedLabel: "Hoàn thành",
    passengersLabel: "hành khách",
    performanceExcellent: "Hiệu suất xuất sắc! 🎉",
    performanceSummary: "Bạn đã hoàn thành",
    inPeriod: "chuyến đi trong",
    week: "tuần",
    month: "tháng",
    year: "Năm",
    withRating: "này với đánh giá trung bình",

    // Notifications
    notificationsPageTitle: "Thông Báo",
    markAllRead: "Đánh dấu tất cả đã đọc",
    unreadNotifications: "thông báo chưa đọc",
    allNotifications: "Tất cả",
    unreadOnly: "Chưa đọc",
    readOnly: "Đã đọc",
    closeButton: "Đóng",
    detailsLabel: "Chi tiết",
    viewDetailsButton: "Xem chi tiết →",
    noNotifications: "Không có thông báo",
    allRead: "Bạn đã đọc hết thông báo",
    noNewNotifications: "Chưa có thông báo mới",

    // Change Password
    changePasswordTitle: "Đổi Mật Khẩu",
    changePasswordSubtitle: "Cập nhật mật khẩu để bảo mật tài khoản",
    currentPasswordLabel: "Mật khẩu hiện tại",
    newPasswordLabel: "Mật khẩu mới",
    confirmNewPasswordLabel: "Xác nhận mật khẩu mới",
    enterCurrentPassword: "Nhập mật khẩu hiện tại",
    enterNewPassword: "Nhập mật khẩu mới",
    reEnterNewPassword: "Nhập lại mật khẩu mới",
    passwordRequirements: "Yêu cầu mật khẩu:",
    minLength: "Ít nhất 8 ký tự",
    hasUppercase: "Có chữ hoa",
    hasLowercase: "Có chữ thường",
    hasNumber: "Có số",
    hasSpecialChar: "Có ký tự đặc biệt",
    passwordMismatchError: "Mật khẩu không khớp",
    changePasswordButton: "Đổi mật khẩu",
    passwordChangeSuccess: "Đổi mật khẩu thành công!",
    redirecting: "Đang chuyển hướng...",
    securityTipsTitle: "💡 Bảo mật tài khoản",
    securityTip1: "Không chia sẻ mật khẩu với bất kỳ ai",
    securityTip2: "Thay đổi mật khẩu định kỳ mỗi 3-6 tháng",
    securityTip3: "Sử dụng mật khẩu khác nhau cho các tài khoản",
    securityTip4: "Không sử dụng thông tin cá nhân dễ đoán làm mật khẩu",

    // Achievements
    achievementsPageTitle: "Thành Tích & Đánh Giá",
    achievementsTab: "Thành tích",
    reviewsTab: "Đánh giá",
    achievementsUnlocked: "Thành tích đã mở",
    totalRewards: "Tổng phần thưởng",
    averageProgress: "Tiến độ trung bình",
    unlocked: "Đã mở",
    rewardLabel: "Phần thưởng:",
    averageRatingStats: "Đánh giá TB",
    totalReviewsStats: "Tổng đánh giá",
    fiveStarsCount: "5 sao",
    satisfactionRate: "Tỷ lệ hài lòng",

    // Driver Assignment
    assignDriver: "Phân công tài xế",
    searchDriver: "Tìm kiếm tài xế...",
    tripsCount: "chuyến",
    available: "Có sẵn",
    busy: "Đang bận",

    // Payment Modal
    payment: "Thanh toán",
    paymentSuccess: "Thanh toán thành công!",
    ticketConfirmed: "Vé đã được xác nhận",
    ticketInfo: "Thông tin vé",
    routeLabel: "Tuyến đường:",
    dateLabel: "Ngày đi:",
    departureTimeLabel: "Giờ khởi hành:",
    seatNumberLabel: "Số ghế:",
    totalAmount: "Tổng tiền:",
    paymentMethod: "Phương thức thanh toán",
    creditCard: "Thẻ tín dụng / Ghi nợ",
    creditCardDesc: "Visa, Mastercard, JCB",
    momoWallet: "Ví MoMo",
    momoWalletDesc: "Thanh toán qua ví điện tử",
    bankTransfer: "Chuyển khoản ngân hàng",
    bankTransferDesc: "Thanh toán qua chuyển khoản ngân hàng",
    cardNumber: "Số thẻ",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    expiryDate: "Ngày hết hạn",
    expiryDatePlaceholder: "MM/YY",
    cardholderName: "Tên chủ thẻ",
    cardholderPlaceholder: "NGUYEN VAN A",
    cancel: "Hủy",
    processingPayment: "Đang xử lý...",
    payButton: "Thanh toán",

    // Company Management
    companyManagementTitle: "Quản Lý Nhà Xe",
    companyManagementDesc: "Quản lý các nhà xe trên hệ thống",
    addCompany: "Thêm nhà xe",
    totalCompaniesAll: "Tổng nhà xe",
    activeStatus: "Đang hoạt động",
    totalVehiclesAll: "Tổng số xe",
    searchByNameEmail: "Tìm kiếm theo tên, email...",
    activeLabel: "Hoạt động",
    suspendedLabel: "Tạm ngưng",
    companyColumn: "Nhà xe",
    // contactColumn: 'Liên hệ', // DUPLICATE REMOVED
    vehiclesColumn: "Số xe",
    tripsColumn: "Chuyến đi",
    revenueColumn: "Doanh thu",
    ratingColumn: "Đánh giá",
    // statusColumn: 'Trạng thái', // DUPLICATE REMOVED
    // actionsColumn: 'Hành động', // DUPLICATE REMOVED
    joinedLabel: "Tham gia:",
    // viewDetails: 'Xem chi tiết', // DUPLICATE REMOVED
    editAction: "Sửa",
    suspendAction: "Tạm ngưng",
    activateAction: "Kích hoạt",

    // User Management
    userManagementTitle: "Quản Lý Người Dùng",
    userManagementDesc: "Quản lý tất cả người dùng trên hệ thống",
    totalUsersStats: "Tổng người dùng",
    activeUsers: "Người dùng hoạt động",
    bannedUsers: "Đã cấm",
    totalRevenueStats: "Tổng doanh thu",
    searchByNameEmailPhone: "Tìm kiếm theo tên, email, SĐT...",
    allRoles: "Tất cả vai trò",
    userRole: "Người dùng",
    companyAdminRoleLabel: "Quản lý nhà xe",
    bannedStatus: "Đã cấm",
    userNameColumn: "Người dùng",
    roleColumn: "Vai trò",
    totalTripsColumn: "Tổng chuyến",
    totalSpentColumn: "Tổng chi tiêu",
    joinDateColumn: "Ngày tham gia",
    banUser: "Cấm",
    unbanUser: "Bỏ cấm",

    // System Dashboard
    systemDashboardTitleAlt: "Dashboard Hệ Thống",
    systemAdminLabel: "Quản trị viên hệ thống",
    exportReport: "Xuất báo cáo",
    totalCompaniesStats: "Tổng nhà xe",
    usersStats: "Người dùng",
    totalVehiclesStats: "Tổng xe",
    monthlyRevenueStats: "Doanh thu tháng",
    revenueOverview: "Tổng Quan Doanh Thu",
    thisMonth: "Tháng này",
    thisQuarter: "Quý này",
    thisYear: "Năm nay",
    topCompanies: "Top Nhà Xe",
    companyNameColumn: "Tên nhà xe",

    // Review Management
    reviewManagementTitle: "Quản Lý Đánh Giá",
    publishedReviews: "Đã đăng",
    flaggedReviews: "Đã báo cáo",

    publishedLabel: "Đã đăng",
    hiddenLabel: "Đã ẩn",
    flaggedLabel: "Đã báo cáo",
    reviewerColumn: "Người đánh giá",
    companyRouteColumn: "Nhà xe & Tuyến",
    commentColumn: "Bình luận",

    tripDateLabel: "Chuyến đi:",
    likesLabel: "lượt thích",

    // About Page
    aboutDescription:
      "Nền tảng đặt vé xe khách trực tuyến hàng đầu Việt Nam, mang đến trải nghiệm đặt vé nhanh chóng, an toàn và tiện lợi cho hàng triệu hành khách",
    routesCount: "Tuyến đường",
    partnerCompanies: "Đối tác nhà xe",
    yearsExperience: "Năm kinh nghiệm",
    safetyAndTrust: "An toàn & Tin cậy",
    safetyDescription:
      "Cam kết đảm bảo an toàn tuyệt đối cho mọi hành khách với đội ngũ tài xế chuyên nghiệp",
    dedicatedService: "Phục vụ tận tâm",
    dedicatedServiceDescription:
      "Đội ngũ nhân viên nhiệt tình, luôn sẵn sàng hỗ trợ bạn 24/7",
    highQuality: "Chất lượng cao",
    highQualityDescription:
      "Đội xe hiện đại, tiện nghi đầy đủ, đảm bảo chuyến đi thoải mái nhất",
    onTimeDescription:
      "Cam kết khởi hành và đến nơi đúng giờ, tôn trọng thời gian của bạn",
    ourStory: "Câu Chuyện Của Chúng Tôi",
    ourStoryDesc:
      "VeXe.com được thành lập với sứ mệnh mang đến trải nghiệm đặt vé xe khách tốt nhất cho người Việt",
    ourMission: "Sứ Mệnh",
    ourMissionDesc:
      "Kết nối hàng triệu hành khách với các nhà xe uy tín, tạo nên một hệ sinh thái giao thông an toàn, tiện lợi và minh bạch",
    ourJourney: "Hành Trình Phát Triển",
    founded: "Thành lập",
    foundedDesc: "VeXe.com chính thức ra mắt tại TP. Hồ Chí Minh",
    expansion: "Mở rộng",
    expansionDesc: "Phủ sóng toàn quốc với hơn 200 đối tác nhà xe",
    mobileApp: "Ứng dụng di động",
    mobileAppDesc: "Ra mắt ứng dụng iOS và Android",
    milestone5M: "5 triệu khách hàng",
    awardDesc: 'Nhận giải thưởng "Nền tảng đặt vé tốt nhất"',
    present: "Hiện tại",
    presentDesc: "Phục vụ hơn 10 triệu khách hàng mỗi năm",
    ourTeam: "Đội Ngũ Của Chúng Tôi",
    ourTeamDesc: "Những con người đam mê, tận tâm và không ngừng sáng tạo",
    joinUs: "Tham gia cùng chúng tôi",
    joinUsDesc: "Hãy là một phần trong hành trình phát triển của VeXe.com",

    // Payment Page
    paymentTitle: "Thanh Toán",
    paymentSubtitle: "Chọn phương thức thanh toán để hoàn tất đặt vé",
    tripSummary: "Thông Tin Chuyến Đi",
    departureDate: "Ngày đi",
    selectedSeats: "Ghế đã chọn",
    passengerInfo: "Thông Tin Hành Khách",
    passengerName: "Họ và tên",
    passengerPhone: "Số điện thoại",
    passengerEmail: "Email (tùy chọn)",
    enterPassengerName: "Nhập họ và tên",
    enterPassengerPhone: "Nhập số điện thoại",
    enterPassengerEmail: "Nhập email",
    pricingDetails: "Chi Tiết Giá",
    ticketFare: "Giá vé",
    serviceFee: "Phí dịch vụ",
    totalPayment: "Tổng thanh toán",
    selectPaymentMethod: "Chọn Phương Thức Thanh Toán",
    creditCardPayment: "Thẻ tín dụng/ghi nợ",
    momoPayment: "Ví MoMo",
    momoPaymentDesc: "Thanh toán qua ví điện tử MoMo",
    vnpayPayment: "VNPay",
    vnpayPaymentDesc: "Thanh toán qua VNPay QR",
    bankPayment: "Chuyển khoản ngân hàng",
    bankPaymentDesc: "Chuyển khoản trực tiếp",
    completePayment: "Hoàn Tất Thanh Toán",
    processingPaymentText: "Đang xử lý thanh toán...",

    // QR Ticket Page
    qrTicketTitle: "Vé Điện Tử",
    downloadQR: "Tải xuống",
    shareQR: "Chia sẻ",
    printQR: "In vé",
    showQRCode: "Xuất trình mã QR này khi lên xe",
    bookingSuccess: "Đặt vé thành công!",
    bookingSuccessDesc: "Vé điện tử của bạn đã sẵn sàng",
    importantNotes: "Lưu Ý Quan Trọng",
    note1: "Vui lòng đến điểm đón trước giờ khởi hành 15-30 phút",
    note2: "Xuất trình mã QR và CMND/CCCD khi lên xe",
    note3: "Mang theo hành lý tối đa 20kg (miễn phí)",
    note4: "Liên hệ hotline nếu cần hỗ trợ",
    needHelp: "Cần Hỗ Trợ?",
    contactHotline: "Liên hệ hotline",
    customerCare: "Chăm sóc khách hàng",

    // Contact Page
    getInTouch: "Liên Hệ",
    getInTouchDesc: "Chúng tôi rất mong được nghe từ bạn",
    yourName: "Tên của bạn",
    yourEmail: "Email của bạn",
    yourMessage: "Tin nhắn của bạn",
    sendMessageButton: "Gửi tin nhắn",
    sendingMessage: "Đang gửi...",
    contactVia: "Hoặc Liên Hệ Qua",
    officeAddress: "Địa chỉ văn phòng",
    workingHours: "Giờ làm việc",
    mondayFriday: "Thứ 2 - Thứ 6",
    saturdaySunday: "Thứ 7 - Chủ nhật",
    followUs: "Theo Dõi Chúng Tôi",

    // Driver Trip Detail (NEW)
    checkinProgress: "Tiến Độ Check-in",
    navigation: "Dẫn đường",
    callDispatch: "Gọi TT",
    reportIssue: "Báo cáo",
    passengerList: "Danh Sách Hành Khách",
    seatLabel: "Ghế:",
    ticketCodeLabel: "Mã vé:",

    // QR Scanner (NEW)
    scanQRInstruction: "Di chuyển camera đến mã QR trên vé của hành khách",
    holdSteady: "Giữ camera ổn định để quét",
    enterTicketCode: "Nhập Mã Vé",
    enterTicketCodePlaceholder: "Nhập mã vé",
    checkinSuccess: "Check-in Thành Công!",
    invalidTicket: "Mã vé không hợp lệ",
    pleaseTryAgain: "Vui lòng thử lại",

    // Navigation (NEW)
    speedLabel: "Tốc độ",
    remainingLabel: "Còn lại",
    turnRightRoad: "Rẽ phải vào Quốc lộ 1A",
    after25km: "Sau 2.5km",
    reportIncident: "Báo sự cố",
    callSupport: "Gọi hỗ trợ",
    stopPoint: "Điểm dừng",

    // Earnings (NEW)
    earningsTitle: "Thu Nhập",
    earningsSubtitle: "Quản lý thu nhập và chi phí của bạn",
    totalEarnings: "Tổng thu nhập",
    baseEarnings: "Thu nhập cơ bản",
    bonusEarnings: "Thưởng & phụ cấp",
    currencyVND: "VNĐ",

    // Demo Data
    demoUserName: "Nguyễn Văn A",
    demoUserEmail: "nguyenvana@example.com",
    demoDestination: "Đà Lạt",

    // Additional Missing Keys
    manualEntry: "Nhập mã thủ công",
    confirm: "Xác nhận",
    onBoard: "Đã lên xe",
    notCheckedIn: "Chưa lên",

    // Driver Applications (System Admin)
    driverApplicationsTitle: "Đơn Đăng Ký Tài Xế",
    driverApplicationsSubtitle: "Quản lý và phê duyệt đơn đăng ký tài xế mới",
    exportExcel: "Xuất Excel",
    totalApplications: "Tổng đơn",
    pendingApplications: "Chờ duyệt",
    approvedApplications: "Đã duyệt",
    rejectedApplications: "Từ chối",
    searchApplications: "Tìm kiếm theo tên, SĐT, email...",
    driverColumn: "Tài xế",
    contactColumn: "Liên hệ",
    documentsColumn: "Giấy tờ",
    submitDateColumn: "Ngày nộp",
    viewDetails: "Xem chi tiết",
    approve: "Phê duyệt",
    reject: "Từ chối",
    addNoteOptional: "Thêm ghi chú (tùy chọn):",
    approveSuccess:
      "Đã phê duyệt đơn đăng ký! Tài xế sẽ nhận được email thông báo.",
    rejectSuccess:
      "Đã từ chối đơn đăng ký! Email thông báo đã được gửi đến tài xế.",
    enterRejectReason: "Nhập lý do từ chối:",
    licenseNumber: "Số bằng lái",
    experience: "Kinh nghiệm",
    years: "năm",
    applicationDetails: "Chi Tiết Đơn Đăng Ký",
    applicantInfo: "Thông Tin Ứng Viên",
    licenseInfo: "Thông tin bằng lái",
    experienceYears: "Số năm kinh nghiệm",
    viewLicense: "Xem bằng lái",
    adminNotes: "Ghi chú của admin",
    addNote: "Thêm ghi chú",
    approveApplication: "Phê duyệt",
    rejectApplication: "Từ chối",
    noApplicationsFound: "Không tìm thấy đơn đăng ký nào",
    tryChangeFilter: "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm",
    applicationCode: "Mã đơn",
    personalInfo: "Thông tin cá nhân",
    fullNameLabel: "Họ và tên",
    usernameLabel: "Tên đăng nhập",
    phoneNumberLabel: "Số điện thoại",
    addressLabel: "Địa chỉ",
    professionalInfo: "Thông tin nghề nghiệp",
    licenseImageLabel: "Ảnh bằng lái xe",
    notesLabel: "Ghi chú",
    statusColumn: "Trạng thái",
    actionsColumn: "Thao tác",

    noTripsFound: "Rất tiếc, chưa tìm thấy chuyến xe nào",
    changeSearch: "Thay đổi tìm kiếm",
    noMatchingRoutes: "Không có tuyến xe phù hợp",

    // Demo Login
    demoLoginInstruction: "Nhập bất kỳ tên và mật khẩu để đăng nhập",
    demoExample: "Ví dụ: admin / password",
  },
  en: {
    // Header
    home: "Home",
    routes: "Routes",
    ticketLookup: "Ticket Lookup",
    contact: "Contact",
    hotline: "Hotline",
    login: "Login",
    logout: "Logout",
    account: "Account",
    myTrips: "My Trips",
    profile: "Profile",

    // Hero
    heroTitle: "Book Bus Tickets Online",
    heroSubtitle: "Fast - Safe - Convenient",
    departure: "From",
    destination: "To",
    date: "Date",
    search: "Search",
    selectDeparture: "Select departure",
    selectDestination: "Select destination",

    // Popular Routes
    popularRoutes: "Popular Routes",
    popularDestinations: "Popular Destinations",
    tripsPerDay: "trips/day",
    from: "From",

    // Features
    features: "Why Choose Us",
    feature1Title: "Quick Booking",
    feature1Desc: "Just a few simple steps",
    feature2Title: "Secure",
    feature2Desc: "100% secure payment",
    feature3Title: "24/7 Support",
    feature3Desc: "Always ready to help",
    feature4Title: "Best Price",
    feature4Desc: "Guaranteed competitive pricing",
    featuresSubtitle: "Experience the best bus ticket booking service",
    safeAndSecure: "Safe & Secure",
    safeAndSecureDesc:
      "Your payment information is protected by high-level encryption",
    timeSaving: "Time-saving",
    timeSavingDesc: "Book tickets in minutes without going to the bus station",
    bestPrice: "Best Price",
    bestPriceDesc: "Compare prices and find the best deals for your trip",
    support247: "24/7 Support",
    support247Desc: "Our customer service team is always ready to help you",
    qualityAssured: "Quality Assured",
    qualityAssuredDesc: "Trusted bus company with high service standards",
    multiplePayments: "Multiple Payment Options",
    multiplePaymentsDesc: "Supports convenient and secure payment methods",

    // Promo Banner
    limitedOffer: "Limited Time Offer",
    specialOfferTitle: "Special Offer - 20% Off Your First Booking!",
    // useCode: 'Use code', // DUPLICATE REMOVED
    whenCheckout: "at checkout. Only for new customers.",
    bookNowAndSave: "Book Now & Save",

    // Footer
    platformDescription: "Vietnam's leading online bus ticket booking platform",
    aboutUs: "About Us",
    aboutCompany: "About",
    faq: "FAQ",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    support: "Support",
    bookingGuide: "Booking Guide",
    refundPolicy: "Refund Policy",
    feedbackAndComplaint: "Feedback & Complaints",
    // contactInfo: 'Contact Information', // DUPLICATE REMOVED
    // addressLabel: 'Address', // DUPLICATE REMOVED
    addressValue: "123 ABC Street, District 1, Ho Chi Minh City",
    // phoneLabel: 'Phone', // DUPLICATE REMOVED
    emailLabel: "Email",
    mapLocation: "Map Location",
    sendMessage: "Send Message",
    allRightsReserved: "All rights reserved",

    // Contact
    contactTitle: "Contact Us",
    contactSubtitle: "We are always ready to help you",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    message: "Message",
    send: "Send message",

    // Routes Page
    allRoutes: "All Routes",
    routesSubtitle: "Discover popular routes",

    // Search Results
    searchResults: "Search Results",
    foundTrips: "Found",
    // tripsCount: 'trips', // DUPLICATE REMOVED
    sortByTime: "Departure Time",
    sortByPrice: "Lowest Price",
    sortByDuration: "Duration",
    reviews: "reviews",
    seatsAvailable: "seats available",
    // viewDetails: 'View Details', // DUPLICATE REMOVED
    amenityWifi: "WiFi",
    amenityDrink: "Drinks",
    amenityAC: "Air Conditioning",
    amenityTV: "TV",

    // Hotline
    hotlineTitle: "24/7 Support Hotline",
    hotlineSubtitle: "We are always ready to help you anytime",
    customerService: "Customer service",
    bookingSupport: "Booking support",
    technicalSupport: "Technical support",
    complaint: "Complaints & Feedback",

    // Ticket Lookup
    ticketLookupTitle: "Ticket Lookup",
    ticketLookupHeader: "Ticket Information Lookup",
    ticketLookupSubtitle:
      "Enter ticket code and phone number to lookup information",
    ticketCode: "Ticket code",
    ticketCodePlaceholder: "Enter ticket code (e.g. VX2024123001)",
    phoneNumber: "Phone number",
    phoneNumberPlaceholder: "Enter booking phone number",
    lookupButton: "Look up",
    // ticketConfirmed: 'Ticket Confirmed', // DUPLICATE REMOVED
    bookingCode: "Booking Code",
    route: "Route",
    time: "Time",
    passenger: "Passenger",
    seatAndPrice: "Seat & Price",
    seat: "Seat",
    // seatNumber: 'Seat number', // DUPLICATE REMOVED
    busCompany: "Bus Company",
    busType: "Bus Type",
    pickupPoint: "Pickup Point",
    printTicket: "Print Ticket",
    cancelTicket: "Cancel Ticket",
    sleeper: "Sleeper",
    seating: "Seating",

    // My Trips
    myTripsTitle: "My Trips",
    allTrips: "All",
    upcoming: "Upcoming",
    // completed: 'Completed', // DUPLICATE REMOVED
    cancelled: "Cancelled",
    noTripsYet: "No trips yet",
    noTripsDesc: "Book a ticket now to start your journey",
    downloadTicket: "Download Ticket",
    rateTrip: "Rate",
    ratingModalTitle: "Rate Your Trip",
    yourRating: "Your Rating",
    shareExperience: "Share your experience...",
    submitRating: "Submit Rating",
    upcomingStatus: "Upcoming",
    // completedStatus: 'Completed', // DUPLICATE REMOVED
    // cancelledStatus: 'Cancelled', // DUPLICATE REMOVED

    // Messages
    selectBothLocations: "Please select both departure and destination",
    messageSent: "Message sent successfully! We will respond soon.",

    // Settings Page
    settings: "Settings",
    settingsSubtitle: "Manage bus company system settings",
    general: "General",
    companyInfo: "Company Info",
    notifications: "Notifications",
    security: "Security",
    // payment: 'Payment', // DUPLICATE REMOVED
    backup: "Backup",

    // General Settings
    generalSettings: "General Settings",
    generalSettingsDesc: "General system configuration",
    timezone: "Timezone",
    defaultLanguage: "Default Language",
    currentLanguage: "Current Language",
    dateFormat: "Date Format",
    currency: "Currency",
    businessHours: "Business Hours",
    businessHoursDesc: "Configure working hours",
    weekdays: "Monday - Friday",
    weekend: "Saturday - Sunday",

    // Company Settings
    companySettings: "Company Information",
    companySettingsDesc: "Update bus company information",
    companyName: "Company name",
    address: "Address",
    taxCode: "Tax code",
    website: "Website",
    companyLogo: "Company logo",
    uploadLogo: "Upload logo",

    // Pricing Settings
    pricingSettings: "Pricing Settings",
    pricingSettingsDesc: "Manage ticket pricing policy",
    baseRate: "Base Rate (VND)",
    perKmRate: "Per Km Rate (VND)",
    cancellationFee: "Cancellation Fee (%)",
    lateCancellationHours: "Late Cancellation Hours",
    childDiscount: "Child Discount (%)",
    studentDiscount: "Student Discount (%)",

    // Notification Settings
    notificationSettings: "Notification Settings",
    notificationSettingsDesc: "Manage system notifications",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc:
      "Receive email notifications about bookings and cancellations",
    pushNotifications: "Push Notifications",
    pushNotificationsDesc: "Receive push notifications on mobile devices",
    smsNotifications: "SMS Notifications",
    smsNotificationsDesc: "Send SMS booking confirmation to customers",
    emailTemplates: "Email Templates",
    bookingConfirmEmail: "Booking Confirmation Email",
    bookingConfirmEmailDesc: "Configure confirmation email content",
    cancellationEmail: "Cancellation Email",
    cancellationEmailDesc: "Notify customers about cancellations",
    reminderEmail: "Trip Reminder Email",
    reminderEmailDesc: "Remind customers 24h before departure",

    // Security Settings
    securitySettings: "Security",
    securitySettingsDesc: "Account and system security settings",
    changePassword: "Change Password",
    changePasswordDesc: "Update login password",
    twoFactorAuth: "Two-Factor Authentication (2FA)",
    twoFactorAuthDesc: "Enhance security with 2FA",
    loginHistory: "Login History",
    loginHistoryDesc: "View recent login activities",
    manageSession: "Manage Sessions",
    manageSessionDesc: "Logout from other devices",
    securityPolicies: "Security Policies",
    sessionTimeout: "Session Timeout (minutes)",
    maxLoginAttempts: "Maximum Login Attempts",

    // Payment Settings
    paymentGateway: "Payment Gateway",
    paymentGatewayDesc: "Manage payment methods",
    vnpay: "VNPay",
    vnpayDesc: "VNPay payment gateway",
    momo: "MoMo",
    momoDesc: "MoMo e-wallet",
    zalopay: "ZaloPay",
    zalopayDesc: "ZaloPay e-wallet",
    // bankTransfer: 'Bank Transfer', // DUPLICATE REMOVED
    // bankTransferDesc: 'Payment via bank transfer', // DUPLICATE REMOVED
    cash: "Cash",
    cashDesc: "Direct payment",

    // Backup Settings
    backupSettings: "Data Backup",
    backupSettingsDesc: "Manage automatic backup and restore",
    autoBackup: "Automatic Backup",
    autoBackupDesc: "Daily backup at 02:00",
    backupFrequency: "Backup Frequency",
    retentionDays: "Retention Period (days)",
    backupNow: "Backup Now",
    recentBackups: "Recent Backups",
    restore: "Restore",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",

    // Common
    save: "Save",
    saveChanges: "Save Changes",
    saveAllChanges: "Save All Changes",
    // cancel: 'Cancel', // DUPLICATE REMOVED
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    // confirm: 'Confirm', // DUPLICATE REMOVED
    back: "Back",
    next: "Next",
    previous: "Previous",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",

    // Admin Dashboard
    dashboard: "Dashboard",
    statistics: "Statistics",
    trips: "Trips",
    buses: "Buses",
    drivers: "Drivers",
    revenue: "Revenue",
    customers: "Customers",
    bookings: "Bookings",

    // Admin Menu Items
    companyAdmin: "Company",
    systemAdmin: "Admin",
    vehicleManagement: "Vehicles",
    routeManagement: "Routes",
    bookingManagement: "Bookings",
    driverManagement: "Drivers",
    driverApplications: "Applications",
    companyManagement: "Companies",
    userManagement: "Users",
    reviewManagement: "Reviews",
    dataManagement: "Data",
    promoCodeManagement: "Promo Codes",
    routeImagesManagement: "Route Images",
    underDevelopment: "Under Development",
    pageUnderConstruction: "is under construction",
    lightTheme: "Light",
    darkTheme: "Dark",
    switchToLight: "Switch to light",
    switchToDark: "Switch to dark",
    switchToEnglish: "Switch to English",
    switchToVietnamese: "Chuyển sang Tiếng Việt",

    // Driver Portal
    driverPortal: "Driver Portal",
    mySchedule: "My Schedule",
    // todayTrips: "Today's Trips", // DUPLICATE REMOVED
    upcomingTrips: "Upcoming Trips",
    // tripHistory: 'Trip History', // DUPLICATE REMOVED
    passengers: "Passengers",
    checkIn: "Check-in",
    scanQR: "Scan QR",
    // driverInfo: 'Driver Information', // DUPLICATE REMOVED
    // licenseNumber: 'License Number', // DUPLICATE REMOVED
    idCard: "ID Card Number",
    achievements: "Achievements & Ratings",
    ratings: "Ratings",
    // totalTrips: 'Total Trips', // DUPLICATE REMOVED
    onTimeRate: "On-Time Rate",
    safetyScore: "Safety Score",

    // Driver Home
    // navigation: 'Navigation', // DUPLICATE REMOVED
    earnings: "Earnings",
    theme: "Theme",
    language: "Language",
    driver: "Driver",
    hello: "Hello",
    today: "Today",
    tripToday: "Trips today",
    // aboutToDepart: 'About to depart', // DUPLICATE REMOVED
    // running: 'Running', // DUPLICATE REMOVED
    arrived: "Arrived",
    searchTrips: "Search trips...",
    distance: "Distance",
    boarded: "Boarded",

    // Notifications
    notificationsTitle: "Notifications",
    viewAll: "View All",
    newTripAssigned: "New Trip Assigned",
    scheduleChanged: "Schedule Changed",
    tripCompleted: "Trip Completed",
    minutesAgo: "minutes ago",
    hourAgo: "hour ago",
    hoursAgo: "hours ago",

    // Trip Details
    // vehiclePlate: 'Vehicle Plate', // DUPLICATE REMOVED
    noTrips: "No trips available",

    // Promo Codes
    promoCodes: "Promo Codes",
    promoCode: "Promo Code",
    applyPromoCode: "Apply Promo Code",
    enterPromoCode: "Enter Promo Code",
    promoCodeApplied: "Promo Code Applied",
    promoCodeInvalid: "Invalid Promo Code",
    promoCodeDetails: "Promo Code Details",
    discount: "Discount",
    validUntil: "Valid Until",
    applicableRoutes: "Applicable Routes",
    minAmount: "Minimum Amount",
    maxDiscount: "Maximum Discount",
    useCode: "Use Code",
    // viewDetails: 'View Details', // DUPLICATE REMOVED
    availablePromoCodes: "Available Promo Codes",
    selectAndApply: "Select and apply the appropriate code",

    // Seat Selection
    selectSeat: "Select Seat",
    seatMap: "Seat Map",
    floor1: "Floor 1",
    floor2: "Floor 2",
    // available: 'Available', // DUPLICATE REMOVED
    selected: "Selected",
    booked: "Booked",
    holding: "Holding",

    // Vehicle Types
    vehicleType: "Vehicle Type",
    sleeperBus: "Sleeper Bus",
    seatBus: "Seat Bus",
    limousine: "Limousine",
    vipBus: "VIP Bus",
    beds: "Beds",
    seats: "Seats",
    vehicleDetails: "Vehicle Details",

    // Forgot Password
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    enterEmail: "Enter your email",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    resetEmailSent: "Reset password email sent",
    checkYourEmail: "Please check your email",
    forgotPasswordDriver: "Forgot Password - Driver",
    forgotPasswordCompany: "Forgot Password - Company Admin",
    forgotPasswordSystem: "Forgot Password - System Admin",
    forgotPasswordCustomer: "Forgot Password",
    enterEmailToReset: "Enter your email to receive password reset link",
    registeredEmail: "Registered Email",
    // emailPlaceholder: 'example@email.com', // DUPLICATE REMOVED
    sendingEmail: "Sending...",
    sendResetLinkButton: "Send Reset Link",
    emailSentSuccess: "Email has been sent!",
    checkEmailMessage: "Please check your email",
    checkEmailFor: "to receive the password reset link.",
    noteLabel: "Note:",
    checkSpamFolder:
      "Check your spam folder if you don't see the email in your inbox.",
    resetLinkNote: "We will send a password reset link to this email",

    // Dashboard Company
    companyDashboard: "Company Dashboard",
    totalVehicles: "Total Vehicles",
    todayTrips: "Today's Trips",
    totalPassengers: "Total Passengers",
    monthlyRevenue: "Monthly Revenue",
    revenue7Days: "Revenue Last 7 Days",
    recentTrips: "Recent Trips",
    report: "Report",
    days7: "7 days",
    days30: "30 days",
    running: "Running",
    aboutToDepart: "About to depart",
    completed: "Completed",
    vehiclePlate: "Vehicle Plate",
    bookedSeats: "Booked",

    // System Dashboard
    systemDashboard: "System Dashboard",
    totalCompanies: "Total Companies",
    totalUsers: "Total Users",
    totalBookings: "Total Bookings",
    systemRevenue: "System Revenue",
    activeCompanies: "Active Companies",
    pendingApproval: "Pending Approval",
    recentActivities: "Recent Activities",
    newCompanyRegistered: "New company registered",
    newDriverApplication: "New driver application",
    bookingCompleted: "Booking completed",
    systemAlert: "System alert",

    // Vehicle Management
    vehicleList: "Vehicle List",
    addNewVehicle: "Add New Vehicle",
    vehicleInfo: "Vehicle Information",
    licensePlate: "License Plate",
    model: "Model",
    manufacturer: "Manufacturer",
    // year: 'Year', // DUPLICATE REMOVED
    capacity: "Capacity",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    maintenance: "Maintenance",
    lastMaintenance: "Last Maintenance",
    nextMaintenance: "Next Maintenance",
    totalDistance: "Total Distance",
    fuelType: "Fuel Type",
    diesel: "Diesel",
    gasoline: "Gasoline",
    electric: "Electric",
    hybrid: "Hybrid",
    amenities: "Amenities",
    wifi: "WiFi",
    ac: "Air Conditioning",
    tv: "TV",
    charger: "Phone Charger",
    blanket: "Blanket",
    water: "Water",
    tissue: "Tissue",
    vehicleManagementTitle: "Vehicle Management",
    vehicleManagementDesc: "Manage the bus fleet of the company",
    totalVehiclesCount: "Total Vehicles",
    activeVehicles: "Active Vehicles",
    maintenanceVehicles: "Maintenance Vehicles",
    totalSeats: "Total Seats",
    searchVehicle: "Search by license plate, vehicle type...",
    editVehicle: "Edit Vehicle",
    deleteVehicleConfirm: "Are you sure you want to delete this vehicle?",
    vehicleTypeLabel: "Vehicle Type",
    sleeperBusOption: "Sleeper Bus",
    vipSleeperBus: "VIP Sleeper Bus",
    seatBusOption: "Seat Bus",
    limousineOption: "Limousine",
    seatNumber: "Seat Number",
    yearOfManufacture: "Year of Manufacture",
    manufacturerBrand: "Manufacturer Brand",
    reviewManagementDesc: "Manage customer reviews",
    totalReviews: "Total Reviews",
    published: "Published",
    hidden: "Hidden",
    fiveStarReviews: "5-Star Reviews",
    satisfaction: "Satisfaction",
    ratingDistribution: "Rating Distribution",
    star: "star",
    stars: "stars",
    searchReviews: "Search reviews...",
    allRatings: "All Ratings",
    allStatus: "All Status",
    reviewer: "Reviewer",
    rating: "Rating",
    comment: "Comment",
    actions: "Actions",
    hideReview: "Hide",
    showReview: "Show",
    deleteReview: "Delete",
    confirmDelete: "Confirm Delete",
    deleteReviewConfirm:
      "Are you sure you want to delete this review? This action cannot be undone.",
    deleting: "Deleting...",
    showing: "Showing",
    of: "of",
    ofTotal: "of total",
    // Driver Management
    driverManagementTitle: "Driver Management",
    driverManagementDesc: "Manage the driver team",
    addDriver: "Add Driver",
    totalDriversCount: "Total Drivers",
    availableDrivers: "Available",
    busyDrivers: "Busy",
    averageRating: "Average Rating",
    // searchDriver: 'Search by name, phone number, license...', // DUPLICATE REMOVED
    // allStatus: 'All Statuses', // DUPLICATE REMOVED
    availableStatus: "Available",
    busyStatus: "Busy",
    offDutyStatus: "Off Duty",
    // driverColumn: 'Driver', // DUPLICATE REMOVED
    // contactColumn: 'Contact', // DUPLICATE REMOVED
    licenseColumn: "License",
    assignedVehicleColumn: "Assigned Vehicle",
    // ratingColumn: 'Rating', // DUPLICATE REMOVED
    // tripsColumn: 'Trips', // DUPLICATE REMOVED
    // joinedDate: 'Joined Date', // DUPLICATE REMOVED
    addNewDriverTitle: "Add New Driver",
    licenseNumberLabel: "License Number",

    // Route Management
    routeManagementTitle: "Route Management",
    routeManagementDesc: "Manage schedules and trips",
    createNewTrip: "Create New Trip",
    totalTrips: "Total Trips",
    scheduledTrips: "Scheduled",
    runningTrips: "Running",
    totalTicketsSold: "Total Tickets Sold",
    searchRoute: "Search by route, license plate...",
    scheduledStatus: "Scheduled",
    runningStatus: "Running",
    completedStatus: "Completed",
    cancelledStatus: "Cancelled",
    routeColumn: "Route",
    timeColumn: "Time",
    dateColumn: "Date",
    priceColumn: "Ticket Price",
    seatsColumn: "Seats",
    // assignDriver: 'Assign Driver', // DUPLICATE REMOVED
    driverAssigned: "Driver assigned successfully!",

    // Booking Management
    bookingManagementTitle: "Booking Management",
    bookingManagementDesc: "View and manage bookings",
    totalBookingsCount: "Total Bookings",
    confirmedBookings: "Confirmed",
    cancelledBookings: "Cancelled",
    totalRevenueLabel: "Total Revenue",
    searchBooking: "Search by ticket code, name, phone number...",
    ticketCodeColumn: "Ticket Code",
    passengerColumn: "Passenger",
    bookingDateColumn: "Booking Date",
    viewBookingDetails: "View Booking Details",
    bookingDetails: "Booking Details",
    bookingInformation: "Booking Information",
    tripInformation: "Trip Information",
    passengerInformation: "Passenger Information",
    exportBookings: "Export Bookings",

    // Additional Route Management
    selectVehicle: "Select Vehicle",
    createTrip: "Create Trip",
    ticketPrice: "Ticket Price",

    // Driver Applications
    // driverApplicationsTitle: 'Driver Applications', // DUPLICATE REMOVED
    driverApplicationsDesc: "Manage and approve new driver applications",
    // exportExcel: 'Export Excel', // DUPLICATE REMOVED
    // totalApplications: 'Total Applications', // DUPLICATE REMOVED
    // pendingApplications: 'Pending', // DUPLICATE REMOVED
    // approvedApplications: 'Approved', // DUPLICATE REMOVED
    // rejectedApplications: 'Rejected', // DUPLICATE REMOVED
    // searchApplications: 'Search by name, phone number, email...', // DUPLICATE REMOVED
    allApplications: "All",
    driverInfo: "Driver Information",
    contactInfo: "Contact Information",
    // licenseInfo: 'License', // DUPLICATE REMOVED
    submittedDate: "Submitted Date",
    // viewDetails: 'View Details', // DUPLICATE REMOVED
    // approve: 'Approve', // DUPLICATE REMOVED
    // reject: 'Reject', // DUPLICATE REMOVED
    // noApplicationsFound: 'No applications found', // DUPLICATE REMOVED
    // tryChangeFilter: 'Try changing the filter or search keyword', // DUPLICATE REMOVED
    // applicationCode: 'Application Code', // DUPLICATE REMOVED
    personalInformation: "Personal Information",
    username: "Username",
    // professionalInfo: 'Professional Information', // DUPLICATE REMOVED
    licenseImage: "License Image",
    // experienceYears: 'Years of Experience', // DUPLICATE REMOVED
    notes: "Notes",
    // addNote: 'Add Note (optional):', // DUPLICATE REMOVED
    rejectReason: "Enter rejection reason (will be sent to the driver):",
    // approveSuccess: 'Application approved! The driver will receive a notification email.', // DUPLICATE REMOVED
    // rejectSuccess: 'Application rejected! A notification email has been sent to the driver.', // DUPLICATE REMOVED
    pendingStatus: "Pending",
    approvedStatus: "Approved",
    rejectedStatus: "Rejected",

    // FAQ Page
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Find answers to your questions",
    searchFAQ: "Search questions...",
    allCategories: "All",
    bookingCategory: "Booking",
    paymentCategory: "Payment",
    tripCategory: "Trip",
    supportCategory: "Support",
    backToHome: "Back to Home",

    // FAQ Questions & Answers
    faq1Q: "How to book bus tickets on VeXe.com?",
    faq1A:
      "It's simple! Just: (1) Select departure, destination and date on homepage. (2) View list of trips and choose suitable one. (3) Select your favorite seat. (4) Fill in passenger information and payment. (5) Receive e-ticket via email and SMS.",
    faq2Q: "How far in advance can I book tickets?",
    faq2A:
      "You can book tickets up to 30 days in advance. However, each bus company may have their own policy regarding ticket sales opening time.",
    faq3Q: "How to cancel or change my booked ticket?",
    faq3A:
      'You can cancel/change tickets in "My Trips" section. Note: Cancellation/change fees depend on each bus company\'s policy and timing. If canceled before 24h, the fee is usually 10-20% of ticket price. If canceled within 24h, the fee can be up to 50%.',
    faq4Q: "What payment methods are available?",
    faq4A:
      "VeXe.com supports various payment methods: (1) Credit/Debit cards (Visa, Mastercard, JCB). (2) E-wallets (MoMo, ZaloPay, VNPay). (3) Bank transfer. (4) Payment at convenience stores. All are encrypted and 100% secure.",
    faq5Q: "Is payment secure?",
    faq5A:
      "Absolutely safe! VeXe.com uses SSL 256-bit encryption technology, international PCI DSS security standard. Your card information will never be stored on our system.",
    faq6Q: "Can I get a VAT invoice?",
    faq6A:
      "Yes, you can request a VAT invoice when booking or contact customer service within 7 days from departure date. Please provide complete company information.",
    faq7Q: "What do I need to bring when boarding?",
    faq7A:
      "You need to bring: (1) E-ticket (QR code on phone or printed version). (2) ID card or identification documents. (3) Personal luggage. Note: Each passenger is allowed a maximum of 20kg luggage free of charge.",
    faq8Q: "Does the bus have WiFi and phone charging?",
    faq8A:
      "Most premium buses (VIP, Limousine) have free WiFi and USB charging ports. However, each bus company has different equipment. You can check the bus amenities before booking.",
    faq9Q: "What if I arrive late?",
    faq9A:
      "The bus will depart on time. If you arrive late, the bus may have left the station and you will not be refunded. We recommend arriving at the bus station 15-30 minutes early.",
    faq10Q: "How to contact customer service?",
    faq10A:
      "You can contact us via: (1) Hotline: 1900 6067 (24/7). (2) Email: support@vexe.com. (3) Live chat on website. (4) Facebook Fanpage: VeXe.com. (5) Zalo OA: VeXe Official. We are always ready to help you!",
    faq11Q: "I forgot my booking code, how to find it?",
    faq11A:
      'Don\'t worry! You can: (1) Check the email used for booking. (2) Go to "Ticket Lookup" on website and enter phone number. (3) Contact hotline 1900 6067 for support.',
    faq12Q: "Does VeXe.com have a mobile app?",
    faq12A:
      "Yes! You can download VeXe.com app on App Store (iOS) and Google Play (Android). The app has a friendly interface, easy to use and receives many exclusive offers.",

    // Auth Pages
    driverPortalTitle: "Driver Portal",
    driverLoginSubtitle: "Login to start working",
    companyAdminTitle: "Company Management",
    companyLoginSubtitle: "Login to manage company",
    systemAdminTitle: "System Administration",
    systemLoginSubtitle: "Login with administrator privileges",
    mobilePreviewTitle: "Mobile Preview",
    previewApp: "Preview mobile app",
    managementPortal: "Management Portal",
    manageTrips: "Manage trips",
    manageBusiness: "Manage business",
    manageSystem: "Manage entire system",
    // usernameLabel: 'Username', // DUPLICATE REMOVED
    enterUsername: "Enter username",
    password: "Password",
    enterPassword: "Enter password",
    rememberLogin: "Remember me",
    rememberMe: "Remember me",
    loggingIn: "Logging in...",
    noAccountYet: "Don't have an account?",
    noAccount: "Don't have an account?",
    registerNow: "Register now",
    demoNote: "Demo:",
    demoInstructions: "Enter any username and password to login",
    // demoExample: 'Example:', // DUPLICATE REMOVED
    pleaseEnterAllInfo: "Please enter all information!",

    // Driver Registration
    driverRegistrationTitle: "Driver Registration",
    driverRegistrationSubtitle: "Join our professional driver team",
    backToLoginPage: "Back to login",
    backToHomePage: "Back to home",
    avatarSection: "Avatar",
    chooseAvatar: "Choose avatar",
    imageFormat: "Format: JPG, PNG (Max 5MB)",
    // personalInfoSection: 'Personal Information', // DUPLICATE REMOVED
    professionalInfoSection: "Professional Information",
    accountInfoSection: "Account Information",
    // fullNameLabel: 'Full Name', // DUPLICATE REMOVED
    fullNamePlaceholder: "John Doe",
    phoneLabel: "Phone Number",
    phonePlaceholder: "0123456789",
    emailPlaceholder: "email@example.com",
    // addressLabel: 'Address', // DUPLICATE REMOVED
    addressPlaceholder: "123 ABC Street, District 1, HCMC",
    licenseNumberField: "Driver License Number",
    licenseNumberPlaceholder: "123456789",
    experienceLabel: "Driving Experience (years)",
    experiencePlaceholder: "5",
    // licenseImageLabel: 'Driver License Image', // DUPLICATE REMOVED
    uploadLicenseImage: "Click to upload driver license image",
    usernameField: "Username",
    usernamePlaceholder: "driver123",
    passwordField: "Password",
    passwordPlaceholder: "••••••••",
    confirmPasswordField: "Confirm Password",
    confirmPasswordPlaceholder: "••••••••",
    agreeToTerms: "I agree to the",
    termsAndConditions: "Terms of Service",
    and: "and",
    privacyPolicyLink: "Privacy Policy",
    ofVeXe: "of VeXe.com",
    registerButton: "Register Now",
    processing: "Processing...",
    registrationNote: "Note:",
    registrationNoteText:
      "After registration, your application will be reviewed and approved by company management within 24-48 hours. We will contact you via email or registered phone number.",
    passwordMismatch: "Passwords do not match!",
    passwordTooShort: "Password must be at least 6 characters!",
    registrationSuccessMessage:
      "Registration successful! Your application is pending approval. We will contact you within 24-48 hours.",
    required: "*",

    // Driver Profile & Settings
    profileAndSettings: "Profile & Settings",
    // personalInfo: 'Personal Information', // DUPLICATE REMOVED
    tripHistory: "Trip History",
    changePasswordOption: "Change Password",
    achievementsAndRatings: "Achievements & Ratings",
    employeeCode: "Employee Code",
    excellentDriver: "Excellent Driver",
    // tripsCount: 'Trips', // DUPLICATE REMOVED
    onTime: "On Time",
    thisMonthStats: "This Month's Statistics",
    totalTripsThisMonth: "Total Trips",
    revenueLabel: "Revenue",
    comparedToLastMonth: "compared to last month",
    loginSubtitle: "Login",
    register: "Register",
    haveAccount: "Already have an account?",
    loginNow: "Login now",
    emailField: "Email",
    confirmPassword: "Confirm Password",
    enterConfirmPassword: "Re-enter password",

    // Driver Profile Detail
    backToProfile: "Back",
    editProfile: "Edit",
    saveProfile: "Save",
    cancelEdit: "Cancel",
    personalInfoSection: "Personal Information",
    licenseInfoSection: "License Information",
    // fullNameLabel: 'Full Name', // DUPLICATE REMOVED
    dateOfBirth: "Date of Birth",
    // phoneNumberLabel: 'Phone Number', // DUPLICATE REMOVED
    emailAddress: "Email",
    idCardNumber: "ID Card Number",
    joinedDate: "Joined Date",
    addressInfo: "Address",
    licenseNumberInfo: "License Number",
    licenseExpiry: "Expiry Date",
    licenseImages: "License Images",
    frontSide: "Front Side",
    backSide: "Back Side",
    employeeCodeLabel: "Employee Code",
    professionalDriver: "Professional Driver",

    // Trip History
    tripHistoryTitle: "Trip History",
    tripHistorySubtitle: "Review completed trips",
    thisWeek: "This Week",
    // thisMonth: 'This Month', // DUPLICATE REMOVED
    // thisYear: 'This Year', // DUPLICATE REMOVED
    tripsCompleted: "Trips",
    kmDriven: "Km Driven",
    passengersServed: "Passengers",
    totalRevenue: "Revenue",
    averageRatingLabel: "Avg. Rating",
    tripDetails: "Trip Details",
    completedLabel: "Completed",
    passengersLabel: "passengers",
    performanceExcellent: "Excellent Performance! 🎉",
    performanceSummary: "You have completed",
    inPeriod: "trips in this",
    week: "week",
    month: "month",
    year: "Year",
    withRating: "with an average rating of",

    // Notifications
    notificationsPageTitle: "Notifications",
    markAllRead: "Mark all as read",
    unreadNotifications: "unread notifications",
    allNotifications: "All",
    unreadOnly: "Unread",
    readOnly: "Read",
    closeButton: "Close",
    detailsLabel: "Details",
    viewDetailsButton: "View details →",
    noNotifications: "No notifications",
    allRead: "You have read all notifications",
    noNewNotifications: "No new notifications",

    // Change Password
    changePasswordTitle: "Change Password",
    changePasswordSubtitle: "Update your password for account security",
    currentPasswordLabel: "Current Password",
    newPasswordLabel: "New Password",
    confirmNewPasswordLabel: "Confirm New Password",
    enterCurrentPassword: "Enter current password",
    enterNewPassword: "Enter new password",
    reEnterNewPassword: "Re-enter new password",
    passwordRequirements: "Password requirements:",
    minLength: "At least 8 characters",
    hasUppercase: "Uppercase letter",
    hasLowercase: "Lowercase letter",
    hasNumber: "Number",
    hasSpecialChar: "Special character",
    passwordMismatchError: "Passwords do not match",
    changePasswordButton: "Change Password",
    passwordChangeSuccess: "Password changed successfully!",
    redirecting: "Redirecting...",
    securityTipsTitle: "💡 Account Security",
    securityTip1: "Never share your password with anyone",
    securityTip2: "Change your password every 3-6 months",
    securityTip3: "Use different passwords for different accounts",
    securityTip4: "Do not use easily guessable personal information",

    // Achievements
    achievementsPageTitle: "Achievements & Reviews",
    achievementsTab: "Achievements",
    reviewsTab: "Reviews",
    achievementsUnlocked: "Unlocked",
    totalRewards: "Total Rewards",
    averageProgress: "Average Progress",
    unlocked: "Unlocked",
    rewardLabel: "Reward:",
    averageRatingStats: "Avg. Rating",
    totalReviewsStats: "Total Reviews",
    fiveStarsCount: "5 Stars",
    satisfactionRate: "Satisfaction Rate",

    // Driver Assignment
    assignDriver: "Assign Driver",
    searchDriver: "Search drivers...",
    tripsCount: "trips",
    available: "Available",
    busy: "Busy",

    // Payment Modal
    payment: "Payment",
    paymentSuccess: "Payment Successful!",
    ticketConfirmed: "Ticket Confirmed",
    ticketInfo: "Ticket Information",
    routeLabel: "Route:",
    dateLabel: "Date:",
    departureTimeLabel: "Departure Time:",
    seatNumberLabel: "Seat Number:",
    totalAmount: "Total Amount:",
    paymentMethod: "Payment Method",
    creditCard: "Credit / Debit Card",
    creditCardDesc: "Visa, Mastercard, JCB",
    momoWallet: "MoMo Wallet",
    momoWalletDesc: "Pay via e-wallet",
    bankTransfer: "Bank Transfer",
    bankTransferDesc: "Payment via bank transfer",
    cardNumber: "Card Number",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    expiryDate: "Expiry Date",
    expiryDatePlaceholder: "MM/YY",
    cardholderName: "Cardholder Name",
    cardholderPlaceholder: "NGUYEN VAN A",
    cancel: "Cancel",
    processingPayment: "Processing...",
    payButton: "Pay",

    // Company Management
    companyManagementTitle: "Company Management",
    companyManagementDesc: "Manage companies in the system",
    addCompany: "Add Company",
    totalCompaniesAll: "Total Companies",
    activeStatus: "Active",
    totalVehiclesAll: "Total Vehicles",
    searchByNameEmail: "Search by name, email...",
    activeLabel: "Active",
    suspendedLabel: "Suspended",
    companyColumn: "Company",
    // contactColumn: 'Contact', // DUPLICATE REMOVED
    vehiclesColumn: "Vehicles",
    tripsColumn: "Trips",
    revenueColumn: "Revenue",
    ratingColumn: "Rating",
    // statusColumn: 'Status', // DUPLICATE REMOVED
    // actionsColumn: 'Actions', // DUPLICATE REMOVED
    joinedLabel: "Joined:",
    // viewDetails: 'View Details', // DUPLICATE REMOVED
    editAction: "Edit",
    suspendAction: "Suspend",
    activateAction: "Activate",

    // User Management
    userManagementTitle: "User Management",
    userManagementDesc: "Manage all users in the system",
    totalUsersStats: "Total Users",
    activeUsers: "Active Users",
    bannedUsers: "Banned",
    totalRevenueStats: "Total Revenue",
    searchByNameEmailPhone: "Search by name, email, phone...",
    allRoles: "All Roles",
    userRole: "User",
    companyAdminRoleLabel: "Company Admin",
    bannedStatus: "Banned",
    userNameColumn: "User",
    roleColumn: "Role",
    totalTripsColumn: "Total Trips",
    totalSpentColumn: "Total Spent",
    joinDateColumn: "Join Date",
    banUser: "Ban",
    unbanUser: "Unban",

    // System Dashboard
    systemDashboardTitleAlt: "System Dashboard",
    systemAdminLabel: "System Administrator",
    exportReport: "Export Report",
    totalCompaniesStats: "Total Companies",
    usersStats: "Users",
    totalVehiclesStats: "Total Vehicles",
    monthlyRevenueStats: "Monthly Revenue",
    revenueOverview: "Revenue Overview",
    thisMonth: "This Month",
    thisQuarter: "This Quarter",
    thisYear: "This Year",
    topCompanies: "Top Companies",
    companyNameColumn: "Company Name",

    // Review Management
    reviewManagementTitle: "Review Management",
    publishedReviews: "Published",
    flaggedReviews: "Flagged",

    publishedLabel: "Published",
    hiddenLabel: "Hidden",
    flaggedLabel: "Flagged",
    reviewerColumn: "Reviewer",
    companyRouteColumn: "Company & Route",
    commentColumn: "Comment",

    tripDateLabel: "Trip:",
    likesLabel: "likes",

    // About Page
    aboutDescription:
      "Vietnam's leading online bus ticket booking platform, providing fast, safe and convenient booking experience for millions of passengers",
    routesCount: "Routes",
    partnerCompanies: "Partner Companies",
    yearsExperience: "Years of Experience",
    safetyAndTrust: "Safety & Trust",
    safetyDescription:
      "Committed to ensuring absolute safety for all passengers with a professional driver team",
    dedicatedService: "Dedicated Service",
    dedicatedServiceDescription:
      "Enthusiastic staff, always ready to support you 24/7",
    highQuality: "High Quality",
    highQualityDescription:
      "Modern fleet, full amenities, ensuring the most comfortable trip",
    onTimeDescription:
      "Commitment to depart and arrive on time, respecting your time",
    ourStory: "Our Story",
    ourStoryDesc:
      "VeXe.com was founded with the mission to bring the best bus ticket booking experience to Vietnamese people",
    ourMission: "Our Mission",
    ourMissionDesc:
      "Connecting millions of passengers with reputable bus companies, creating a safe, convenient and transparent transportation ecosystem",
    ourJourney: "Our Journey",
    founded: "Founded",
    foundedDesc: "VeXe.com officially launched in Ho Chi Minh City",
    expansion: "Expansion",
    expansionDesc: "Nationwide coverage with over 200 bus company partners",
    mobileApp: "Mobile App",
    mobileAppDesc: "Launched iOS and Android applications",
    milestone5M: "5 million customers",
    awardDesc: 'Received "Best Booking Platform" award',
    present: "Present",
    presentDesc: "Serving over 10 million customers annually",
    ourTeam: "Our Team",
    ourTeamDesc: "Passionate, dedicated people who are constantly innovating",
    joinUs: "Join Us",
    joinUsDesc: "Be a part of VeXe.com's development journey",

    // Payment Page
    paymentTitle: "Payment",
    paymentSubtitle: "Choose payment method to complete booking",
    tripSummary: "Trip Summary",
    departureDate: "Departure Date",
    selectedSeats: "Selected Seats",
    passengerInfo: "Passenger Information",
    passengerName: "Full Name",
    passengerPhone: "Phone Number",
    passengerEmail: "Email (optional)",
    enterPassengerName: "Enter full name",
    enterPassengerPhone: "Enter phone number",
    enterPassengerEmail: "Enter email",
    pricingDetails: "Pricing Details",
    ticketFare: "Ticket Fare",
    serviceFee: "Service Fee",
    totalPayment: "Total Payment",
    selectPaymentMethod: "Select Payment Method",
    creditCardPayment: "Credit/Debit Card",
    momoPayment: "MoMo Wallet",
    momoPaymentDesc: "Pay via MoMo e-wallet",
    vnpayPayment: "VNPay",
    vnpayPaymentDesc: "Pay via VNPay QR",
    bankPayment: "Bank Transfer",
    bankPaymentDesc: "Direct bank transfer",
    completePayment: "Complete Payment",
    processingPaymentText: "Processing payment...",

    // QR Ticket Page
    qrTicketTitle: "E-Ticket",
    downloadQR: "Download",
    shareQR: "Share",
    printQR: "Print Ticket",
    showQRCode: "Show this QR code when boarding",
    bookingSuccess: "Booking Successful!",
    bookingSuccessDesc: "Your e-ticket is ready",
    importantNotes: "Important Notes",
    note1: "Please arrive at pickup point 15-30 minutes before departure",
    note2: "Present QR code and ID card when boarding",
    note3: "Maximum luggage 20kg (free)",
    note4: "Contact hotline if you need assistance",
    needHelp: "Need Help?",
    contactHotline: "Contact hotline",
    customerCare: "Customer Care",

    // Contact Page
    getInTouch: "Get In Touch",
    getInTouchDesc: "We'd love to hear from you",
    yourName: "Your Name",
    yourEmail: "Your Email",
    yourMessage: "Your Message",
    sendMessageButton: "Send Message",
    sendingMessage: "Sending...",
    contactVia: "Or Contact Via",
    officeAddress: "Office Address",
    workingHours: "Working Hours",
    mondayFriday: "Monday - Friday",
    saturdaySunday: "Saturday - Sunday",
    followUs: "Follow Us",

    // Driver Trip Detail (NEW)
    checkinProgress: "Check-in Progress",
    navigation: "Navigation",
    callDispatch: "Call Dispatch",
    reportIssue: "Report",
    passengerList: "Passenger List",
    seatLabel: "Seat:",
    ticketCodeLabel: "Ticket code:",

    // QR Scanner (NEW)
    scanQRInstruction: "Move camera to QR code on passenger ticket",
    holdSteady: "Hold camera steady to scan",
    enterTicketCode: "Enter Ticket Code",
    enterTicketCodePlaceholder: "Enter ticket code",
    checkinSuccess: "Check-in Successful!",
    invalidTicket: "Invalid ticket",
    pleaseTryAgain: "Please try again",

    // Navigation (NEW)
    speedLabel: "Speed",
    remainingLabel: "Remaining",
    turnRightRoad: "Turn right onto Highway 1A",
    after25km: "After 2.5km",
    reportIncident: "Report Incident",
    callSupport: "Call Support",
    stopPoint: "Stop Point",

    // Earnings (NEW)
    earningsTitle: "Earnings",
    earningsSubtitle: "Manage your earnings and expenses",
    totalEarnings: "Total Earnings",
    baseEarnings: "Base Earnings",
    bonusEarnings: "Bonus & Allowances",
    currencyVND: "VND",

    // Demo Data
    demoUserName: "John Doe",
    demoUserEmail: "johndoe@example.com",
    demoDestination: "Da Lat",

    // Additional Missing Keys
    manualEntry: "Manual Entry",
    confirm: "Confirm",
    onBoard: "On Board",
    notCheckedIn: "Not Checked In",

    // Driver Applications (System Admin)
    driverApplicationsTitle: "Driver Applications",
    driverApplicationsSubtitle: "Manage and approve new driver registrations",
    exportExcel: "Export Excel",
    totalApplications: "Total Applications",
    pendingApplications: "Pending",
    approvedApplications: "Approved",
    rejectedApplications: "Rejected",
    searchApplications: "Search by name, phone number, email...",
    driverColumn: "Driver",
    contactColumn: "Contact",
    documentsColumn: "Documents",
    submitDateColumn: "Submit Date",
    viewDetails: "View Details",
    approve: "Approve",
    reject: "Reject",
    addNoteOptional: "Add note (optional):",
    approveSuccess:
      "Application approved! The driver will receive a notification email.",
    rejectSuccess:
      "Application rejected! A notification email has been sent to the driver.",
    enterRejectReason: "Enter rejection reason:",
    licenseNumber: "License Number",
    experience: "Experience",
    years: "years",
    applicationDetails: "Application Details",
    applicantInfo: "Applicant Information",
    licenseInfo: "License Information",
    experienceYears: "Years of Experience",
    viewLicense: "View License",
    adminNotes: "Admin Notes",
    addNote: "Add Note",
    approveApplication: "Approve",
    rejectApplication: "Reject",
    noApplicationsFound: "No applications found",
    tryChangeFilter: "Try changing the filter or search keyword",
    applicationCode: "Application Code",
    personalInfo: "Personal Information",
    fullNameLabel: "Full Name",
    usernameLabel: "Username",
    phoneNumberLabel: "Phone Number",
    addressLabel: "Address",
    professionalInfo: "Professional Information",
    licenseImageLabel: "Driver License Image",
    notesLabel: "Notes",
    statusColumn: "Status",
    actionsColumn: "Actions",
    noTripsFound: "Sorry, no trips found",
    changeSearch: "Change Search",
    noMatchingRoutes: "No matching routes found",

    // Demo Login
    demoLoginInstruction: "Enter any username and password to login",
    demoExample: "Example: admin / password",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function isLanguage(v: unknown): v is Language {
  return v === "vi" || v === "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  // Load from localStorage (client-only) + set <html lang="">
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const lang: Language = isLanguage(saved) ? saved : "vi";

    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next: Language = prev === "vi" ? "en" : "vi";

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
      }
      document.documentElement.lang = next;

      return next;
    });
  };

  const t = (key: string): string => {
    const dict = translations[language];
    const fallback = translations.vi;

    // Use ?? so we don't "swallow" empty strings
    return dict[key] ?? fallback[key] ?? key;
  };

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
