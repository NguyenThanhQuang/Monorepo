import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { driverService } from "@/services/user/driverService";
import apiService from "@/services/common/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch } from "@/store/index-store";
import { logout, setUser } from "@/store/authSlice";
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT, ICONS, withOpacity } from "@/theme";

type Props = any;

export default function DriverRegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"info" | "error" | "success">("info");

  const loadExisting = useCallback(async () => {
    try {
      const p = await driverService.getMyProfile();
      if (p) {
        setLicenseNumber(p.licenseNumber || "");
        setIdCardNumber(p.idCardNumber || "");
        setExperienceYears(String(p.experienceYears ?? ""));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const submit = async () => {
    if (!licenseNumber.trim() || !idCardNumber.trim()) {
      setVariant("error");
      setMessage("Vui lòng nhập Số GPLX và CCCD/CMND.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const years = experienceYears.trim() ? Number(experienceYears.trim()) : undefined;
      const res: any = await driverService.register({
        licenseNumber: licenseNumber.trim(),
        idCardNumber: idCardNumber.trim(),
        experienceYears: Number.isFinite(years as any) ? years : undefined,
      });

      setVariant("success");
      setMessage(res?.message || "Đăng ký tài xế thành công.");

      // ✅ refresh user roles để tab “Tài xế” hiện ngay
      try {
        const me = await apiService.get<any>("/users/me");
        const u = me.data?.data ?? me.data;
        dispatch(setUser(u));
        await AsyncStorage.setItem("user", JSON.stringify(u));
      } catch {}

      Alert.alert(
        "Thành công",
        "Đã đăng ký tài xế. Lưu ý: Backend kiểm tra role từ token đăng nhập. Để quét/xác nhận vé hoạt động, bạn nên đăng xuất và đăng nhập lại để token cập nhật role driver.",
        [
          {
            text: "Để sau",
            style: "cancel",
            onPress: () => (navigation as any).navigate("DriverHome"),
          },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: () => {
              dispatch(logout() as any);
            },
          },
        ],
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Đăng ký thất bại.";
      setVariant("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen statusBarStyle="dark-content">
      <View style={styles.header}>
        <Pressable onPress={() => (navigation as any).goBack()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name={ICONS.arrowBack as any} size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Đăng ký tài xế</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 28 }}>
        {!!message && <AppFormMessage variant={variant} message={message} />}

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin tài xế</Text>
          <Text style={styles.subText}>Nhập thông tin để bật chế độ Tài xế (quét vé).</Text>

          <View style={{ marginTop: SPACING.sm }}>
            <AppInput
              icon="card-outline"
              label="Số GPLX *"
              placeholder="VD: 79A-123456"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
            <AppInput
              icon="card-outline"
              label="CCCD/CMND *"
              placeholder="Nhập số CCCD/CMND"
              value={idCardNumber}
              onChangeText={setIdCardNumber}
              keyboardType="number-pad"
            />
            <AppInput
              icon="briefcase-outline"
              label="Số năm kinh nghiệm"
              placeholder="VD: 3"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="number-pad"
            />
          </View>

          <AppButton
            title={loading ? "Đang gửi..." : "Xác nhận"}
            onPress={submit}
            loading={loading}
            disabled={loading}
          />
        </AppCard>

        <AppCard style={styles.noteCard}>
          <Text style={styles.noteTitle}>Lưu ý</Text>
          <Text style={styles.noteText}>• Sau khi đăng ký, bạn nên đăng xuất và đăng nhập lại để token cập nhật role tài xế.</Text>
          <Text style={styles.noteText}>• Vé hợp lệ cần ở trạng thái đã thanh toán và chưa check-in.</Text>
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerBtn: {
    width: LAYOUT.headerIconSize,
    height: LAYOUT.headerIconSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.neutral.white, 0.9),
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text.primary },

  card: { padding: SPACING.md, borderRadius: 18 },
  sectionTitle: { fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: "900", color: COLORS.text.primary },
  subText: { marginTop: 6, color: COLORS.text.secondary, fontWeight: "600", lineHeight: 18 },

  noteCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 18,
    backgroundColor: withOpacity(COLORS.primary.main, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.14),
  },
  noteTitle: { fontWeight: "900", color: COLORS.text.primary, marginBottom: 8 },
  noteText: { color: COLORS.text.secondary, fontWeight: "600", lineHeight: 18, marginBottom: 6 },
});
