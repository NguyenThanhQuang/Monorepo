import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import AppScreen from "@/components/layout/AppScreen";
import SectionHeader from "@/components/ui/SectionHeader";
import AppCard from "@/components/ui/AppCard";
import AppFormMessage from "@/components/ui/AppFormMessage";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import IconCircle from "@/components/ui/IconCircle";

import { RootState, useAppDispatch } from "../../store/index-store";
import { changePassword, clearAuthStatus } from "../../store/authSlice";
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, withOpacity } from "../../theme";

type Nav = any;

const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const validCount = [
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;
  return {
    isValid:
      minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    strength: validCount,
    checks: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    },
  };
};

const strengthMeta = (strength: number) => {
  if (strength <= 2) return { label: "Yếu", color: COLORS.error.main };
  if (strength <= 3) return { label: "Trung bình", color: COLORS.warning.main };
  if (strength <= 4) return { label: "Mạnh", color: COLORS.info.main };
  return { label: "Rất mạnh", color: COLORS.success.main };
};

const RequirementRow = ({ ok, label }: { ok: boolean; label: string }) => (
  <View style={styles.reqRow}>
    <Ionicons
      name={ok ? "checkmark-circle" : "close-circle"}
      size={16}
      color={ok ? COLORS.success.main : COLORS.error.main}
    />
    <Text style={styles.reqText}>{label}</Text>
  </View>
);

export default function ChangePasswordScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { status, error, successMessage } = useSelector(
    (state: RootState) => state.auth,
  );

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [clientError, setClientError] = useState("");
  const loading = status === "loading";

  useEffect(() => {
    return () => {
      dispatch(clearAuthStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      Alert.alert("Thành công", "Mật khẩu đã được thay đổi thành công!");
      navigation.goBack();
    }
  }, [successMessage, navigation]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setClientError("");
    if (error) dispatch(clearAuthStatus());
  };

  const passwordValidation = useMemo(
    () => validatePassword(formData.newPassword),
    [formData.newPassword],
  );
  const strength = useMemo(
    () => strengthMeta(passwordValidation.strength),
    [passwordValidation.strength],
  );

  const isPasswordMatch = useMemo(() => {
    return (
      formData.confirmNewPassword !== "" &&
      formData.newPassword === formData.confirmNewPassword
    );
  }, [formData.newPassword, formData.confirmNewPassword]);

  const handleSubmit = () => {
    setClientError("");
    dispatch(clearAuthStatus());

    if (
      formData.currentPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      setClientError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setClientError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (!passwordValidation.isValid) {
      setClientError("Mật khẩu mới không đáp ứng đủ các yêu cầu về bảo mật.");
      return;
    }

    dispatch(changePassword(formData));
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.topBar}>
          <AnimatedPressable
            onPress={() => navigation.goBack()}
            scaleTo={0.985}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
          </AnimatedPressable>

          <View style={{ flex: 1 }}>
            <SectionHeader
              title="Đổi mật khẩu"
              subtitle="Cập nhật mật khẩu đăng nhập của bạn"
            />
          </View>

          <View style={{ width: 56 }} />
        </View>

        {!!error && (
          <AppFormMessage
            variant="error"
            message={String(error)}
            onClose={() => dispatch(clearAuthStatus())}
          />
        )}
        {!!clientError && (
          <AppFormMessage
            variant="warning"
            message={clientError}
            onClose={() => setClientError("")}
          />
        )}

        <AppCard style={styles.card}>
          <AppInput
            label="Mật khẩu hiện tại"
            icon="key"
            value={formData.currentPassword}
            onChangeText={(t) => handleInputChange("currentPassword", t)}
            placeholder="Nhập mật khẩu hiện tại"
            autoCapitalize="none"
            isPassword
          />

          <AppInput
            label="Mật khẩu mới"
            icon="lock-closed"
            value={formData.newPassword}
            onChangeText={(t) => handleInputChange("newPassword", t)}
            placeholder="Nhập mật khẩu mới"
            autoCapitalize="none"
            isPassword
          />

          {formData.newPassword.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTop}>
                <Text style={styles.strengthLabel}>Độ mạnh</Text>
                <View
                  style={[
                    styles.strengthPill,
                    {
                      backgroundColor: withOpacity(strength.color, 0.12),
                      borderColor: withOpacity(strength.color, 0.22),
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={14} color={strength.color} />
                  <Text
                    style={[styles.strengthPillText, { color: strength.color }]}
                  >
                    {strength.label}
                  </Text>
                </View>
              </View>

              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(passwordValidation.strength / 5) * 100}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <AppCard style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <IconCircle
                size={40}
                bg={withOpacity(COLORS.primary.light, 0.14)}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={COLORS.primary.main}
                />
              </IconCircle>
              <View style={{ flex: 1 }}>
                <Text style={styles.reqTitle}>Yêu cầu mật khẩu</Text>
                <Text style={styles.reqSub}>Để tăng bảo mật tài khoản</Text>
              </View>
            </View>

            <RequirementRow
              ok={passwordValidation.checks.minLength}
              label="Ít nhất 8 ký tự"
            />
            <RequirementRow
              ok={passwordValidation.checks.hasUpperCase}
              label="Có chữ hoa (A-Z)"
            />
            <RequirementRow
              ok={passwordValidation.checks.hasLowerCase}
              label="Có chữ thường (a-z)"
            />
            <RequirementRow
              ok={passwordValidation.checks.hasNumbers}
              label="Có số (0-9)"
            />
            <RequirementRow
              ok={passwordValidation.checks.hasSpecialChar}
              label="Có ký tự đặc biệt (!@#$...)"
            />
          </AppCard>

          <AppInput
            label="Xác nhận mật khẩu mới"
            icon="checkmark"
            value={formData.confirmNewPassword}
            onChangeText={(t) => handleInputChange("confirmNewPassword", t)}
            placeholder="Nhập lại mật khẩu mới"
            autoCapitalize="none"
            isPassword
          />

          {formData.confirmNewPassword.length > 0 && (
            <View style={styles.matchRow}>
              <Ionicons
                name={isPasswordMatch ? "checkmark-circle" : "close-circle"}
                size={16}
                color={
                  isPasswordMatch ? COLORS.success.main : COLORS.error.main
                }
              />
              <Text
                style={[
                  styles.matchText,
                  {
                    color: isPasswordMatch
                      ? COLORS.success.main
                      : COLORS.error.main,
                  },
                ]}
              >
                {isPasswordMatch ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
              </Text>
            </View>
          )}

          <View style={{ marginTop: SPACING.md }}>
            <AppButton
              title="Đổi mật khẩu"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </View>
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING["2xl"],
    backgroundColor: COLORS.background.primary,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  backBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    backgroundColor: withOpacity(COLORS.background.secondary, 0.95),
  },

  card: { padding: SPACING.lg },

  strengthWrap: { marginTop: -SPACING.xs, marginBottom: SPACING.md },
  strengthTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  strengthLabel: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  strengthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  strengthPillText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  strengthBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.border.light, 0.9),
    overflow: "hidden",
  },
  strengthFill: { height: "100%", borderRadius: 999 },

  reqCard: {
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: withOpacity(COLORS.background.secondary, 0.92),
  },
  reqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reqTitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  reqSub: {
    marginTop: 2,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  reqText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: COLORS.text.primary,
  },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  matchText: { ...TYPOGRAPHY.body3, fontWeight: "900" },
});
