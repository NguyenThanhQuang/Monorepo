import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "danger";
};

export default function CustomButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = "primary",
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={[styles.text, variant !== "secondary" ? styles.textLight : styles.textDark, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#007AFF" },
  secondary: { backgroundColor: "#E9EEF5" },
  danger: { backgroundColor: "#F44336" },
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: "700" },
  textLight: { color: "white" },
  textDark: { color: "#0B1220" },
});
