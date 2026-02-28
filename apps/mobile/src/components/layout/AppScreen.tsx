// src/layouts/AppScreen.tsx
import React from "react";
import { SafeAreaView, StatusBar, ViewStyle } from "react-native";
import { COLORS } from "@/theme/colors";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  statusBarStyle?: "light-content" | "dark-content";
  statusBarBg?: string;
};

export default function AppScreen({
  children,
  style,
  statusBarStyle = "dark-content",
  statusBarBg = "transparent",
}: Props) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: COLORS.background.primary }, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBg} />
      {children}
    </SafeAreaView>
  );
}
