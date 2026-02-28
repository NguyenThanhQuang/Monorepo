import { Easing } from "react-native-reanimated";

export const MOTION = {
  duration: {
    fast: 180,
    normal: 260,
    slow: 420,
    slower: 520,
  },
  easing: {
    standard: Easing.bezier(0.2, 0.0, 0, 1),  // Material-ish
    emphasized: Easing.bezier(0.2, 0.9, 0.2, 1),
    inOut: Easing.inOut(Easing.quad),
  },
} as const;
