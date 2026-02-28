import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import AuthLayout from "@/components/layout/AuthLayout";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";
import { forgotPassword } from "@/store/authSlice";

type MessageVariant = "error" | "success" | "info" | "warning";

const COOLDOWN_SECONDS = 30;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<MessageVariant>("error");

  // ✅ chặn double tap
  const inFlightRef = useRef(false);

  // ✅ cooldown chống spam
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && !loading && cooldown === 0;
  }, [email, loading, cooldown]);

  useEffect(() => {
    // tick countdown
    if (cooldown <= 0) return;

    cooldownRef.current = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    };
  }, [cooldown]);

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const validateEmail = (value: string) => {
    const v = value.trim();
    if (!v) return "Vui lòng nhập email của bạn";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ok) return "Vui lòng nhập email hợp lệ";
    return null;
  };

  const handleResetPassword = async () => {
    // ✅ đang gửi hoặc đang cooldown thì chặn luôn
    if (inFlightRef.current || cooldown > 0) return;

    const err = validateEmail(email);
    if (err) {
      setMessageVariant("error");
      setMessage(err);
      return;
    }

    inFlightRef.current = true;
    setMessage(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // @ts-ignore nếu bạn chưa typed dispatch
      await dispatch(forgotPassword(normalizedEmail)).unwrap();

      setMessageVariant("success");
      setMessage(
        "Nếu email tồn tại trong hệ thống, Bạn sẽ nhận được hướng dẫn đặt lại mật khẩu. Hãy kiểm tra cả Thư rác.",
      );

      // ✅ bắt đầu cooldown 30s
      setCooldown(COOLDOWN_SECONDS);
    } catch (e: any) {
      setMessageVariant("error");
      setMessage(
        typeof e === "string" ? e : "Gửi email khôi phục mật khẩu thất bại",
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const buttonTitle = useMemo(() => {
    if (loading) return "Đang gửi...";
    if (cooldown > 0) return `Gửi lại (${cooldown}s)`;
    return "Gửi hướng dẫn";
  }, [loading, cooldown]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthLayout
            title="Quên mật khẩu"
            subtitle="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
            message={message}
            messageVariant={messageVariant as any}
            onCloseMessage={() => setMessage(null)}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.backRow,
                pressed && { opacity: 0.9 },
              ]}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={18} />
              <Text style={styles.backText}>Quay lại đăng nhập</Text>
            </Pressable>

            <View style={styles.content}>
              <Text style={styles.heading}>Đặt lại mật khẩu</Text>
              <Text style={styles.subheading}>
                Vui lòng nhập email bạn đã đăng ký để nhận hướng dẫn.
              </Text>

              <AppInput
                icon="mail-outline"
                label="Email"
                placeholder="example@email.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (message) setMessage(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                errorText={
                  messageVariant === "error"
                    ? (message ?? undefined)
                    : undefined
                }
                hintText={undefined} // ✅ bỏ hint để không hiện 2 nơi
              />

              <AppButton
                title={buttonTitle}
                onPress={handleResetPassword}
                loading={loading}
                disabled={!canSubmit || inFlightRef.current || cooldown > 0}
                style={{ marginTop: 6 }}
              />
            </View>
          </AuthLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#0B1220" },
  scroll: { flexGrow: 1, paddingBottom: 18 },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  backText: { fontSize: 13, fontWeight: "700" },

  content: { paddingTop: 6 },
  heading: { fontSize: 18, fontWeight: "900", marginBottom: 6 },
  subheading: {
    fontSize: 13,
    opacity: 0.75,
    marginBottom: 14,
    lineHeight: 18,
  },
  cooldownHint: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.7,
  },
});
