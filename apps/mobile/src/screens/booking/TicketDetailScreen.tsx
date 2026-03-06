import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { bookingService } from "@/services/user/bookingService";
import { downloadTicketPdfFromBooking } from "@/utils/ticketPdf";
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT, ICONS, withOpacity } from "@/theme";

type Props = any;

export default function TicketDetailScreen({ navigation, route }: Props) {
  const bookingId: string = String(route?.params?.bookingId ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);

  const load = useCallback(async () => {
    if (!bookingId) {
      setError("Thiếu bookingId.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res: any = await bookingService.getBookingById(bookingId);
      const b = res?.data ?? res;
      setBooking(b);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.friendlyMessage || e?.message || "Không tải được vé.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const trip = booking?.tripId;
  const from = trip?.route?.fromLocationId?.name ?? "-";
  const to = trip?.route?.toLocationId?.name ?? "-";
  const company = trip?.companyId?.name ?? booking?.companyId?.name ?? "-";

  const seats: string[] = Array.isArray(booking?.passengers)
    ? booking.passengers.map((p: any) => p?.seatNumber).filter(Boolean)
    : [];

  const ticketCode = booking?.ticketCode;
  const paymentStatus = String(booking?.paymentStatus || "").toLowerCase();
  const isPaid = paymentStatus === "paid" || String(booking?.status || "").toLowerCase().includes("confirm");

  // ✅ QR payload: dùng JSON để tài xế scan chắc chắn (driver scanner sẽ tự lấy ticketCode)
  const qrValue = useMemo(() => {
    if (!ticketCode) return "";
    const tripId = (trip && (trip._id || trip.id)) ? String(trip._id || trip.id) : undefined;
    return JSON.stringify({
      ticketCode: String(ticketCode),
      bookingId,
      tripId,
    });
  }, [ticketCode, bookingId, trip]);

  const dtText = useMemo(() => {
    const dep = trip?.departureTime;
    if (!dep) return "-";
    const d = new Date(dep);
    return `${d.toLocaleDateString("vi-VN")} • ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  }, [trip?.departureTime]);

  const onPay = () => {
    (navigation as any).navigate("PaymentCheckout", { bookingId });
  };

  const onShowUsed = () => {
    Alert.alert(
      "Thông tin",
      booking?.checkedInAt
        ? `Vé đã được quét lúc: ${new Date(booking.checkedInAt).toLocaleString("vi-VN")}`
        : "Vé chưa được quét.",
    );
  };

  const onDownload = async () => {
    try {
      if (!booking) return;
      await downloadTicketPdfFromBooking(booking, {
        androidPickDirectory: true,
        fileName: booking?.ticketCode ? `ve_${booking.ticketCode}` : `ve_${bookingId}`,
      });
    } catch (e) {
      console.log("❌ download ticket error:", e);
      Alert.alert("Lỗi", "Không thể tải vé. Vui lòng thử lại.");
    }
  };

  const driverObj = booking?.checkedInByDriverId;
  const driverId =
    (driverObj && (driverObj._id || driverObj.id)) ||
    (typeof driverObj === "string" ? driverObj : null) ||
    booking?.checkedInByDriverId;

  const driverName =
    (driverObj && (driverObj.name || driverObj.email || driverObj.phone)) ||
    booking?.checkedInBy ||
    "Tài xế";

  const canReviewDriver =
    !!booking?.checkedInAt && !!driverId && !booking?.driverReviewId;

  const onReviewDriver = () => {
    (navigation as any).navigate("ReviewDriver", { bookingId });
  };

  return (
    <AppScreen statusBarStyle="dark-content">
      <View style={styles.header}>
        <Pressable onPress={() => (navigation as any).goBack()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name={ICONS.arrowBack as any} size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Vé</Text>
        <Pressable onPress={load} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="refresh" size={20} color={COLORS.text.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 28 }}>
        {!!error && <AppFormMessage variant="error" message={error} />}

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin vé</Text>
          <Text style={styles.subText}>Mã đặt chỗ: {bookingId}</Text>

          <View style={styles.kv}>
            <KV label="Tuyến" value={`${from} → ${to}`} />
            <KV label="Nhà xe" value={company} />
            <KV label="Ngày giờ" value={dtText} />
            <KV label="Ghế" value={seats.length ? seats.join(", ") : "-"} />
            <KV label="Tổng" value={`${Number(booking?.totalAmount ?? 0).toLocaleString("vi-VN")}đ`} />
            <KV label="Trạng thái" value={String(booking?.status ?? "-")} />
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Mã vé (QR)</Text>

          {!isPaid ? (
            <>
              <AppFormMessage
                variant="warning"
                message="Vé đang ở trạng thái giữ chỗ / chưa thanh toán. Hãy thanh toán để nhận mã vé."
              />
              <AppButton title={loading ? "Đang tải..." : "Thanh toán"} onPress={onPay} disabled={loading} />
            </>
          ) : ticketCode ? (
            <View style={{ alignItems: "center", marginTop: SPACING.md }}>
              <View style={styles.qrBox}>
                <QRCode value={qrValue} size={200} />
              </View>
              <Text style={styles.ticketCodeText}>{ticketCode}</Text>
              <Text style={styles.qrHint}>Đưa QR/mã vé này cho tài xế để quét</Text>

              <View style={{ height: SPACING.sm }} />
              <AppButton title="Trạng thái sử dụng" variant="secondary" onPress={onShowUsed} />
              <View style={{ height: SPACING.sm }} />
              <AppButton title="Tải vé (PDF)" onPress={onDownload} />
            </View>
          ) : (
            <>
              <AppFormMessage
                variant="info"
                message="Đang chờ hệ thống cập nhật mã vé (ticketCode). Hãy bấm làm mới sau vài giây."
              />
              <AppButton title="Làm mới" onPress={load} />
            </>
          )}
        {isPaid && booking?.checkedInAt && (
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>Đánh giá tài xế</Text>
            <Text style={styles.subText}>Tài xế: {driverName}</Text>

            {booking?.driverReviewId ? (
              <AppFormMessage variant="success" message="Bạn đã đánh giá tài xế cho chuyến đi này." />
            ) : canReviewDriver ? (
              <AppButton title="Đánh giá" onPress={onReviewDriver} />
            ) : (
              <AppFormMessage
                variant="info"
                message="Bạn có thể đánh giá sau khi tài xế quét vé (check-in)."
              />
            )}
          </AppCard>
        )}

        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}

const KV = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.kvRow}>
    <Text style={styles.kvLabel}>{label}</Text>
    <Text style={styles.kvValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  card: { padding: SPACING.md, borderRadius: 18, marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  subText: { marginTop: 6, color: COLORS.text.secondary, fontWeight: "600" },

  kv: { marginTop: SPACING.sm },
  kvRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(COLORS.border.light, 0.7),
  },
  kvLabel: { color: COLORS.text.secondary, fontWeight: "700" },
  kvValue: { color: COLORS.text.primary, fontWeight: "800", maxWidth: "62%", textAlign: "right" },

  qrBox: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
  },
  ticketCodeText: { marginTop: 10, fontWeight: "900", fontSize: 18, color: COLORS.text.primary },
  qrHint: { marginTop: 6, fontSize: 13, color: COLORS.text.secondary, fontWeight: "600", textAlign: "center" },
});
