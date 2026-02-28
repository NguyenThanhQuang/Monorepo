// Color palette for the entire app (Modern Tech)
export const COLORS = {
  primary: {
    main: "#2563EB",
    light: "#60A5FA",
    dark: "#1D4ED8",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#10B981",
    light: "#6EE7B7",
    dark: "#059669",
    contrast: "#FFFFFF",
  },
  success: {
    main: "#10B981",
    light: "#6EE7B7",
    dark: "#059669",
    contrast: "#FFFFFF",
  },
  warning: {
    main: "#F59E0B",
    light: "#FCD34D",
    dark: "#D97706",
    contrast: "#111827",
  },
  error: {
    main: "#EF4444",
    light: "#FCA5A5",
    dark: "#DC2626",
    contrast: "#FFFFFF",
  },
  info: {
    main: "#3B82F6",
    light: "#93C5FD",
    dark: "#2563EB",
    contrast: "#FFFFFF",
  },
  neutral: {
    white: "#FFFFFF",
    black: "#000000",
    gray50: "#F8FAFC",
    gray100: "#F1F5F9",
    gray200: "#E2E8F0",
    gray300: "#CBD5E1",
    gray400: "#94A3B8",
    gray500: "#64748B",
    gray600: "#475569",
    gray700: "#334155",
    gray800: "#1F2937",
    gray900: "#0F172A",
  },
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    disabled: "#94A3B8",
    inverse: "#FFFFFF",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F4F7FF",
    tertiary: "#F8FAFF",
    overlay: "rgba(2, 6, 23, 0.55)",
  },
  border: {
    light: "#E6EAF5",
    medium: "#CBD5E1",
    dark: "#94A3B8",
  },
  status: {
    active: "#10B981",
    inactive: "#94A3B8",
    pending: "#F59E0B",
    cancelled: "#EF4444",
    completed: "#3B82F6",
  },
  bus: {
    available: "#10B981",
    occupied: "#EF4444",
    selected: "#2563EB",
    disabled: "#94A3B8",
  },
  company: {
    phuongTrang: "#DB2777",
    maiLinh: "#7C3AED",
    thanhBuoi: "#2563EB",
    hoangLong: "#0EA5E9",
    saoViet: "#F59E0B",
  },
} as const;

export const withOpacity = (color: string, opacity: number): string => {
  'worklet';

  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};
