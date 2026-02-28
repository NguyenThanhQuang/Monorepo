import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../ui/AppCard";
import AnimatedPressable from "../ui/AnimatedPressable";
import { COLORS, withOpacity, SPACING, TYPOGRAPHY } from "../../theme";

type Action = {
  key: string;
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  accent?: boolean;
};

export default function QuickActions({ actions = [] }: { actions?: Action[] }) {
  const { width } = useWindowDimensions();

  const cardWidth = useMemo(() => {
    const container = width - SPACING.lg * 2;
    const gap = SPACING.md;
    return (container - gap) / 2;
  }, [width]);

  return (
    <View style={styles.grid}>
      {actions.map((a, idx) => {
        const isLeft = idx % 2 === 0;

        return (
          <AppCard
            key={a.key}
            style={[
              styles.card,
              { width: cardWidth },
              isLeft ? { marginRight: SPACING.md } : null,
              a.accent ? styles.accentCard : null,
            ]}
          >
            <AnimatedPressable
              onPress={a.onPress}
              style={styles.press}
              scaleTo={0.985}
            >
              <View
                style={[
                  styles.iconPill,
                  {
                    backgroundColor: withOpacity(
                      a.color,
                      a.accent ? 0.16 : 0.12
                    ),
                    borderColor: withOpacity(a.color, 0.22),
                  },
                ]}
              >
                <Ionicons name={a.icon} size={20} color={a.color} />
              </View>

              <View style={styles.textBlock}>
                <Text style={styles.label} numberOfLines={1}>
                  {a.label}
                </Text>

                {!!a.subtitle && (
                  <Text style={styles.sub} numberOfLines={1}>
                    {a.subtitle}
                  </Text>
                )}
              </View>

              {/* ✅ Chevron nằm trong row => auto center, không lệch */}
              <Ionicons
                name="chevron-forward"
                size={16}
                color={withOpacity(COLORS.text.secondary, 0.45)}
                style={styles.chev}
              />
            </AnimatedPressable>
          </AppCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },

  card: {
    overflow: "hidden",
    marginBottom: SPACING.md,
  },

  accentCard: {
    borderColor: withOpacity(COLORS.primary.main, 0.22),
  },

  // ✅ press chính là row container luôn
  press: {
    padding: SPACING.md,
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center", // ✅ canh giữa icon + text + chevron
  },

  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  textBlock: {
    flex: 1,
    marginLeft: SPACING.sm,
    // ❌ bỏ paddingRight vì chevron không absolute nữa
  },

  label: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  sub: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "800",
    color: withOpacity(COLORS.text.secondary, 0.8),
  },

  // ✅ chỉ cần marginLeft để tách khỏi text
  chev: {
    marginLeft: SPACING.sm,
  },
});
