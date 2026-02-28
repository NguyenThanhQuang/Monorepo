import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  createAnimatedComponent,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MOTION } from "../../theme";

import AnimatedPressable from "../ui/AnimatedPressable";
import { COLORS, withOpacity, SPACING, TYPOGRAPHY, COMMON_SHADOWS } from "../../theme";

const ALinear = createAnimatedComponent(LinearGradient);

export default function HomeHeader({
  name,
  onProfile,
}: {
  name: string;
  onProfile: () => void;
}) {
  const t = useSharedValue(0);
  const o = useSharedValue(0);
  const y = useSharedValue(-12);

useEffect(() => {
  o.value = withTiming(1, { duration: MOTION.duration.slow, easing: MOTION.easing.standard });
  y.value = withTiming(0, { duration: MOTION.duration.slow, easing: MOTION.easing.standard });

  t.value = withRepeat(
    withTiming(1, { duration: 5600, easing: MOTION.easing.inOut }),
    -1,
    true
  );
}, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }],
  }));

  const blob = (dx1: number, dx2: number, dy1: number, dy2: number, s1: number, s2: number) =>
    useAnimatedStyle(() => {
      const x = interpolate(t.value, [0, 1], [dx1, dx2]);
      const yy = interpolate(t.value, [0, 1], [dy1, dy2]);
      const ss = interpolate(t.value, [0, 1], [s1, s2]);
      return { transform: [{ translateX: x }, { translateY: yy }, { scale: ss }] as any };
    });

  const b1 = blob(18, -10, -10, 18, 1, 1.08);
  const b2 = blob(-18, 12, 12, -8, 1, 1.06);
  const b3 = blob(8, -14, 14, 2, 1, 1.04);

  return (
    <Animated.View style={headerStyle}>
      <ALinear
        colors={[COLORS.primary.dark, COLORS.primary.main, "#0B1220"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Animated.View style={[styles.glow1, { backgroundColor: withOpacity(COLORS.primary.light, 0.28) }, b1 as any]} />
        <Animated.View style={[styles.glow2, { backgroundColor: withOpacity(COLORS.neutral.white, 0.12) }, b2 as any]} />
        <Animated.View style={[styles.glow3, { backgroundColor: withOpacity(COLORS.primary.main, 0.18) }, b3 as any]} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>Chào mừng trở lại, {name}!</Text>
            <Text style={styles.sub}>Khám phá chuyến xe phù hợp với bạn</Text>
          </View>

          <AnimatedPressable onPress={onProfile} scaleTo={0.96} hitSlop={12}>
            <Ionicons name="person-circle" size={52} color="white" />
          </AnimatedPressable>
        </View>
      </ALinear>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING["2xl"],
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    ...COMMON_SHADOWS.header,
  },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  welcome: { ...TYPOGRAPHY.h2, color: COLORS.text.inverse, fontWeight: "900" },
  sub: { ...TYPOGRAPHY.body2, color: withOpacity(COLORS.neutral.white, 0.92), fontWeight: "700", marginTop: 6 },

  glow1: { position: "absolute", right: -90, top: -80, width: 240, height: 240, borderRadius: 999 },
  glow2: { position: "absolute", left: -120, bottom: -150, width: 320, height: 320, borderRadius: 999 },
  glow3: { position: "absolute", left: 90, top: 70, width: 170, height: 170, borderRadius: 999 },
});
