import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnimatedPressable from "./AnimatedPressable";
import { COLORS, withOpacity, SPACING, TYPOGRAPHY, LAYOUT } from "../../theme";

export default function SectionHeader({
  title,
  subtitle,
  onRefresh,
  onViewAll,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      </View>

      <View style={styles.actions}>
        {!!onRefresh && (
          <AnimatedPressable style={styles.iconBtn} onPress={onRefresh} hitSlop={10}>
            <Ionicons name="refresh" size={18} color={COLORS.primary.main} />
          </AnimatedPressable>
        )}

        {!!onViewAll && (
          <AnimatedPressable style={styles.viewAll} onPress={onViewAll} hitSlop={10}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </AnimatedPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: "900",
  },
  sub: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    color: withOpacity(COLORS.text.secondary, 0.92),
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(COLORS.primary.light, 0.16),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.6),
  },
  viewAll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.primary.main,
  },
  viewAllText: {
    color: COLORS.text.inverse,
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
