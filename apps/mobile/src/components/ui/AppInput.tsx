import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  withSequence,
} from "react-native-reanimated";

import { COLORS, withOpacity } from "../../theme/colors";
import { SPACING, TYPOGRAPHY, LAYOUT, COMMON_SHADOWS } from "@/theme";

type Props = TextInputProps & {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  errorText?: string;
  hintText?: string;
  delayMs?: number;
  isPassword?: boolean;
};

export default function AppInput({
  icon,
  label,
  errorText,
  hintText,
  delayMs = 0,
  isPassword = false,
  secureTextEntry,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const shake = useSharedValue(0);

  const o = useSharedValue(0);
  const y = useSharedValue(12);
  const ring = useSharedValue(0);

  // worklet-safe constants
  const primaryShadowColor = "rgba(37, 99, 235, 1)";

  useEffect(() => {
    if (errorText) {
      shake.value = withSequence(
        withTiming(1, { duration: 60 }),
        withTiming(-1, { duration: 60 }),
        withTiming(1, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [errorText]);

  useEffect(() => {
    const t = setTimeout(() => {
      o.value = withTiming(1, { duration: 420 });
      y.value = withSpring(0, { damping: 18, stiffness: 160, mass: 0.8 });
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    ring.value = withTiming(focused ? 1 : 0, { duration: 170 });
  }, [focused]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [
      { translateY: y.value },
      { translateX: shake.value * 3 },
    ] as any,
  }));

  const ringStyle = useAnimatedStyle(() => {
    const a = interpolate(ring.value, [0, 1], [0, 1]);
    return {
      borderColor: focused
        ? withOpacity(COLORS.primary.light, 0.75)
        : withOpacity(COLORS.border.light, 0.9),
      backgroundColor: focused
        ? withOpacity(COLORS.background.primary, 0.98)
        : COLORS.background.tertiary,
      shadowOpacity: a * 0.14,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      shadowColor: primaryShadowColor,
    } as any;
  });

  const actuallySecure = useMemo(() => {
    if (!isPassword) return !!secureTextEntry;
    return !show;
  }, [isPassword, secureTextEntry, show]);

  const hasError = !!errorText;

  return (
    <Animated.View style={[entranceStyle, { marginBottom: SPACING.md }]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <Animated.View
        style={[
          styles.row,
          ringStyle,
          hasError && { borderColor: withOpacity(COLORS.error.main, 0.7) },
          hasError && COMMON_SHADOWS.elevation1,
        ]}
      >
        {!!icon && (
          <View style={styles.iconWrap}>
            <Ionicons
              name={icon}
              size={18}
              color={
                hasError
                  ? COLORS.error.main
                  : focused
                    ? COLORS.primary.main
                    : COLORS.text.secondary
              }
            />
          </View>
        )}

        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor={withOpacity(COLORS.text.secondary, 0.9)}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={actuallySecure}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShow((v) => !v)}
            hitSlop={12}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={show ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={withOpacity(COLORS.text.secondary, 0.95)}
            />
          </Pressable>
        )}
      </Animated.View>

      {!!errorText ? (
        <Text style={styles.error}>{errorText}</Text>
      ) : (
        !!hintText && <Text style={styles.hint}>{hintText}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius.lg + 2,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  iconWrap: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.body2.fontSize,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  eyeBtn: { paddingLeft: SPACING.sm, paddingVertical: SPACING.sm },

  error: {
    marginTop: SPACING.xs,
    color: COLORS.error.main,
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
  },
  hint: {
    marginTop: SPACING.xs,
    color: withOpacity(COLORS.text.secondary, 0.95),
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "600",
  },
});
