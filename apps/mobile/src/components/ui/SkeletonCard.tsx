import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { COLORS, withOpacity, SPACING } from "../../theme";

export default function SkeletonCard({ width = 332 }: { width?: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const shimmer = useAnimatedStyle(() => {
    const o = interpolate(t.value, [0, 1], [0.35, 0.75]);
    return { opacity: o };
  });

  return (
    <View style={[styles.card, { width }]}>
      <Animated.View style={[styles.block, { width: 44, height: 44, borderRadius: 14 }, shimmer]} />
      <Animated.View style={[styles.line, { width: "75%" }, shimmer]} />
      <Animated.View style={[styles.line, { width: "55%" }, shimmer]} />
      <Animated.View style={[styles.line, { width: "90%", marginTop: SPACING.md }, shimmer]} />
      <Animated.View style={[styles.line, { width: "70%" }, shimmer]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    marginRight: SPACING.md,
  },
  block: {
    backgroundColor: withOpacity(COLORS.text.secondary, 0.12),
    marginBottom: SPACING.md,
  },
  line: {
    height: 12,
    borderRadius: 8,
    backgroundColor: withOpacity(COLORS.text.secondary, 0.12),
    marginBottom: SPACING.sm,
  },
});
