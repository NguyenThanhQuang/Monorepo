import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { COLORS, withOpacity, COMMON_SHADOWS, LAYOUT } from "../../theme";

export default function AppCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: LAYOUT.borderRadius.xl,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    // shadow nhẹ cho “premium”
    ...(COMMON_SHADOWS.elevation1 ?? COMMON_SHADOWS.card),
  },
});
