import { Platform } from "react-native";
import { COLORS } from "./colors";

// Modern shadow system (soft + clean)
export const SHADOWS = {
  // Light shadows (subtle UI)
  light: {
    small: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),

    medium: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),

    large: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },

  // Medium shadows (cards / dropdowns)
  medium: {
    small: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),

    medium: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 22,
      },
      android: { elevation: 6 },
    }),

    large: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.12,
        shadowRadius: 30,
      },
      android: { elevation: 10 },
    }),
  },

  // Heavy shadows (modals)
  heavy: {
    small: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 28,
      },
      android: { elevation: 12 },
    }),

    medium: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 42,
      },
      android: { elevation: 18 },
    }),

    large: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 26 },
        shadowOpacity: 0.18,
        shadowRadius: 56,
      },
      android: { elevation: 24 },
    }),
  },

  // Special shadows (semantic)
  special: {
    // Floating action button
    fab: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),

    // Modal
    modal: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 24 },
        shadowOpacity: 0.18,
        shadowRadius: 56,
      },
      android: { elevation: 24 },
    }),

    // Card
    card: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: { elevation: 3 },
    }),

    // Button
    button: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 18,
      },
      android: { elevation: 0 },
    }),

    // Header (very subtle)
    header: Platform.select({
      ios: {
        shadowColor: COLORS.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
} as const;

// Shadow utility functions
export const getShadow = (
  type: keyof typeof SHADOWS,
  size: keyof typeof SHADOWS.light
) => {
  if (type === "light" || type === "medium" || type === "heavy") {
    return SHADOWS[type][size];
  }
  return SHADOWS.light.small;
};

export const getSpecialShadow = (type: keyof typeof SHADOWS.special) => {
  return SHADOWS.special[type];
};

// Common shadow combinations
export const COMMON_SHADOWS = {
  card: SHADOWS.special.card,
  button: SHADOWS.special.button,
  header: SHADOWS.special.header,
  fab: SHADOWS.special.fab,
  modal: SHADOWS.special.modal,

  elevation1: SHADOWS.light.small,
  elevation2: SHADOWS.light.medium,
  elevation4: SHADOWS.light.large,
  elevation8: SHADOWS.medium.medium,
  elevation16: SHADOWS.heavy.medium,
  elevation24: SHADOWS.heavy.large,
} as const;

// Create custom shadow
export const createShadow = (
  elevation: number,
  shadowColor: string = COLORS.neutral.black,
  shadowOpacity: number = 0.10
) => {
  if (Platform.OS === "ios") {
    const height = Math.max(1, Math.round(elevation * 0.5));
    const radius = Math.max(8, Math.round(elevation * 1.25));
    return {
      shadowColor,
      shadowOffset: { width: 0, height },
      shadowOpacity,
      shadowRadius: radius,
    };
  }
  return { elevation };
};

// Remove shadow
export const NO_SHADOW = Platform.select({
  ios: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  android: { elevation: 0 },
});
