import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Text,
  View,
  Pressable,
  Linking,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigation } from "@react-navigation/native";

import { register } from "@/store/authSlice";
import * as IntentLauncher from "expo-intent-launcher";
import { Alert } from "react-native";


import AuthLayout from "@/components/layout/AuthLayout";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";

import { COLORS, SPACING, TYPOGRAPHY, COMMON_STYLES } from "@/theme";
import type { FormMessageVariant } from "@/components/ui/AppFormMessage";

type FieldKey = "name" | "email" | "phone" | "password" | "confirmPassword";
type StrengthLevel = 0 | 1 | 2 | 3;
type PasswordStrength = { level: StrengthLevel; label: string; hint: string };

const FLAG_ACTIVITY_NEW_TASK = 0x10000000;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Regex mật khẩu mạnh (giống backend reset-password)
const PASSWORD_STRONG_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);

  // ✅ Hook PHẢI nằm trong component
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [formMessage, setFormMessage] = useState<{
    message: string;
    variant?: FormMessageVariant;
  } | null>(null);

  const clearFormMessage = () => setFormMessage(null);

  const updateField = (key: FieldKey, value: string) => {
    if (formMessage) clearFormMessage();
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) e.name = "Vui lòng nhập họ và tên";

    if (!email) e.email = "Vui lòng nhập email";
    else if (!emailRegex.test(email)) e.email = "Email chưa đúng định dạng";

    if (!phone) e.phone = "Vui lòng nhập số điện thoại";
    else if (phone.replace(/\D/g, "").length < 9)
      e.phone = "Số điện thoại có vẻ chưa đúng";

    if (!password) e.password = "Vui lòng nhập mật khẩu";
    else if (password.length < 8) e.password = "Mật khẩu tối thiểu 8 ký tự";
    else if (!PASSWORD_STRONG_REGEX.test(password))
      e.password =
        "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt";

    if (!confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (password !== confirmPassword)
      e.confirmPassword = "Mật khẩu xác nhận không khớp";

    return e;
  }, [formData]);

  const passwordStrength = useMemo<PasswordStrength>(() => {
    const p = formData.password;
    if (!p) return { level: 0, label: "Chưa nhập", hint: "Tối thiểu 8 ký tự" };

    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2)
      return {
        level: 1,
        label: "Yếu",
        hint: "Thêm hoa/thường/số/ký tự đặc biệt",
      };
    if (score <= 4)
      return { level: 2, label: "Ổn", hint: "Tốt hơn nếu dài ≥ 10 ký tự" };
    return { level: 3, label: "Mạnh", hint: "Mật khẩu ổn rồi ✅" };
  }, [formData.password]);

  const canSubmit = useMemo(
    () => Object.keys(errors).length === 0 && !isLoading,
    [errors, isLoading],
  );

  const markAllTouched = () => {
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = formData;

    if (!canSubmit) {
      markAllTouched();
      setFormMessage({
        variant: "warning",
        message:
          "Thông tin chưa hợp lệ. Bạn kiểm tra lại thông tin giúp mình nhé.",
      });
      return;
    }

    try {
      clearFormMessage();

      await dispatch(
        register({
          name,
          email,
          phone,
          password,
          confirmPassword,
        }),
      ).unwrap();

      setRegisterSuccess(true);
      clearFormMessage(); // ✅ không hiện banner success nữa
    } catch (e: any) {
      setFormMessage({
        variant: "error",
        message:
          typeof e === "string" ? e : "Không thể đăng ký. Vui lòng thử lại.",
      });
    }
  };

