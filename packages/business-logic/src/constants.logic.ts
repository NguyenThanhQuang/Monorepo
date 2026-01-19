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
