import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { bookingService } from "../../services/user/bookingService";
import type { Trip } from "../../types/index-types";

import {
  COLORS,
  withOpacity,
  SPACING,
  TYPOGRAPHY,
  LAYOUT,
  ICONS,
} from "@/theme";

/* ================= TYPES ================= */

type BookingCheckoutRouteProp = RouteProp<
  {
    BookingCheckout: {
      trip: Trip;
      selectedSeats: string[];
      totalAmount: number;
    };
  },
  "BookingCheckout"
>;

interface PassengerInfo {
  name: string;
  phone: string;
  email: string;
  idNumber: string;
}

// ✅ CHUẨN: KHÔNG seatId (để tránh BSONError ở backend)
type CreateHoldPayload = {
  tripId: string;
  passengers: Array<{
    name: string;
    phone: string;
    email?: string;
    idNumber?: string;
    seatNumber: string; // ✅ bắt buộc
  }>;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
};

type FieldErrors = Record<string, string | undefined>;

/* ================= HELPERS ================= */

const unwrapTrip = (input: any) => (input?.data ? input.data : input);

const getTripIdSafe = (t: any) =>
  String(t?.tripId ?? t?._id ?? t?.id ?? "").trim();

const isObjectId = (s: any) =>
  typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);

/* ================= COMPONENT ================= */