const openEmail = async () => {
  try {
    if (Platform.OS === "android") {
      // 1) Mở Gmail bằng LAUNCHER => vào inbox, KHÔNG compose
      // + NEW_TASK => tách khỏi task Expo Go (đỡ bị "Gmail nằm trong Expo Go")
      try {
        await IntentLauncher.startActivityAsync("android.intent.action.MAIN", {
          packageName: "com.google.android.gm",
          category: "android.intent.category.LAUNCHER",
          flags: FLAG_ACTIVITY_NEW_TASK,
        });
        return;
      } catch {
        // ignore -> fallback bên dưới
      }

      // 2) Fallback: mở app Email mặc định (Inbox)
      await IntentLauncher.startActivityAsync("android.intent.action.MAIN", {
        category: "android.intent.category.APP_EMAIL",
        flags: FLAG_ACTIVITY_NEW_TASK,
      });
      return;
    }

    // iOS: ưu tiên Gmail nếu có, không thì mở Mail
    const gmailScheme = "googlegmail://";
    const canGmail = await Linking.canOpenURL(gmailScheme);
    if (canGmail) {
      await Linking.openURL(gmailScheme);
      return;
    }

    await Linking.openURL("message://"); // mở Mail app
  } catch {
    Alert.alert(
      "Không mở được Email",
      "Bạn vui lòng mở ứng dụng Gmail/Mail để kiểm tra email xác thực nhé."
    );
  }
};


  const resetForm = () => {
    setRegisterSuccess(false);
    clearFormMessage();
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setTouched({
      name: false,
      email: false,
      phone: false,
      password: false,
      confirmPassword: false,
    });
  };

  return (
    <SafeAreaView
      style={[
        COMMON_STYLES.safeArea,
        { backgroundColor: COLORS.background.secondary },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary.dark}
      />

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
            title="Tạo tài khoản mới"
            subtitle="Bắt đầu đặt vé nhanh chóng & an toàn"
            message={registerSuccess ? null : (formMessage?.message ?? null)}
            messageVariant={formMessage?.variant ?? "error"}
            onCloseMessage={clearFormMessage}
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
                Đăng Ký
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
                Tạo tài khoản miễn phí & bảo mật.
              </Text>
            </View>

            {/* ✅ SUCCESS PANEL (đẹp hơn Alert) */}
            {registerSuccess ? (
              <View
                style={{
                  padding: SPACING.lg,
                  borderRadius: 18,
                  backgroundColor: "rgba(34,197,94,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(34,197,94,0.35)",
                  marginBottom: SPACING.lg,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: COLORS.text.primary,
                    textAlign: "center",
                  }}
                >
                  🎉 Đăng ký thành công
                </Text>

                <Text
                  style={{
                    marginTop: 10,
                    textAlign: "center",
                    color: COLORS.text.secondary,
                    fontWeight: "600",
                    lineHeight: 20,
                    fontSize: TYPOGRAPHY.body3.fontSize,
                  }}
                >
                  Hệ thống đã gửi email xác thực. Vui lòng kiểm tra hộp thư hoặc
                  thư rác để xác thực tài khoản trước khi đăng nhập.
                </Text>

                <View style={{ height: SPACING.lg }} />

                <AppButton title="Mở ứng dụng Email" onPress={openEmail} />

                <View style={{ height: SPACING.md }} />

                {/* <AppButton
                  title="Đăng nhập"
                  onPress={() =>
                    navigation.navigate("Auth", { screen: "Login" })
                  }
                /> */}

                <Pressable
                  onPress={resetForm}
                  style={{ marginTop: SPACING.md }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.primary.main,
                      fontWeight: "900",
                      textDecorationLine: "underline",
                      fontSize: TYPOGRAPHY.body3.fontSize,
                    }}
                  >
                    Đăng ký tài khoản khác
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <AppInput
                  icon="person-outline"
                  label="Họ và tên"
                  value={formData.name}
                  onChangeText={(t) => updateField("name", t)}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                  placeholder="Nguyễn Văn A"
                  textContentType="name"
                  returnKeyType="next"
                  errorText={touched.name ? errors.name : undefined}
                />

                <AppInput
                  icon="mail-outline"
                  label="Email"
                  value={formData.email}
                  onChangeText={(t) => updateField("email", t)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  errorText={touched.email ? errors.email : undefined}
                />

                <AppInput
                  icon="call-outline"
                  label="Số điện thoại"
                  value={formData.phone}
                  onChangeText={(t) => updateField("phone", t)}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  placeholder="VD: 09xxxxxxxx"
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  returnKeyType="next"
                  errorText={touched.phone ? errors.phone : undefined}
                />

                <AppInput
                  icon="lock-closed-outline"
                  label="Mật khẩu"
                  value={formData.password}
                  onChangeText={(t) => updateField("password", t)}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  placeholder="Tối thiểu 8 ký tự"
                  isPassword
                  textContentType="password"
                  returnKeyType="next"
                  errorText={touched.password ? errors.password : undefined}
                  hintText={`Độ mạnh: ${passwordStrength.label} • ${passwordStrength.hint}`}
                />

                <PasswordStrengthBar level={passwordStrength.level} />

                <AppInput
                  icon="lock-closed-outline"
                  label="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChangeText={(t) => updateField("confirmPassword", t)}
                  onBlur={() =>
                    setTouched((p) => ({ ...p, confirmPassword: true }))
                  }
                  placeholder="Nhập lại mật khẩu"
                  isPassword
                  textContentType="password"
                  returnKeyType="done"
                  errorText={
                    touched.confirmPassword ? errors.confirmPassword : undefined
                  }
                />

                <AppButton
                  title={isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={!canSubmit}
                />

                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      marginTop: SPACING.lg,
                      textAlign: "center",
                      color: COLORS.primary.main,
                      fontWeight: "900",
                      fontSize: TYPOGRAPHY.body2.fontSize,
                    }}
                  >
                    Đã có tài khoản?{" "}
                    <Text style={{ textDecorationLine: "underline" }}>
                      Đăng nhập
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </AuthLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function PasswordStrengthBar({ level }: { level: 0 | 1 | 2 | 3 }) {
  const w =
    level === 0 ? "18%" : level === 1 ? "33%" : level === 2 ? "66%" : "100%";
  const bg =
    level <= 1
      ? "rgba(239,68,68,0.85)"
      : level === 2
        ? "rgba(245,158,11,0.85)"
        : "rgba(34,197,94,0.85)";

  return (
    <View style={{ marginTop: -SPACING.sm, marginBottom: SPACING.md }}>
      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: "rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: w,
            height: "100%",
            backgroundColor: bg,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}

export default RegisterScreen;
