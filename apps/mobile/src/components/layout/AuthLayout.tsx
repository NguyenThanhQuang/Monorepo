import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
  createAnimatedComponent,
} from "react-native-reanimated";

import AppFormMessage from "@/components/ui/AppFormMessage";
import type { FormMessageVariant } from "@/components/ui/AppFormMessage";

import { COLORS, withOpacity } from "../../theme/colors";
import { SPACING, TYPOGRAPHY, LAYOUT, COMMON_SHADOWS } from "@/theme";

const { height, width } = Dimensions.get("window");
const AnimatedLinearGradient = createAnimatedComponent(LinearGradient);

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;

  /** optional: extra style for the children container inside the card */
  cardContentStyle?: ViewStyle;

  /** ✅ optional: show form message inside card */
  message?: string | null;
  messageVariant?: FormMessageVariant;
  onCloseMessage?: () => void;
  messageStyle?: any;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  message,
  messageVariant = "error",
  onCloseMessage,
  messageStyle,
  cardContentStyle,
}: Props) {
  // entrance
  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(-18);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(18);

  // ambient animation
  const t = useSharedValue(0);

  const glow1Bg = useMemo(() => withOpacity(COLORS.primary.light, 0.35), []);
  const glow2Bg = useMemo(() => withOpacity(COLORS.neutral.white, 0.14), []);
  const glow3Bg = useMemo(() => withOpacity(COLORS.primary.main, 0.18), []);

  const cardBorderColors = useMemo(
    () =>
      [
        withOpacity(COLORS.primary.light, 0.42),
        withOpacity(COLORS.neutral.white, 0.06),
        withOpacity(COLORS.primary.main, 0.18),
      ] as const,
    [],
  );

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 420 });
    heroY.value = withTiming(0, { duration: 420 });

    cardOpacity.value = withTiming(1, { duration: 520 });
    cardY.value = withSpring(0, { damping: 16, stiffness: 140 });

    // loop ambient
    t.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }] as any,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }] as any,
  }));

  const blob1Style = useAnimatedStyle(() => {
    const x = interpolate(t.value, [0, 1], [20, -10]);
    const y = interpolate(t.value, [0, 1], [-10, 18]);
    const s = interpolate(t.value, [0, 1], [1, 1.08]);

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale: s }] as any,
    };
  });

  const blob2Style = useAnimatedStyle(() => {
    const x = interpolate(t.value, [0, 1], [-18, 14]);
    const y = interpolate(t.value, [0, 1], [10, -8]);
    const s = interpolate(t.value, [0, 1], [1, 1.06]);

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale: s }] as any,
    };
  });

  const blob3Style = useAnimatedStyle(() => {
    const x = interpolate(t.value, [0, 1], [10, -16]);
    const y = interpolate(t.value, [0, 1], [14, 2]);
    const s = interpolate(t.value, [0, 1], [1, 1.04]);

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale: s }] as any,
    };
  });

  const highlightStyle = useAnimatedStyle(() => {
    const a = interpolate(t.value, [0, 1], [0.12, 0.22]);
    return { opacity: a };
  });

  return (
    <View>
      <Animated.View style={heroStyle}>
        <AnimatedLinearGradient
          colors={[COLORS.primary.dark, COLORS.primary.main, "#0B1220"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Ambient blobs */}
          <Animated.View style={[styles.glow1, { backgroundColor: glow1Bg }, blob1Style]} />
          <Animated.View style={[styles.glow2, { backgroundColor: glow2Bg }, blob2Style]} />
          <Animated.View style={[styles.glow3, { backgroundColor: glow3Bg }, blob3Style]} />

          {/* Soft highlight line */}
          <Animated.View style={[styles.heroHighlight, highlightStyle]} />

          <View style={styles.topRow}>
            <View style={styles.logo}>
              <Ionicons name="bus" size={30} color={COLORS.text.inverse} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>Online Bus Ticket Platform</Text>
              <View style={styles.chip}>
                <Text style={styles.chipText}>An toàn • Nhanh • Hiện đại</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </AnimatedLinearGradient>
      </Animated.View>

      <Animated.View style={cardStyle}>
        <AnimatedLinearGradient
          colors={cardBorderColors}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.card}>
            {/* inner glass sheen */}
            <View style={styles.cardSheen} />

            {/* ✅ message nằm trong card, ngay trên children */}
            {!!message && (
              <AppFormMessage
                message={message}
                variant={messageVariant}
                onClose={onCloseMessage}
                style={messageStyle}
              />
            )}

            <View style={cardContentStyle}>{children}</View>
          </View>
        </AnimatedLinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: height * 0.075,
    paddingBottom: 68,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
    ...COMMON_SHADOWS.header,
  },
  heroHighlight: {
    position: "absolute",
    top: 18,
    left: -40,
    right: -40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  glow1: {
    position: "absolute",
    right: -90,
    top: -70,
    width: 240,
    height: 240,
    borderRadius: 999,
  },
  glow2: {
    position: "absolute",
    left: -110,
    bottom: -140,
    width: 300,
    height: 300,
    borderRadius: 999,
  },
  glow3: {
    position: "absolute",
    left: width * 0.22,
    top: height * 0.08,
    width: 160,
    height: 160,
    borderRadius: 999,
  },

  topRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  brand: { color: COLORS.text.inverse, fontSize: 22, fontWeight: "900" },
  chip: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  chipText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    marginTop: SPACING.lg,
    color: COLORS.text.inverse,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: SPACING.xs,
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 320,
  },

  cardBorder: {
    marginTop: -30,
    marginHorizontal: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.lg + 4,
    padding: 1,
  },
  card: {
    backgroundColor: withOpacity(COLORS.background.primary, 0.96),
    borderRadius: LAYOUT.borderRadius.lg + 2,
    padding: SPACING.lg,
    overflow: "hidden",
    ...COMMON_SHADOWS.card,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.neutral.white, 0.1),
  },
  cardSheen: {
    position: "absolute",
    top: -80,
    right: -120,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotateZ: "20deg" }] as any,
  },
});
