import React, { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  createAnimatedComponent,
} from "react-native-reanimated";

import { COLORS, withOpacity } from "../../theme/colors";
import { SPACING, TYPOGRAPHY, LAYOUT, COMMON_SHADOWS } from "@/theme";

const AnimatedLinearGradient = createAnimatedComponent(LinearGradient);

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** optional: style variants, default = primary */
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export default function AppButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const pressed = useSharedValue(0);
  const glow = useSharedValue(0);
  const shine = useSharedValue(0);

  const primaryShadowColor =
    variant === "secondary" ? "rgba(15, 23, 42, 0.65)" : "rgba(37, 99, 235, 1)";

  useEffect(() => {
    glow.value = withTiming(1, { duration: 380 });
    shine.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const btnScaleStyle = useAnimatedStyle(() => {
    const s = interpolate(pressed.value, [0, 1], [1, 0.985]);
    return { transform: [{ scale: s }] as any };
  });

  // iOS glow (Android elevation gây artifact nên không dựa vào glowStyle cho Android)
  const glowStyle = useAnimatedStyle(() => {
    const a = interpolate(glow.value, [0, 1], [0.0, 0.22]);
    return {
      shadowOpacity: a,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      shadowColor: primaryShadowColor,
    } as any;
  });

  const shineStyle = useAnimatedStyle(() => {
    const x = interpolate(shine.value, [0, 1], [-120, 120]);
    const a = interpolate(shine.value, [0, 1], [0.06, 0.14]);
    return {
      opacity: a,
      transform: [{ translateX: x }, { rotateZ: "18deg" }] as any,
    };
  });

  const isDisabled = disabled || loading;

  const gradientColors = (() => {
    if (variant === "secondary") {
      // muted glassy look
      return isDisabled
        ? ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.14)"]
        : ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.18)"];
    }
    return isDisabled
      ? [withOpacity(COLORS.primary.main, 0.7), withOpacity(COLORS.primary.dark, 0.7)]
      : [COLORS.primary.main, COLORS.primary.dark];
  })();

  const textColor = variant === "secondary" ? COLORS.text.primary : COLORS.text.inverse;

  return (
    // ✅ Shadow chỉ ở lớp ngoài (không overflow hidden)
    <Animated.View style={[styles.shadowWrap, COMMON_SHADOWS.button, glowStyle, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => (pressed.value = withSpring(1, { damping: 18, stiffness: 240 }))}
        onPressOut={() => (pressed.value = withSpring(0, { damping: 18, stiffness: 240 }))}
        style={({ pressed: p }) => [
          styles.pressable,
          isDisabled && styles.disabled,
          p && { opacity: 0.98 },
        ]}
      >
        <Animated.View style={[btnScaleStyle]}>
          {/* ✅ Clip chỉ ở lớp trong để Android không bị “khung mờ” */}
          <View style={styles.clipWrap}>
            <AnimatedLinearGradient
              colors={gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {variant === "primary" && <Animated.View style={[styles.shine, shineStyle]} />}

              {/* inner shade nhẹ tạo depth (không dùng elevation) */}
              <View pointerEvents="none" style={styles.innerShade} />

              {loading ? (
                <ActivityIndicator color={textColor} />
              ) : (
                <Text style={[styles.text, { color: textColor }]}>{title}</Text>
              )}
            </AnimatedLinearGradient>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const R = LAYOUT.borderRadius.lg + 2;

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: R,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    // không overflow hidden ở đây
  },
  pressable: {
    borderRadius: R,
  },
  clipWrap: {
    borderRadius: R,
    overflow: "hidden", // ✅ chỉ clip ở đây
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: R,
  },
  innerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  shine: {
    position: "absolute",
    top: -30,
    left: "50%",
    width: 70,
    height: 140,
    backgroundColor: "rgba(58, 6, 246, 0.55)",
    borderRadius: 18,
  },
  disabled: { opacity: 0.78 },
  text: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.buttonLarge.fontSize ?? TYPOGRAPHY.button.fontSize,
    fontWeight: "900",
    letterSpacing: 0.3,
    backgroundColor: "transparent",
    includeFontPadding: false, // ✅ Android text sạch hơn
  },
});
