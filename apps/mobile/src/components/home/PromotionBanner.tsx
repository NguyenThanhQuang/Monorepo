import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AnimatedPressable from "../ui/AnimatedPressable";
import { COLORS, withOpacity, SPACING, TYPOGRAPHY, LAYOUT, COMMON_SHADOWS } from "../../theme";

export default function PromotionBanner() {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, marginBottom: SPACING["2xl"] }}>
      <Text style={styles.title}>Khuyến mãi</Text>

      <AnimatedPressable style={styles.wrap} onPress={() => {}}>
        <LinearGradient
          colors={["#ff6b6b", "#ee5a52"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.grad}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.big}>Giảm 20%</Text>
            <Text style={styles.sub}>Cho chuyến xe đầu tiên</Text>
            <View style={styles.codePill}>
              <Text style={styles.code}>Mã: WELCOME20</Text>
            </View>
          </View>

          <Ionicons name="gift" size={44} color="white" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...TYPOGRAPHY.h3, fontWeight: "900", color: COLORS.text.primary, marginBottom: SPACING.md },
  wrap: {
    borderRadius: LAYOUT.borderRadius.xl,
    overflow: "hidden",
    ...COMMON_SHADOWS.elevation4,
  },
  grad: {
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  big: { ...TYPOGRAPHY.h2, fontWeight: "900", color: "white" },
  sub: { ...TYPOGRAPHY.body2, fontWeight: "800", color: withOpacity(COLORS.neutral.white, 0.92), marginTop: 4 },
  codePill: {
    marginTop: SPACING.sm,
    alignSelf: "flex-start",
    backgroundColor: withOpacity(COLORS.neutral.white, 0.2),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  code: { ...TYPOGRAPHY.body3, fontWeight: "900", color: "white" },
});
