import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import AuthLayout from "@/components/layout/AuthLayout";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";

// ✅ thunk từ authSlice
import { resetPassword } from "@/store/authSlice";

type Variant = "error" | "success" | "info" | "warning";
type FieldKey = "newPassword" | "confirmPassword";

// ✅ Regex mật khẩu mạnh (giống RegisterScreen)
const PASSWORD_STRONG_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<any>();

  const token = (route.params?.token as string | undefined) ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  // banner message (AuthLayout)
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<Variant>("error");

  const clearMessage = () => setMessage(null);

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};

    const p1 = newPassword; // raw để check regex
    const p2 = confirmPassword;

    if (!p1) e.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (p1.length < 8) e.newPassword = "Mật khẩu tối thiểu 8 ký tự";
    else if (!PASSWORD_STRONG_REGEX.test(p1))
      e.newPassword =
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt";

    if (!p2) e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (p1 !== p2) e.confirmPassword = "Mật khẩu xác nhận không khớp";

    return e;
  }, [newPassword, confirmPassword]);

  const markAllTouched = () => {
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });
  };

  const handleSubmit = async () => {
    // token invalid -> show banner
    if (!token) {
      setVariant("error");
      setMessage(
        "Link đặt lại mật khẩu không hợp lệ hoặc thiếu token. Vui lòng mở lại từ email.",
      );
      return;
    }

    // validate fields
    if (Object.keys(errors).length > 0) {
      markAllTouched();
      setVariant("warning");
      setMessage("Thông tin chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await dispatch(
        resetPassword({
          token,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      ).unwrap();

      setVariant("success");
      setMessage(
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
      );

      setTimeout(() => navigation.navigate("Auth", { screen: "Login" }), 3000);
    } catch (e: any) {
      setVariant("error");
      setMessage(
        typeof e === "string"
          ? e
          : "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.",
      );
    } finally {
      setLoading(false);
    }
  };

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
            title="Đặt lại mật khẩu"
            subtitle="Nhập mật khẩu mới để hoàn tất"
            message={message}
            messageVariant={variant as any}
            onCloseMessage={clearMessage}
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
              <Text style={styles.backText}>Quay lại</Text>
            </Pressable>

            <View style={styles.content}>
              <Text style={styles.heading}>Tạo mật khẩu mới</Text>
              <Text style={styles.subheading}>
                Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự
                đặc biệt.
              </Text>

              <AppInput
                icon="lock-closed-outline"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (message) setMessage(null);
                }}
                onBlur={() => setTouched((p) => ({ ...p, newPassword: true }))}
                isPassword
                returnKeyType="next"
                errorText={touched.newPassword ? errors.newPassword : undefined}
              />

              <AppInput
                icon="lock-closed-outline"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (message) setMessage(null);
                }}
                onBlur={() =>
                  setTouched((p) => ({ ...p, confirmPassword: true }))
                }
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                errorText={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
              />

              <AppButton
                title={loading ? "Đang lưu..." : "Xác nhận"}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading} // ✅ chỉ disable khi loading để luôn show lỗi được
                style={{ marginTop: 6 }}
              />

              {!token ? (
                <Text style={styles.tokenWarn}>
                  Không thấy token từ link. Hãy mở lại email và bấm link “Đặt
                  lại mật khẩu”.
                </Text>
              ) : null}
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
  subheading: { fontSize: 13, opacity: 0.75, marginBottom: 14, lineHeight: 18 },

  tokenWarn: { marginTop: 12, fontSize: 12, opacity: 0.75, lineHeight: 16 },
});
