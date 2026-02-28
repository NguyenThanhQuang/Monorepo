import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { COLORS, withOpacity } from "@/theme/colors";
import { SPACING, TYPOGRAPHY, LAYOUT } from "@/theme";

export type FormMessageVariant = "error" | "success" | "info" | "warning";

type Props = {
  message: string;
  variant?: FormMessageVariant;
  onClose?: () => void;
  style?: any;
};

const VARIANT_STYLES: Record<
  FormMessageVariant,
  { bg: string; border: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  error: {
    bg: withOpacity(COLORS.error.main, 0.10),
    border: withOpacity(COLORS.error.main, 0.22),
    icon: "alert-circle-outline",
    iconColor: COLORS.error.main,
  },
  success: {
    bg: withOpacity(COLORS.success.main, 0.12),
    border: withOpacity(COLORS.success.main, 0.22),
    icon: "checkmark-circle-outline",
    iconColor: COLORS.success.main,
  },
  info: {
    bg: withOpacity(COLORS.info.main, 0.10),
    border: withOpacity(COLORS.info.main, 0.20),
    icon: "information-circle-outline",
    iconColor: COLORS.info.main,
  },
  warning: {
    bg: withOpacity(COLORS.warning.main, 0.10),
    border: withOpacity(COLORS.warning.main, 0.22),
    icon: "warning-outline",
    iconColor: COLORS.warning.main,
  },
};

export default function AppFormMessage({
  message,
  variant = "error",
  onClose,
  style,
}: Props) {
  const o = useSharedValue(0);
  const y = useSharedValue(-6);

  useEffect(() => {
    o.value = withTiming(1, { duration: 180 });
    y.value = withSpring(0, { damping: 16, stiffness: 220 });
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: o.value,
    transform: [{ translateY: y.value }] as any,
  }));

  const v = VARIANT_STYLES[variant];

  return (
    <Animated.View style={[styles.wrap, aStyle, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      <Ionicons name={v.icon} size={18} color={v.iconColor} />
      <Text style={styles.text} numberOfLines={3}>
        {message}
      </Text>

      {!!onClose && (
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={withOpacity(COLORS.text.secondary, 0.9)} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  text: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "700",
    lineHeight: 18,
  },
  closeBtn: {
    paddingLeft: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
});
