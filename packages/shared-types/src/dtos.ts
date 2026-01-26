import {
  CompanyStatus,
  LocationType,
  ReportPeriod,
  UserRole,
  VehicleStatus,
} from "./enums";
import { Company, GeoJsonPoint } from "./models";

// --- AUTH INFRASTRUCTURE ---
export interface JwtPayload {
  sub: string; // UserId
  email: string;
  roles: UserRole[];
  companyId?: string;
}

// Interface đại diện User sau khi Login/GetProfile (Sanitized)
export interface AuthUserResponse {
  id: string; // Chuyển đổi từ _id
  userId: string; // Legacy support
  email: string;
  name: string;
  phone: string;
  roles: UserRole[];
  companyId?: string;
  isEmailVerified: boolean;
  lastLoginDate?: Date;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserResponse;
}

// --- AUTH REQUEST PAYLOADS ---

export interface RegisterPayload {
  email: string;
  phone: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  identifier: string; // Email or Phone
  password: string;
}

export interface ResendVerificationEmailPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ActivateAccountPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Response cho các API xác thực token (Reset pass, verify email...)
export interface TokenValidationResponse {
  isValid: boolean;
  message?: string;
  email?: string; // cho reset pass
  userName?: string; // cho activate account
  companyName?: string; // cho activate account
}

// --- LOCATIONS ---

export interface CreateLocationPayload {
  name: string;
  province: string;
  district?: string;
  fullAddress: string;
  location: GeoJsonPoint;
  type: LocationType;
  images?: string[];
  isActive?: boolean;
}

export interface UpdateLocationPayload extends Partial<CreateLocationPayload> {}

export interface LocationResponse extends Location {}

export interface SearchLocationQuery {
  keyword?: string; // Search theo name hoặc province
  type?: LocationType;
  province?: string;
}

export interface PopularLocationsQuery {
  limit?: number;
}

// --- REQUEST PAYLOADS ---

// Admin tạo User sẽ nhiều quyền hơn User tự Register
export interface CreateUserPayload {
  email: string;
  phone: string;
  password: string; // Có thể optional nếu là luồng invite (tạo password sau)
  name: string;
  role?: UserRole; // Legacy DTO allows singular 'role' assignment
  companyId?: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
}

export interface UpdateUserStatusPayload {
  isBanned: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Dùng chung CreateOrPromote cho Company Admin logic
export interface CreateCompanyAdminPayload {
  name: string;
  email: string;
  phone: string;
  companyId: string;
}

// --- RESPONSES ---

// Response này giống hệt AuthUserResponse (tên mới SanitizedUserResponse cho chuẩn nghĩa)
export interface SanitizedUserResponse {
  id: string;
  _id: string; // Legacy support
  email: string;
  name: string;
  phone: string;
  roles: UserRole[];
  companyId?: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  lastLoginDate?: Date;
    createdAt: Date; // ⬅️ bắt buộc

  totalTrips?: number;
  totalSpent?: number;
}

// COMPANIES

export interface CreateCompanyPayload {
  // Thông tin nhà xe
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  logoUrl?: string;
  status?: CompanyStatus;

  // Thông tin Admin ban đầu (Onboarding)
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

// UpdatePayload: Loại bỏ thông tin Admin vì API update company chỉ sửa thông tin công ty
export interface UpdateCompanyPayload extends Partial<
  Omit<CreateCompanyPayload, "adminName" | "adminEmail" | "adminPhone">
> {}

export interface CompanyResponse extends Company {}

// DTO trả về cho Dashboard có thống kê
export interface CompanyStatsResponse extends CompanyResponse {
  totalTrips: number;
  totalRevenue: number;
  averageRating: number | null;
}

// --- MAIL PAYLOADS ---

// Payload chung cho ngữ cảnh Email
export interface EmailContext {
  appName: string; // VD: "Online Bus Ticket Platform"
  verifyTokenUrl?: string; // Link full xác thực
  resetPasswordUrl?: string;
  loginUrl?: string; // Link đăng nhập
  expireText?: string; // VD: "24 giờ"
}

export interface SendVerificationEmailPayload {
  email: string;
  name: string;
  token: string;
}

export interface SendForgotPasswordPayload {
  email: string;
  name: string;
  token: string;
}

export interface SendCompanyAdminActivationPayload {
  email: string;
  name: string;
  token: string;
}

export interface SendCompanyAdminPromotionPayload {
  email: string;
  name: string;
  companyName: string;
}

// Chuyển BookingDocument thành Plain Object để gửi mail an toàn
export interface BookingConfirmationEmailPayload {
  customerName: string;
  email: string;
  ticketCode: string;
  routeName: string; // VD: "Hà Nội → Đà Nẵng" (Đã format từ ngoài)
  companyName: string;
  departureTime: string; // Dạng string hiển thị: "10:00 20/01/2024"
  seatNumbers: string; // VD: "A01, A02"
  totalAmount: string; // VD: "500.000" (Đã format tiền)
}

export interface MailContentResult {
  subject: string;
  html: string;
}

// Notifications
export interface UserEventPayload {
  email: string;
  name: string;
  token: string;
}

export interface CreateVehiclePayload {
  companyId: string;
  vehicleNumber: string;
  type: string;
  description?: string;
  status?: VehicleStatus;