export default function BookingCheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute<BookingCheckoutRouteProp>();
  const { trip, selectedSeats, totalAmount } = route.params ?? ({} as any);

  const unwrappedTrip: any = unwrapTrip(trip) ?? {};

  const [loading, setLoading] = useState(false);

  // auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // forms
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  /* ================= INIT ================= */

  useEffect(() => {
    const initialPassengers = (selectedSeats ?? []).map(() => ({
      name: "",
      phone: "",
      email: "",
      idNumber: "",
    }));
    setPassengers(initialPassengers);
  }, [selectedSeats]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const token = await AsyncStorage.getItem("accessToken");
        const userData = await AsyncStorage.getItem("user");

        if (token && userData) {
          setIsAuthenticated(true);
          setUserInfo(JSON.parse(userData));
        } else {
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    };

    checkAuthStatus();
  }, []);

  /* ================= FORMAT ================= */

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const normalizePhone = (phone: string) => {
    if (!phone) return "";

    // giữ lại chỉ số
    let digits = phone.replace(/\D/g, "");

    // nếu nhập +84xxxxxxxxx → đổi thành 0xxxxxxxxx
    if (digits.startsWith("84")) {
      digits = "0" + digits.slice(2);
    }

    return digits;
  };

  /* ================= FORM HELPERS ================= */

  const updatePassenger = (
    index: number,
    field: keyof PassengerInfo,
    value: string,
  ) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateContactInfo = (
    field: keyof typeof contactInfo,
    value: string,
  ) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const priceBreakdown = useMemo(() => {
    const count = selectedSeats?.length ?? 0;
    const base = Number(unwrappedTrip?.price ?? trip?.price ?? 0) * count;
    const fee = 0;
    const total = Number(totalAmount ?? base + fee);
    return { count, base, fee, total };
  }, [selectedSeats?.length, totalAmount, unwrappedTrip?.price, trip?.price]);

  /* ================= VALIDATE ================= */

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    setFormError(null);

    // guest contact
    if (!isAuthenticated) {
      if (!contactInfo.name.trim())
        nextErrors["contact.name"] = "Vui lòng nhập tên người liên hệ";
      if (!contactInfo.phone.trim())
        nextErrors["contact.phone"] = "Vui lòng nhập số điện thoại liên hệ";
    }

    // passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim())
        nextErrors[`p.${i}.name`] = `Vui lòng nhập tên hành khách ${i + 1}`;
      if (!p.phone.trim())
        nextErrors[`p.${i}.phone`] =
          `Vui lòng nhập số điện thoại hành khách ${i + 1}`;
      if (!p.idNumber.trim())
        nextErrors[`p.${i}.idNumber`] =
          `Vui lòng nhập CMND/CCCD hành khách ${i + 1}`;
    }

    setErrors(nextErrors);

    const ok = Object.keys(nextErrors).length === 0;
    if (!ok) setFormError("Vui lòng kiểm tra lại các trường bắt buộc.");
    return ok;
  };

  /* ================= SUBMIT ================= */

  const handleCreateBooking = async () => {
    if (!validateForm()) return;

    const tripId = getTripIdSafe(unwrappedTrip);

    console.log("🚀 POST /bookings/hold");
    console.log("✅ tripId resolved =", tripId);
    console.log("🧾 trip keys =", Object.keys(unwrappedTrip ?? {}));
    console.log(
      "🧾 trip._id =",
      unwrappedTrip?._id,
      "trip.id =",
      unwrappedTrip?.id,
    );

    if (!tripId) {
      Alert.alert(
        "Lỗi",
        "Trip ID bị thiếu. Hãy đảm bảo TripDetails -> BookingCheckout truyền trip có field id/_id.",
      );
      return;
    }

    // ✅ tripId của bạn là ObjectId => check nhẹ để debug
    if (!isObjectId(tripId)) {
      console.warn("⚠️ tripId không giống ObjectId:", tripId);
      // Không block nếu backend của bạn dùng id kiểu khác.
      // Nhưng log để bạn biết.
    }

    // ✅ IMPORTANT: passengers dùng seatNumber thôi (không seatId)
    const payload: CreateHoldPayload = {
      tripId,
      passengers: passengers.map((p, idx) => ({
        name: p.name.trim(),
        phone: p.phone.trim(),
        email: p.email.trim() || undefined,
        idNumber: p.idNumber.trim() || undefined,
        seatNumber: String(selectedSeats?.[idx] ?? "").trim(),
      })),
      contactName: String(
        isAuthenticated ? userInfo?.name : contactInfo.name,
      ).trim(),
      contactPhone: normalizePhone(
        isAuthenticated ? (userInfo?.phone ?? "") : contactInfo.phone,
      ),
      contactEmail:
        String(isAuthenticated ? userInfo?.email : contactInfo.email).trim() ||
        undefined,
    };

    // check seatNumber rỗng
    const invalidSeat = payload.passengers.find((x) => !x.seatNumber);
    if (invalidSeat) {
      Alert.alert("Lỗi", "SeatNumber bị thiếu. Hãy chọn ghế lại.");
      return;
    }

    console.log("🧾 HOLD payload =", payload);

    try {
      setLoading(true);

      const res: any = await bookingService.createHold(payload);
      const booking = res?.data ?? res;

      const bookingId = String(booking?._id ?? booking?.id ?? "");

      console.log("✅ createHold response =", res);
      console.log("✅ bookingId =", bookingId);

      if (!bookingId) {
        Alert.alert(
          "Lỗi",
          "Không lấy được bookingId từ response.\n\nBackend phải trả về _id hoặc id.",
        );
        return;
      }

      Alert.alert(
        "Đặt vé thành công!",
        `Mã đặt vé: ${bookingId}\nVui lòng thanh toán để hoàn tất đặt vé.`,
        [
          {
            text: "OK",
            onPress: () =>
              (navigation as any).navigate("PaymentCheckout", { bookingId }),
          },
        ],
      );
    } catch (error: any) {
      console.log("❌ createHold error =", error?.response?.data ?? error);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message ||
          error?.message ||
          "Không thể giữ chỗ lúc này. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  if (!trip) {
    return (
      <AppScreen statusBarStyle="dark-content">
        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={54}
            color={COLORS.error.main}
          />
          <Text style={styles.centerTitle}>
            Không thể tải thông tin chuyến xe
          </Text>
          <Text style={styles.centerSub}>Vui lòng quay lại và thử lại.</Text>
          <AppButton
            title="Quay lại"
            onPress={() => (navigation as any).goBack()}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen statusBarStyle="dark-content">
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (navigation as any).goBack()}
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Ionicons
            name={ICONS.arrowBack as any}
            size={22}
            color={COLORS.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Xác nhận đặt vé</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!!formError && <AppFormMessage variant="error" message={formError} />}

        {/* Trip Summary */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin chuyến xe</Text>

          <View style={styles.routeRow}>
            <View
              style={[
                styles.routeIcon,
                { backgroundColor: withOpacity(COLORS.primary.main, 0.1) },
              ]}
            >
              <Ionicons
                name={ICONS.location as any}
                size={18}
                color={COLORS.primary.main}
              />
            </View>

            <Text style={styles.routeText} numberOfLines={2}>
              {unwrappedTrip?.route?.fromLocationId?.name || "Điểm đi"}{" "}
              <Text style={{ color: COLORS.text.secondary }}>→</Text>{" "}
              {unwrappedTrip?.route?.toLocationId?.name || "Điểm đến"}
            </Text>
          </View>

          <View style={styles.kv}>
            <KV
              label="Ngày đi"
              value={formatDate(unwrappedTrip?.departureTime)}
            />
            <KV
              label="Giờ khởi hành"
              value={formatTime(unwrappedTrip?.departureTime)}
            />
            <KV
              label="Nhà xe"
              value={unwrappedTrip?.companyId?.name || "Nhà xe"}
            />
            <KV label="Ghế đã chọn" value={(selectedSeats || []).join(", ")} />
          </View>
        </AppCard>

        {/* Contact */}
        <AppCard style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>
              {isAuthenticated ? "Thông tin tài khoản" : "Thông tin liên hệ"}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {isAuthenticated ? "Đã đăng nhập" : "Khách"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionSub}>
            {isAuthenticated
              ? "Thông tin từ tài khoản sẽ được sử dụng để liên hệ."
              : "Thông tin này sẽ được dùng để liên lạc về vé của bạn."}
          </Text>

          {isAuthenticated && userInfo ? (
            <View style={styles.userBox}>
              <UserRow icon="person" text={userInfo?.name || "—"} />
              <UserRow icon="call" text={userInfo?.phone || "—"} />
              {!!userInfo?.email && (
                <UserRow icon="mail" text={userInfo.email} />
              )}
              <Text style={styles.userNote}>
                ✅ Thông tin từ tài khoản của bạn
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: SPACING.sm }}>
              <AppInput
                icon="person-outline"
                label="Họ và tên *"
                value={contactInfo.name}
                onChangeText={(t) => updateContactInfo("name", t)}
                placeholder="Nhập họ và tên"
                errorText={errors["contact.name"]}
              />
              <AppInput
                icon="call-outline"
                label="Số điện thoại *"
                value={contactInfo.phone}
                onChangeText={(t) => updateContactInfo("phone", t)}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                errorText={errors["contact.phone"]}
              />
              <AppInput
                icon="mail-outline"
                label="Email"
                value={contactInfo.email}
                onChangeText={(t) => updateContactInfo("email", t)}
                placeholder="Nhập email (không bắt buộc)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
        </AppCard>

        {/* Passengers */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin hành khách</Text>
          <Text style={styles.sectionSub}>
            Vui lòng nhập đầy đủ thông tin cho từng hành khách (
            {selectedSeats?.length || 0} người).
          </Text>

          {(passengers || []).map((p, idx) => (
            <View key={idx} style={styles.passengerBlock}>
              <View style={styles.passengerHeader}>
                <Text style={styles.passengerTitle}>Hành khách {idx + 1}</Text>
                <View style={styles.seatPill}>
                  <Ionicons
                    name="car-outline"
                    size={14}
                    color={COLORS.text.inverse}
                  />
                  <Text style={styles.seatPillText}>
                    Ghế {selectedSeats?.[idx]}
                  </Text>
                </View>
              </View>

              <AppInput
                icon="person-outline"
                label="Họ và tên *"
                value={p.name}
                onChangeText={(t) => updatePassenger(idx, "name", t)}
                placeholder="Nhập họ và tên"
                errorText={errors[`p.${idx}.name`]}
              />

              <AppInput
                icon="call-outline"
                label="Số điện thoại *"
                value={p.phone}
                onChangeText={(t) => updatePassenger(idx, "phone", t)}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                errorText={errors[`p.${idx}.phone`]}
              />

              <AppInput
                icon="card-outline"
                label="CMND/CCCD *"
                value={p.idNumber}
                onChangeText={(t) => updatePassenger(idx, "idNumber", t)}
                placeholder="Nhập số CMND/CCCD"
                keyboardType="numeric"
                errorText={errors[`p.${idx}.idNumber`]}
              />

              <AppInput
                icon="mail-outline"
                label="Email"
                value={p.email}
                onChangeText={(t) => updatePassenger(idx, "email", t)}
                placeholder="Nhập email (không bắt buộc)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          ))}
        </AppCard>

        {/* Price */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Tóm tắt giá</Text>

          <PriceRow
            label={`Giá vé × ${priceBreakdown.count}`}
            value={formatPrice(priceBreakdown.base)}
          />
          <PriceRow
            label="Phí dịch vụ"
            value={formatPrice(priceBreakdown.fee)}
          />

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>
              {formatPrice(priceBreakdown.total)}
            </Text>
          </View>
        </AppCard>

        {/* Terms */}
        <AppCard
          style={[styles.card, { backgroundColor: COLORS.background.tertiary }]}
        >
          <Text style={styles.sectionTitle}>Điều khoản</Text>
          <Text style={styles.termsText}>
            Bằng việc đặt vé, bạn đồng ý với các điều khoản và điều kiện của
            chúng tôi. Vé đã đặt không thể hoàn lại hoặc thay đổi sau khi thanh
            toán.
          </Text>

          <AppFormMessage
            variant="info"
            message="Mẹo: Hãy kiểm tra kỹ thông tin hành khách trước khi xác nhận."
            style={{ marginTop: SPACING.md, marginBottom: 0 }}
          />
        </AppCard>

        {/* Confirm */}
        <View
          style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}
        >
          <AppButton
            title={loading ? "Đang xử lý..." : "Xác nhận đặt vé"}
            onPress={handleCreateBooking}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* -------------------- Small UI helpers -------------------- */

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

function UserRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.userRow}>
      <Ionicons name={icon} size={16} color={COLORS.primary.main} />
      <Text style={styles.userText}>{text}</Text>
    </View>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(COLORS.border.light, 0.9),
  },
  headerBtn: {
    width: LAYOUT.headerIconSize,
    height: LAYOUT.headerIconSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: LAYOUT.borderRadius.round,
    backgroundColor: withOpacity(COLORS.background.secondary, 0.85),
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: TYPOGRAPHY.h5.fontSize,
    fontWeight: TYPOGRAPHY.h5.fontWeight as any,
    color: COLORS.text.primary,
  },

  scrollContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },

  card: {
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.h6.fontSize,
    fontWeight: TYPOGRAPHY.h6.fontWeight as any,
    color: COLORS.text.primary,
  },
  sectionSub: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.primary.main, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.18),
  },
  badgeText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
    color: COLORS.primary.main,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md as any,
    marginTop: SPACING.md,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
  },
  routeText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  kv: {
    marginTop: SPACING.md,
    gap: SPACING.sm as any,
  },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md as any,
  },
  kvLabel: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  kvValue: {
    flex: 1,
    textAlign: "right",
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  userBox: {
    marginTop: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.16),
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm as any,
    marginBottom: SPACING.xs,
  },
  userText: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  userNote: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "800",
    color: COLORS.primary.dark,
  },

  passengerBlock: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.95),
  },
  passengerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  passengerTitle: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  seatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6 as any,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primary.main,
  },
  seatPillText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
    color: COLORS.text.inverse,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  divider: {
    height: 1,
    marginTop: SPACING.md,
    backgroundColor: withOpacity(COLORS.border.light, 0.9),
  },
  totalRow: {
    marginTop: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.h5.fontSize,
    fontWeight: TYPOGRAPHY.h5.fontWeight as any,
    color: COLORS.secondary.main,
  },

  termsText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    gap: SPACING.sm as any,
  },
  centerTitle: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.h5.fontSize,
    fontWeight: TYPOGRAPHY.h5.fontWeight as any,
    color: COLORS.text.primary,
    textAlign: "center",
  },
  centerSub: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
});
