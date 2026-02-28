import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../ui/AppCard";
import AnimatedPressable from "../ui/AnimatedPressable";
import { COLORS, withOpacity, SPACING, TYPOGRAPHY } from "../../theme";
import FadeInUp from "../ui/FadeInUp";

type RouteItem = {
  key: string;
  title: string;
  priceText: string;
  color: string;
  onPress: () => void;
};

export default function PopularRoutes({
  routes = [],
}: {
  routes?: RouteItem[];
}) {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.lg }}>
      <Text style={styles.title}>Tuyến đường phổ biến</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: SPACING.lg }}
      >
        {routes.map((r, idx) => (
          <FadeInUp key={r.key} delay={80 + idx * 70} distance={10}>
            <AppCard style={styles.card}>
              <AnimatedPressable onPress={r.onPress} style={styles.press}>
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: withOpacity(r.color, 0.12) },
                  ]}
                >
                  <Ionicons name="bus" size={18} color={r.color} />
                </View>

                <Text style={styles.route} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text
                  style={[styles.price, { color: r.color }]}
                  numberOfLines={1}
                >
                  {r.priceText}
                </Text>
              </AnimatedPressable>
            </AppCard>
          </FadeInUp>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  card: { width: 210, marginRight: SPACING.md, overflow: "hidden" },
  press: { padding: SPACING.md, gap: 8 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.7),
  },
  route: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.text.primary },
  price: { ...TYPOGRAPHY.body3, fontWeight: "900" },
});
