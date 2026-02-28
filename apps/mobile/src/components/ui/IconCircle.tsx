import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { COLORS, withOpacity, LAYOUT } from "../../theme";

export default function IconCircle({
  children,
  size = 44,
  bg,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  bg?: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg ?? withOpacity(COLORS.primary.light, 0.18),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.6),
    shadowColor: COLORS.primary.main,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});
