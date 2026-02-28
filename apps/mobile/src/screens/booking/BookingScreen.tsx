import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { COLORS, withOpacity, SPACING, TYPOGRAPHY, LAYOUT, ICONS } from "@/theme";

interface Trip {
  id: string;
  company: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seats: number;
  vehicleType: string;
  amenities: string[];
  from: string;
  to: string;
  date: string;
  departureLocation: string;
  arrivalLocation: string;
}

type BookingRouteProp = RouteProp<
  {
    Booking: {
      trip: Trip;
      selectedSeats: number[];
      passengers: number;
    };
  },
  "Booking"
>;

interface PassengerInfo {
  name: string;
  phone: string;
  idCard: string;
}

type FieldErrors = Record<string, string | undefined>;

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<BookingRouteProp>();
  const { trip, selectedSeats, passengers } = route.params ?? ({} as any);

  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo[]>(
    Array(passengers || 0)
      .fill(null)
      .map(() => ({ name: "", phone: "", idCard: "" }))
  );

  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const totalPrice = useMemo(() => {
    const count = passengers || 0;
    return (trip?.price || 0) * count;
  }, [trip?.price, passengers]);

  const handleInputChange = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengerInfo((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleContactChange = (field: keyof typeof contactInfo, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    setFormError(null);

    // Passenger info
    for (let i = 0; i < (passengers || 0); i++) {
      const p = passengerInfo[i];
      if (!p?.name?.trim()) nextErrors[`p.${i}.name`] = `Vui lòng nhập họ tên hành khách ${i + 1}`;
      if (!p?.phone?.trim()) nextErrors[`p.${i}.phone`] = `Vui lòng nhập số điện thoại hành khách ${i + 1}`;
      if (!p?.idCard?.trim()) nextErrors[`p.${i}.idCard`] = `Vui lòng nhập CMND/CCCD hành khách ${i + 1}`;
    }

    // Contact info
    if (!contactInfo.name.trim()) nextErrors["c.name"] = "Vui lòng nhập tên người liên hệ";
    if (!contactInfo.phone.trim()) nextErrors["c.phone"] = "Vui lòng nhập số điện thoại liên hệ";

    setErrors(nextErrors);

    const ok = Object.keys(nextErrors).length === 0;
    if (!ok) setFormError("Vui lòng kiểm tra lại các trường bắt buộc.");
    return ok;
  };

  const handleConfirmBooking = () => {
    if (!validateForm()) return;

    Alert.alert(
      "Xác nhận đặt vé",
      `Bạn có chắc chắn muốn đặt ${passengers} vé với tổng tiền ${totalPrice.toLocaleString("vi-VN")}đ?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            // TODO: Call API to create booking
            Alert.alert(
              "Thành công!",
              "Vé đã được đặt thành công. Chúng tôi sẽ gửi thông tin chi tiết qua email.",
              [{ text: "OK", onPress: () => navigation.navigate("MyBookings") }]
            );
          },
        },
      ]
    );
  };

  if (!trip) {
    return (
      <AppScreen statusBarStyle="dark-content">
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name={ICONS.arrowBack as any} size={22} color={COLORS.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Đặt vé</Text>
          <View style={{ width: LAYOUT.headerIconSize }} />
        </View>

        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={54} color={COLORS.error.main} />
          <Text style={styles.centerTitle}>Không thể tải thông tin chuyến xe</Text>
          <Text style={styles.centerSub}>Vui lòng quay lại và thử lại.</Text>
          <AppButton title="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen statusBarStyle="dark-content">
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name={ICONS.arrowBack as any} size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Đặt vé</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!!formError && <AppFormMessage variant="error" message={formError} />}

        {/* Trip Summary */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin chuyến xe</Text>

          <View style={styles.routeRow}>
            <View style={[styles.routeIcon, { backgroundColor: withOpacity(COLORS.primary.main, 0.10) }]}>
              <Ionicons name={ICONS.location as any} size={18} color={COLORS.primary.main} />
            </View>

            <Text style={styles.routeText} numberOfLines={2}>
              {trip.from} <Text style={{ color: COLORS.text.secondary }}>→</Text> {trip.to}
            </Text>
          </View>

          <View style={styles.kv}>
            <KV label="Ngày" value={trip.date} />
            <KV label="Giờ khởi hành" value={trip.departureTime} />
            <KV label="Công ty" value={trip.company} />
            <KV label="Ghế đã chọn" value={(selectedSeats || []).join(", ")} />
          </View>
        </AppCard>

        {/* Passenger Information */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin hành khách</Text>
          <Text style={styles.sectionSub}>Nhập thông tin cho {passengers} hành khách.</Text>

          {passengerInfo.map((p, idx) => (
            <View key={idx} style={styles.passengerBlock}>
              <View style={styles.passengerHeader}>
                <Text style={styles.passengerTitle}>Hành khách {idx + 1}</Text>
                <View style={styles.seatPill}>
                  <Ionicons name="car-outline" size={14} color={COLORS.text.inverse} />
                  <Text style={styles.seatPillText}>
                    Ghế {selectedSeats?.[idx] ?? "-"}
                  </Text>
                </View>
              </View>

              <AppInput
                icon="person-outline"
                label="Họ và tên *"
                value={p.name}
                onChangeText={(v) => handleInputChange(idx, "name", v)}
                placeholder="Nhập họ và tên"
                errorText={errors[`p.${idx}.name`]}
              />

              <AppInput
                icon="call-outline"
                label="Số điện thoại *"
                value={p.phone}
                onChangeText={(v) => handleInputChange(idx, "phone", v)}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                errorText={errors[`p.${idx}.phone`]}
              />

              <AppInput
                icon="card-outline"
                label="CMND/CCCD *"
                value={p.idCard}
                onChangeText={(v) => handleInputChange(idx, "idCard", v)}
                placeholder="Nhập số CMND/CCCD"
                keyboardType="numeric"
                errorText={errors[`p.${idx}.idCard`]}
              />
            </View>
          ))}
        </AppCard>

        {/* Contact Information */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <Text style={styles.sectionSub}>Dùng để liên hệ về vé và gửi thông tin.</Text>

          <AppInput
            icon="person-outline"
            label="Họ và tên *"
            value={contactInfo.name}
            onChangeText={(v) => handleContactChange("name", v)}
            placeholder="Nhập họ và tên người liên hệ"
            errorText={errors["c.name"]}
          />

          <AppInput
            icon="call-outline"
            label="Số điện thoại *"
            value={contactInfo.phone}
            onChangeText={(v) => handleContactChange("phone", v)}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            errorText={errors["c.phone"]}
          />

          <AppInput
            icon="mail-outline"
            label="Email"
            value={contactInfo.email}
            onChangeText={(v) => handleContactChange("email", v)}
            placeholder="Nhập email (không bắt buộc)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </AppCard>

        {/* Payment Method */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          <View style={styles.paymentRow}>
            <PaymentOption
              active={paymentMethod === "cash"}
              icon="cash-outline"
              title="Tiền mặt"
              subtitle="Thanh toán khi lên xe"
              onPress={() => setPaymentMethod("cash")}
            />
            <PaymentOption
              active={paymentMethod === "card"}
              icon="card-outline"
              title="Thẻ"
              subtitle="Tín dụng / ghi nợ"
              onPress={() => setPaymentMethod("card")}
            />
          </View>

          <AppFormMessage
            variant="info"
            message={
              paymentMethod === "cash"
                ? "Bạn sẽ thanh toán trực tiếp cho nhà xe."
                : "Phương thức thẻ sẽ được hỗ trợ ở bước thanh toán."
            }
            style={{ marginTop: SPACING.md, marginBottom: 0 }}
          />
        </AppCard>

        {/* Price Summary */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Tổng thanh toán</Text>

          <PriceRow label={`Giá vé × ${passengers}`} value={`${trip.price.toLocaleString("vi-VN")}đ`} />
          <PriceRow label="Phí dịch vụ" value="0đ" />

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{totalPrice.toLocaleString("vi-VN")}đ</Text>
          </View>
        </AppCard>

        {/* Confirm */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}>
          <AppButton title="Xác nhận đặt vé" onPress={handleConfirmBooking} />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

/* -------------------- Helpers -------------------- */

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

function PaymentOption({
  active,
  icon,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.paymentOption,
        active ? styles.paymentOptionActive : styles.paymentOptionInactive,
      ]}
    >
      <View
        style={[
          styles.paymentIconWrap,
          { backgroundColor: active ? withOpacity(COLORS.primary.main, 0.12) : COLORS.background.tertiary },
        ]}
      >
        <Ionicons name={icon} size={22} color={active ? COLORS.primary.main : COLORS.text.secondary} />
      </View>

      <Text style={[styles.paymentTitle, active && { color: COLORS.primary.main }]}>
        {title}
      </Text>
      <Text style={styles.paymentSub}>{subtitle}</Text>

      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
      </View>
    </Pressable>
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

  paymentRow: {
    flexDirection: "row",
    gap: SPACING.md as any,
    marginTop: SPACING.md,
  },
  paymentOption: {
    flex: 1,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  paymentOptionActive: {
    borderColor: withOpacity(COLORS.primary.main, 0.35),
    backgroundColor: withOpacity(COLORS.primary.main, 0.06),
  },
  paymentOptionInactive: {
    borderColor: withOpacity(COLORS.border.light, 0.95),
    backgroundColor: COLORS.background.primary,
  },
  paymentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    marginBottom: SPACING.sm,
  },
  paymentTitle: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  paymentSub: {
    marginTop: 2,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
  },
  radio: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background.primary,
  },
  radioActive: {
    borderColor: COLORS.primary.main,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primary.main,
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
    color: COLORS.primary.main,
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
