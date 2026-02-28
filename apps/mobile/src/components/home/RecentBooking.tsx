import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../ui/AppCard";
import AnimatedPressable from "../ui/AnimatedPressable";
import { COLORS, SPACING, TYPOGRAPHY } from "../../theme";

export default function RecentBooking({ onPress }: { onPress: () => void }) {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
      <Text style={styles.title}>Đặt vé gần đây</Text>

      <AppCard style={{ overflow: "hidden" }}>
        <AnimatedPressable onPress={onPress} style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="bus" size={20} color={COLORS.primary.main} />
            <Text style={styles.route}>Hà Nội → TP. HCM</Text>
          </View>

          <Text style={styles.date}>Ngày 15/12/2024</Text>
          <Text style={styles.status}>Đã xác nhận</Text>
        </AnimatedPressable>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...TYPOGRAPHY.h3, fontWeight: "900", color: COLORS.text.primary, marginBottom: SPACING.md },
  card: { padding: SPACING.md, gap: 6 },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  route: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.text.primary },
  date: { ...TYPOGRAPHY.body3, fontWeight: "800", color: COLORS.text.secondary },
  status: { ...TYPOGRAPHY.body3, fontWeight: "900", color: COLORS.success.main },
});
