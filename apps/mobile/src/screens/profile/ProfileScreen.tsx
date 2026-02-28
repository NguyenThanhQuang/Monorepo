import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import IconCircle from "@/components/ui/IconCircle";
import AppButton from "@/components/ui/AppButton";

import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../store/index-store";
import { logout } from "../../store/authSlice";
import {
  COLORS,
  SPACING,
  LAYOUT,
  TYPOGRAPHY,
  withOpacity,
  ROUTES,
} from "../../theme";

type Nav = any;

const normalizeRole = (r: string) => (r || "").trim().toLowerCase();

const roleLabel = (roles: string[]) => {
  const rs = roles.map(normalizeRole);
  if (rs.includes("admin")) return "Quản trị viên";
  if (
    rs.includes("company_admin") ||
    rs.includes("company-admin") ||
    rs.includes("companyadmin")
  )
    return "Nhà xe";
  if (rs.includes("driver")) return "Tài xế";
  return "Khách hàng";
};

const MenuRow = ({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) => {
  const color = danger ? COLORS.error.main : COLORS.text.primary;

  return (
    <AnimatedPressable onPress={onPress} style={styles.row} scaleTo={0.985}>
      <IconCircle
        size={40}
        bg={withOpacity(
          danger ? COLORS.error.main : COLORS.primary.light,
          0.14,
        )}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? COLORS.error.main : COLORS.primary.main}
        />
      </IconCircle>

      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color }]}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={withOpacity(COLORS.text.secondary, 0.8)}
      />
    </AnimatedPressable>
  );
};

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();

  const user = useAppSelector((state: RootState) => state.auth.user);

  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);

  const isDriver = useMemo(() => {
    const rs = roles.map(normalizeRole);
    return (
      rs.includes("driver") ||
      rs.includes("company_admin") ||
      rs.includes("company-admin") ||
      rs.includes("companyadmin")
    );
  }, [roles]);

  const label = useMemo(() => roleLabel(roles), [roles]);

  const handleLogout = async () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(logout());
            Alert.alert("Thành công", "Đã đăng xuất thành công!");
          } catch {
            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <SectionHeader
          title="Tài khoản"
          subtitle="Quản lý thông tin & tiện ích"
        />

        {/* Profile card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileTop}>
            <IconCircle size={64} bg={withOpacity(COLORS.primary.light, 0.18)}>
              <Ionicons name="person" size={28} color={COLORS.primary.main} />
            </IconCircle>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name || "User"}</Text>
              <Text style={styles.email}>
                {user?.email || "user@example.com"}
              </Text>

              {!!user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: withOpacity(COLORS.info.main, 0.1),
                  borderColor: withOpacity(COLORS.info.main, 0.22),
                },
              ]}
            >
              <Ionicons
                name="ribbon"
                size={16}
                color={COLORS.info.main}
                style={{ marginTop: 1 }} // ✅ giúp cân baseline Android
              />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.badgeText, { color: COLORS.info.main }]}
              >
                {label}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: withOpacity(
                    user?.isEmailVerified
                      ? COLORS.success.main
                      : COLORS.warning.main,
                    0.1,
                  ),
                  borderColor: withOpacity(
                    user?.isEmailVerified
                      ? COLORS.success.main
                      : COLORS.warning.main,
                    0.22,
                  ),
                },
              ]}
            >
              <Ionicons
                name={
                  user?.isEmailVerified ? "checkmark-circle" : "alert-circle"
                }
                size={14}
                color={
                  user?.isEmailVerified
                    ? COLORS.success.main
                    : COLORS.warning.main
                }
              />
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: user?.isEmailVerified
                      ? COLORS.success.main
                      : COLORS.warning.main,
                  },
                ]}
              >
                {user?.isEmailVerified
                  ? "Email đã xác thực"
                  : "Chưa xác thực email"}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Menu */}
        <AppCard style={styles.menuCard}>
          <MenuRow
            icon="ticket-outline"
            title="Vé của tôi"
            subtitle="Xem danh sách vé đã đặt"
            onPress={() => navigation.navigate(ROUTES.MyBookings as never)}
          />

          <View style={styles.divider} />

          <MenuRow
            icon="key-outline"
            title="Đổi mật khẩu"
            subtitle="Cập nhật mật khẩu đăng nhập"
            onPress={() => navigation.navigate(ROUTES.ChangePassword as never)}
          />

          <View style={styles.divider} />

          {/* <MenuRow
            icon="cloud-outline"
            title="My Drive"
            subtitle="Tải lên & quản lý tệp"
            onPress={() => navigation.navigate("Drive" as never)}
          /> */}

          <View style={styles.divider} />

          <MenuRow
            icon="gift-outline"
            title="Khách hàng thân thiết"
            subtitle="Tích điểm & đổi voucher"
            onPress={() => navigation.navigate("LoyaltyProgram" as never)}
          />

          <View style={styles.divider} />

          {!isDriver ? (
            <MenuRow
              icon="car-outline"
              title="Đăng ký làm tài xế"
              subtitle="Mở quyền tài xế"
              onPress={() => navigation.navigate("DriverRegister" as never)}
            />
          ) : (
            <MenuRow
              icon="speedometer-outline"
              title="Khu vực tài xế"
              subtitle="Màn hình dành cho tài xế"
              onPress={() => navigation.navigate("DriverHome" as never)}
            />
          )}

          <View style={styles.divider} />

          <MenuRow
            icon="help-circle-outline"
            title="Trợ giúp"
            subtitle="Hướng dẫn & hỗ trợ"
            onPress={() =>
              Alert.alert("Thông báo", "Tính năng đang phát triển.")
            }
          />
        </AppCard>

        {/* Logout */}
        <View style={{ marginTop: SPACING.lg }}>
          <AppButton
            title="Đăng xuất"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>

        <Text style={styles.footerNote}>
          Online Bus Ticket Platform • {new Date().getFullYear()}
        </Text>
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

  profileCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  name: {
    ...TYPOGRAPHY.h4,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  email: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  phone: {
    marginTop: 2,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    lineHeight: 16, // ✅ ép lineHeight để cân icon
    includeFontPadding: false, // ✅ Android: giảm padding font
    textAlignVertical: "center", // ✅ Android: canh giữa theo chiều dọc
  },

  menuCard: {
    paddingVertical: SPACING.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  rowTitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
  },
  rowSub: {
    marginTop: 2,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  divider: {
    height: 1,
    backgroundColor: withOpacity(COLORS.border.light, 0.9),
    marginLeft: SPACING.lg,
  },

  footerNote: {
    marginTop: SPACING.lg,
    textAlign: "center",
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.7),
  },
});