  // Configuration params để generate map
  floors: number; // 1 or 2
  seatRows: number; // > 0
  seatColumns: number; // > 0
  aislePositions?: number[]; // [2] -> Cột 2 là lối đi
}

export interface UpdateVehiclePayload {
  // Cho phép sửa các thông số này, Service sẽ phải regen map nếu thay đổi
  vehicleNumber?: string;
  type?: string;
  description?: string;
  status?: VehicleStatus;

  floors?: number;
  seatRows?: number;
  seatColumns?: number;
  aislePositions?: number[];

  // Không cho sửa companyId trực tiếp (Logic check role riêng)
}

// Response tái sử dụng Model Vehicle vì shape khớp 1-1

import { SeatStatus, TripStatus } from "./enums";

export interface TripStopDto {
  locationId: string;
  expectedArrivalTime: string; // ISO Date String
  expectedDepartureTime?: string;
}

export interface CreateTripPayload {
  companyId: string;
  vehicleId: string;

  route: {
    fromLocationId: string;
    toLocationId: string;
    stops?: TripStopDto[];
  };

  departureTime: string; // ISO
  expectedArrivalTime: string; // ISO
  price: number;

  isRecurrenceTemplate?: boolean; // Nếu true -> Dùng làm mẫu để sinh daily trip
}

export interface UpdateTripPayload {
  price?: number;
  status?: TripStatus;
  departureTime?: string;
  expectedArrivalTime?: string;
  isRecurrenceActive?: boolean;
}

// Payload query tìm chuyến đi
export interface SearchTripQuery {
  from: string; // Tên tỉnh/thành hoặc ID (thường là ID sẽ chuẩn hơn, nhưng public thì text)
  to: string;
  date: string; // YYYY-MM-DD
  passengers?: number; // Mặc định 1
}

export interface UpdateTripSeatStatusPayload {
  seatNumbers: string[];
  status: SeatStatus;
  bookingId?: string;
}

// Interface rút gọn dùng cho Input
export interface PassengerInput {
  name: string;
  phone: string;
  seatNumber: string;
}

export interface CreateBookingPayload {
  tripId: string;
  passengers: PassengerInput[];

  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

// Payload lookup đơn giản (tra cứu vé khách vãng lai)
export interface LookupBookingPayload {
  identifier: string; // Ticket Code hoặc Order ID
  contactPhone: string;
}

// Payload confirm manual (ví dụ Admin confirm)
export interface ConfirmBookingPayload {
  paidAmount: number;
  paymentMethod: string;
  transactionDateTime: string;
}

// Request tạo link
export interface CreatePaymentLinkPayload {
  bookingId: string;
}

// Response từ Server về Client (chứa link checkout)
export interface PaymentLinkResponse {
  checkoutUrl: string;
  orderCode: number;
  qrCode?: string;
}

// Sub-structure của Webhook
export interface PayOSWebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  virtualAccountNumber?: string;
}

// Main Webhook DTO
export interface PayOSWebhookPayload {
  code: string; // "00"
  desc: string;
  success: boolean;
  data: PayOSWebhookData;
  signature: string;
}

// Requests
export interface CreateReviewPayload {
  bookingId: string;
  tripId: string; // Thực tế tripId có thể suy ra từ booking, nhưng truyền lên để validate cho chắc
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

export interface CreateGuestReviewPayload extends CreateReviewPayload {
  contactPhone: string; // Để verify sở hữu với Booking contactPhone
}

export interface UpdateUserReviewPayload {
  rating?: number;
  comment?: string;
}

export interface ReviewQuery {
  companyId?: string;
  tripId?: string;
  rating?: number;
  // Page limit handling is common utils
}

// Admin Update (Hide/Show)
export interface AdminUpdateReviewPayload {
  isVisible: boolean;
}

// Requests
export interface FinanceReportQuery {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  companyId?: string; // Dùng cho Admin lọc
}

// Chart Data Elements
export interface ChartDataPoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  bookings: number;
}

export interface TopCompanyStat {
  name: string;
  revenue: number;
  bookings: number;
}

// Responses
export interface AdminDashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  newCompaniesToday: number;
  todayBookings: number;
}

export interface FinancialReportResponse {
  overview: {
    totalRevenue: number;
    periodRevenue: number;
    totalBookings: number;
    averageOrderValue: number;
    commission: number;
    refunds: number;
  };
  revenueChartData: ChartDataPoint[];
  topCompanies: TopCompanyStat[];
  recentTransactions: PaymentTransactionSummary[];
}

export interface PaymentTransactionSummary {
  id: string;
  date: string;
  type: "booking" | "commission" | "refund";
  amount: number;
  description: string;
  companyName: string;
}

// Shared Geo Structures
export interface GeoPoint {
  lat: number;
  lng: number;
}

// Request Payload
export interface CalculateRoutePayload {
  waypoints: GeoPoint[]; // Mảng các điểm đi qua (bao gồm origin ở 0 và dest ở cuối)
}

// Normalized Response (Dù dùng OSRM hay Google thì kết quả trả về cũng phải format này)
export interface RouteInfoResponse {
  polyline: string; // Chuỗi mã hóa đường đi
  duration: number; // Giây
  distance: number; // Mét
}
