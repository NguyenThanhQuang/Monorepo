import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState, useAppDispatch } from "../../store/index-store";
import { login } from "../../store/authSlice";
import { ROUTES } from "../../theme";

import AuthLayout from "@/components/layout/AuthLayout";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";

import { COLORS, SPACING, TYPOGRAPHY, COMMON_STYLES } from "@/theme";

/* ===== Helpers: email/phone ===== */
const normalizePhoneVN = (raw: string) => {
  const trimmed = raw.trim();

  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.startsWith("84")) return "0" + digits.slice(2);
    return digits;
  }

  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("84")) digits = "0" + digits.slice(2);

  return digits;
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedIdentifier = useMemo(() => {
    const raw = identifier.trim();
    if (!raw) return "";
    return isEmail(raw) ? raw.toLowerCase() : normalizePhoneVN(raw);
  }, [identifier]);

  const handleLogin = async () => {
    const raw = identifier.trim();
    const pwd = password.trim();

    if (!raw || !pwd) {
      setFormError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setFormError(null);

      await dispatch(
        login({
          identifier: normalizedIdentifier,
          password: pwd,
        }),
      ).unwrap();
    } catch (err: any) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || err?.response?.data?.message || "Đăng nhập thất bại";

      setFormError(message);

      if (message.includes("chưa xác thực") || message.includes("chưa xác minh")) {
        Alert.alert(
          "Chưa xác thực email",
          "Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
        );
      }
    }
  };

  const clearError = () => setFormError(null);

  return (
    <SafeAreaView style={[COMMON_STYLES.safeArea, { backgroundColor: COLORS.background.secondary }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.dark} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: SPACING.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthLayout
            title="Chào mừng quay lại"
            subtitle="Đăng nhập nhanh chóng & an toàn"
            message={formError}
            messageVariant="error"
            onCloseMessage={clearError}
          >
            <View style={{ marginBottom: SPACING.lg }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: COLORS.text.primary,
                  textAlign: "center",
                  letterSpacing: 0.2,
                }}
              >
                Đăng nhập
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  textAlign: "center",
                  color: COLORS.text.secondary,
                  fontWeight: "600",
                  fontSize: TYPOGRAPHY.body3.fontSize,
                  lineHeight: 18,
                }}
              >
                Dùng email hoặc số điện thoại để tiếp tục.
              </Text>
            </View>

            <AppInput
              icon="mail-outline"
              label="Email hoặc số điện thoại"
              value={identifier}
              onChangeText={(t) => {
                setIdentifier(t);
                if (formError) clearError();
              }}
              placeholder="you@email.com hoặc 09xxxxxxxx"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="next"
            />

            <AppInput
              icon="lock-closed-outline"
              label="Mật khẩu"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (formError) clearError();
              }}
              placeholder="Nhập mật khẩu"
              isPassword
              autoCapitalize="none"
              returnKeyType="done"
            />

            <AppButton
              title={isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              onPress={handleLogin}
              loading={isLoading}
              style={{ marginTop: SPACING.sm }}
            />

            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ForgotPassword)} activeOpacity={0.85}>
              <Text
                style={{
                  marginTop: SPACING.lg,
                  textAlign: "center",
                  color: COLORS.primary.main,
                  fontWeight: "900",
                  fontSize: TYPOGRAPHY.body2.fontSize,
                }}
              >
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.Register)} activeOpacity={0.85}>
              <Text
                style={{
                  marginTop: SPACING.md,
                  textAlign: "center",
                  color: COLORS.text.secondary,
                  fontWeight: "800",
                  fontSize: TYPOGRAPHY.body2.fontSize,
                }}
              >
                Chưa có tài khoản?{" "}
                <Text style={{ color: COLORS.primary.main, fontWeight: "900", textDecorationLine: "underline" }}>
                  Đăng ký ngay
                </Text>
              </Text>
            </TouchableOpacity>
          </AuthLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
