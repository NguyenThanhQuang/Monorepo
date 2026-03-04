export const BUSINESS_CONSTANTS = {
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
  REGEX: {
    MONGO_ID: /^[0-9a-fA-F]{24}$/,
  },
} as const;

export const AUTH_CONSTANTS = {
  PASSWORD_STRONG_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  VN_PHONE_REGEX: /((09|03|07|08|05)+([0-9]{8})\b)/g,

  REGEX: {
    MONGO_ID: /^[0-9a-fA-F]{24}$/,
  },

  DEFAULTS: {
    EMAIL_VERIFICATION_EXPIRATION_MS: 86400000,
    PASSWORD_RESET_EXPIRATION_MS: 3600000,
    JWT_EXPIRATION_TIME: "7d",
    MIN_PASSWORD_LENGTH: 6,
    MIN_NEW_PASSWORD_LENGTH: 8,
  },
} as const;

export const BUS_PRESETS = [
  { label: "Xe Limousine 9 chỗ", type: "Limousine", f: 1, r: 4, c: 3, a: [2] },
  {
    label: "Xe ghế ngồi 16 chỗ (Ford Transit)",
    type: "Ghế ngồi",
    f: 1,
    r: 5,
    c: 4,
    a: [2],
  },
  {
    label: "Xe ghế ngồi 29 chỗ (Samco)",
    type: "Ghế ngồi",
    f: 1,
    r: 7,
    c: 5,
    a: [3],
  },
  {
    label: "Xe Giường nằm 34 phòng (VIP)",
    type: "Giường nằm VIP",
    f: 2,
    r: 6,
    c: 3,
    a: [2],
  },
  {
    label: "Xe Giường nằm 40 chỗ (Thaco)",
    type: "Giường nằm",
    f: 2,
    r: 7,
    c: 3,
    a: [2],
  },
  {
    label: "Xe Giường nằm 44 chỗ phổ thông",
    type: "Giường nằm",
    f: 2,
    r: 8,
    c: 3,
    a: [2],
  },
];
