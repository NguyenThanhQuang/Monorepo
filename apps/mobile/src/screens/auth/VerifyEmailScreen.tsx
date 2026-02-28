import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

import AuthLayout from "@/components/layout/AuthLayout";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import type { FormMessageVariant } from "@/components/ui/AppFormMessage";

import { COLORS, SPACING, TYPOGRAPHY, COMMON_STYLES } from "@/theme";
import type { RootState } from "@/store/store";

type Status = "idle" | "loading" | "success" | "error";
type ResendStatus = "idle" | "loading" | "success" | "error";

export default function VerifyEmailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const token: string | undefined = route.params?.token;
  const emailFromParams: string | undefined = route.params?.email;

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<FormMessageVariant>("info");

  const [email, setEmail] = useState(emailFromParams ?? "");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const didAutoVerify = useRef(false);

  // ✅ Đồng bộ base URL với ApiService (app.json -> expo.extra.API_BASE_URL)
  const API_BASE =
    ((Constants.expoConfig as any)?.extra?.API_BASE_URL as string) ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";

  const title = useMemo(() => "Xác thực Email", []);

  const subtitle = useMemo(() => {
    if (status === "loading") return "Vui lòng chờ trong giây lát";
    if (status === "success") return "Tài khoản của bạn đã được kích hoạt";
    if (status === "error") return "Không xác thực được? Bạn có thể gửi lại email xác thực";
    return "Hoàn tất bước cuối để kích hoạt tài khoản";
  }, [status]);

  const verify = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setVariant("error");
      setMessage("Thiếu token xác thực. Vui lòng mở lại email và bấm đúng liên kết.");
      return;
    }

    try {
      setStatus("loading");
      setVariant("info");
      setMessage("Đang xác thực email của bạn...");

      const url = `${API_BASE}/auth/verify-email-api?token=${encodeURIComponent(token)}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        const msg =
          data?.message ||
          "Xác thực thất bại hoặc liên kết đã hết hạn. Vui lòng gửi lại email xác thực.";
        throw new Error(msg);
      }

      setStatus("success");

      // ✅ bỏ message success
      setVariant("info");
      setMessage(null);
    } catch (e: any) {
      setStatus("error");
      setVariant("error");
      setMessage(
        typeof e?.message === "string"
          ? e.message
          : "Không thể xác thực. Vui lòng gửi lại email xác thực.",
      );
    }
  }, [API_BASE, token]);

  useEffect(() => {
    if (didAutoVerify.current) return;
    didAutoVerify.current = true;
    verify();
  }, [verify]);

  const resendVerification = useCallback(async () => {
    const trimmed = (email || "").trim();

    if (!trimmed) {
      setResendStatus("error");
      setResendMsg("Vui lòng nhập email để gửi lại xác thực.");
      return;
    }

    try {
      setResendStatus("loading");
      setResendMsg(null);

      const url = `${API_BASE}/auth/resend-verification-email`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        const msg = data?.message || "Không thể gửi lại email xác thực. Vui lòng thử lại.";
        throw new Error(msg);
      }

      setResendStatus("success");
      setResendMsg(data?.message || "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.");
    } catch (e: any) {
      setResendStatus("error");
      setResendMsg(typeof e?.message === "string" ? e.message : "Gửi lại thất bại.");
    }
  }, [API_BASE, email]);

  const goNext = () => {
    if (isAuthenticated) navigation.navigate("Main");
    else navigation.navigate("Auth", { screen: "Login" });
  };

  const statusTitle = useMemo(() => {
    if (status === "loading") return "Đang xác thực…";
    if (status === "success") return "Xác thực thành công";
    if (status === "error") return "Xác thực thất bại";
    return "Đang kiểm tra liên kết…";
  }, [status]);

  const statusDesc = useMemo(() => {
    if (status === "success") return "Bạn có thể tiếp tục để sử dụng ứng dụng.";
    if (status === "error") return "Bạn có thể gửi lại email xác thực để nhận liên kết mới.";
    return "Đừng tắt ứng dụng trong lúc xử lý.";
  }, [status]);

  const iconName = useMemo(() => {
    if (status === "success") return "checkmark-circle";
    if (status === "error") return "close-circle";
    return "mail";
  }, [status]);

  const iconColor = useMemo(() => {
    if (status === "success") return COLORS.success.main;
    if (status === "error") return COLORS.error.main;
    return COLORS.primary.main;
  }, [status]);

  return (
    <SafeAreaView
      style={[
        COMMON_STYLES.safeArea,
        { backgroundColor: COLORS.background.secondary },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.dark} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: SPACING.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthLayout
            title={title}
            subtitle={subtitle}
            message={status === "success" ? null : message}
            messageVariant={variant}
            onCloseMessage={() => setMessage(null)}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.65)",
                  borderWidth: 1,
                  borderColor: "rgba(15,23,42,0.06)",
                  marginBottom: SPACING.md,
                }}
              >
                {status === "loading" ? (
                  <ActivityIndicator />
                ) : (
                  <Ionicons name={iconName as any} size={46} color={iconColor} />
                )}
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: COLORS.text.primary,
                  textAlign: "center",
                  letterSpacing: 0.2,
                }}
              >
                {statusTitle}
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  textAlign: "center",
                  color: COLORS.text.secondary,
                  fontWeight: "600",
                  fontSize: TYPOGRAPHY.body3.fontSize,
                  lineHeight: 18,
                  maxWidth: 320,
                }}
              >
                {statusDesc}
              </Text>

              <View
                style={{
                  marginTop: SPACING.md,
                  width: "100%",
                  height: 1,
                  backgroundColor: "rgba(15,23,42,0.06)",
                  borderRadius: 99,
                }}
              />

              <View style={{ height: SPACING.lg }} />

              {/* ✅ Khi lỗi: nhập email (nếu thiếu) + gửi lại */}
              {status === "error" && (
                <View style={{ alignSelf: "stretch" }}>
                  {!emailFromParams && (
                    <AppInput
                      icon="mail-outline"
                      label="Email"
                      placeholder="Nhập email của bạn"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      hintText="Chúng mình sẽ gửi lại liên kết xác thực mới."
                    />
                  )}

                  {!!resendMsg && (
                    <Text
                      style={{
                        marginTop: -SPACING.xs,
                        marginBottom: SPACING.sm,
                        textAlign: "center",
                        color:
                          resendStatus === "success"
                            ? COLORS.success.main
                            : resendStatus === "error"
                              ? COLORS.error.main
                              : COLORS.text.secondary,
                        fontWeight: "700",
                        fontSize: TYPOGRAPHY.body3.fontSize,
                      }}
                    >
                      {resendMsg}
                    </Text>
                  )}

                  <AppButton
                    title={
                      resendStatus === "loading"
                        ? "Đang gửi lại..."
                        : "Gửi lại email xác thực"
                    }
                    onPress={resendVerification}
                    loading={resendStatus === "loading"}
                    disabled={resendStatus === "loading"}
                    style={{ alignSelf: "stretch" }}
                  />

                  {/* ✅ Nút phụ: xác thực lại (không dùng status === "loading" trong nhánh error để tránh TS2367) */}
                  <AppButton
                    title="Xác thực lại"
                    onPress={verify}
                    loading={false}
                    disabled={false}
                    variant="secondary"
                    style={{ alignSelf: "stretch" }}
                  />
                </View>
              )}

              <AppButton
                title={status === "success" ? "Tiếp tục" : isAuthenticated ? "Về trang chủ" : "Đăng nhập"}
                onPress={goNext}
                style={{ alignSelf: "stretch" }}
              />
            </View>
          </AuthLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
