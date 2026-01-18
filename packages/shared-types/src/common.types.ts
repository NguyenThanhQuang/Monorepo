/**
 * Chuẩn hóa format trả về cho toàn bộ API
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Các hằng số hệ thống dùng chung (Configuration)
 */
export const APP_CONSTANTS = {
  BOOKING: {
    SEAT_HOLD_DURATION_MINUTES: 15,
    MAX_SEATS_PER_BOOKING: 5,
  },
  REVIEW: {
    EDIT_WINDOW_DAYS: 7,
  },
  PAYMENT: {
    DEFAULT_CURRENCY: "VND",
    TRANSACTION_TIMEOUT_SECONDS: 600,
  },
  SYSTEM: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
} as const;

export type AppConstants = typeof APP_CONSTANTS;

// Enum/Const cho việc sorting
export const SORT_ORDER = {
  ASC: 1,
  DESC: -1,
} as const;
