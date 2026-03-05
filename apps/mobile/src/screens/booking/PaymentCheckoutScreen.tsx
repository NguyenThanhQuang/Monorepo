import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppFormMessage from "@/components/ui/AppFormMessage";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  LAYOUT,
  ICONS,
  withOpacity,
} from "@/theme";
import { paymentService } from "@/services/user/paymentService";
import { bookingService } from "@/services/user/bookingService";

type Props = any;

function formatMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function PaymentCheckoutScreen({ navigation, route }: Props) {
  const bookingId: string = String(route?.params?.bookingId ?? "");
  const statusFromLink: string | undefined = route?.params?.status;

  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{
    checkoutUrl: string;
    qrCode?: string;
    orderCode?: number;
  } | null>(null);

  const [holdLeftMs, setHoldLeftMs] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const title = useMemo(() => {
    if (statusFromLink === "success") return "Thanh toán thành công";
    if (statusFromLink === "cancel") return "Thanh toán đã hủy";
    return "Thanh toán";
  }, [statusFromLink]);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startCountdownFromHeldUntil = useCallback(
    (heldUntil?: any) => {
      stopCountdown();
      if (!heldUntil) {
        setHoldLeftMs(null);
        return;
      }
      const end = new Date(heldUntil).getTime();
      if (!Number.isFinite(end)) {
        setHoldLeftMs(null);
        return;
      }
      const tick = () => {
        const left = end - Date.now();
        setHoldLeftMs(left);
        if (left <= 0) stopCountdown();
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [stopCountdown],
  );

  useEffect(() => {
    return () => stopCountdown();
  }, [stopCountdown]);

  const loadBookingAndUpdateCountdown = useCallback(async () => {
    if (!bookingId) return;
    try {
      const b: any = await bookingService.getBookingById(bookingId);
      const booking = b?.data ?? b;
      startCountdownFromHeldUntil(booking?.heldUntil);
    } catch {
      // ignore
    }
  }, [bookingId, startCountdownFromHeldUntil]);

  const loadLink = useCallback(async () => {
    if (!bookingId) {
      setError("Thiếu bookingId để thanh toán.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ tạo/hoặc lấy lại link (backend nên không tạo order mới nếu còn pending)
      const pl = await paymentService.createPaymentLink(bookingId);
      setLink(pl);

      // lấy heldUntil để hiển thị countdown
      await loadBookingAndUpdateCountdown();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.friendlyMessage ||
        e?.message ||
        "Không thể tạo link thanh toán.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [bookingId, loadBookingAndUpdateCountdown]);

  // ✅ Không auto tạo link mới khi quay lại từ success/cancel
  useEffect(() => {
    if (statusFromLink === "success" || statusFromLink === "cancel") {
      loadBookingAndUpdateCountdown();
      return;
    }
    if (link?.checkoutUrl) return;
    loadLink();
  }, [
    loadLink,
    statusFromLink,
    link?.checkoutUrl,
    loadBookingAndUpdateCountdown,
  ]);

  const openCheckout = useCallback(async () => {
    if (!link?.checkoutUrl) return;
    try {
      await Linking.openURL(link.checkoutUrl);
    } catch {
      Alert.alert("Lỗi", "Không thể mở trang thanh toán.");
    }
  }, [link?.checkoutUrl]);

  const cancelHoldNow = useCallback(async () => {
    if (!bookingId) return;
    Alert.alert(
      "Hủy giữ chỗ?",
      "Bạn chắc chắn muốn hủy giữ chỗ. Ghế sẽ được trả về trạng thái trống.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy",
          style: "destructive",
          onPress: async () => {
            try {
              setPolling(true);
              setError(null);
              await bookingService.cancelBooking(bookingId);
              stopCountdown();
              Alert.alert("Đã hủy", "Ghế đã được trả về trạng thái trống.");
              (navigation as any).goBack();
            } catch (e: any) {
              const msg =
                e?.response?.data?.message ||
                e?.message ||
                "Không thể hủy giữ chỗ.";
              setError(msg);
            } finally {
              setPolling(false);
            }
          },
        },
      ],
    );
  }, [bookingId, navigation, stopCountdown]);

  const checkPaidAndGoTicket = useCallback(async () => {
    if (!bookingId) return;

    try {
      setPolling(true);
      setError(null);

      // 1) ✅ Sync thật từ PayOS (dù DEV/PROD). Nếu backend cấu hình PayOS, call này sẽ:
      //    - PAID  -> confirmBooking -> sinh ticketCode
      //    - CANCELLED/EXPIRED -> hủy giữ chỗ
      try {
        const r: any = await paymentService.syncPayment(bookingId);
        const st = String(r?.status || "").toUpperCase();
        if (st === "CANCELLED" || st === "EXPIRED") {
          Alert.alert(
            "Đơn đã hủy/hết hạn",
            "Giữ chỗ đã bị hủy hoặc hết hạn. Vui lòng đặt lại.",
            [{ text: "OK", onPress: () => (navigation as any).goBack() }],
          );
          return;
        }
      } catch {
        // ignore -> vẫn poll booking
      }

      // 2) ✅ DEV confirm (tuỳ chọn): dùng khi bạn chưa cấu hình PayOS.
      //    Lưu ý: backend phải bật PAYMENT_DEV_MODE=true.
      if (__DEV__) {
        try {
          await paymentService.devConfirmPayment(bookingId);
        } catch (e: any) {
          const msg =
            e?.response?.data?.message ||
            e?.friendlyMessage ||
            e?.message ||
            "";
          if (String(msg).toLowerCase().includes("dev confirm")) {
            setError(
              "Backend đang tắt DEV confirm. Nếu muốn test không cần PayOS, hãy bật PAYMENT_DEV_MODE=true ở backend. Nếu bạn đã thanh toán thật, hãy đợi webhook cập nhật rồi bấm 'Tôi đã thanh toán' lại.",
            );
          }
        }
      }

      // Poll nhanh: tối đa ~12 lần (khoảng 30s)
      for (let i = 0; i < 12; i++) {
        const b: any = await bookingService.getBookingById(bookingId);
        const booking = b?.data ?? b;

        const paymentStatus = String(
          booking?.paymentStatus || "",
        ).toLowerCase();
        const status = String(booking?.status || "").toLowerCase();
        const ticketCode = booking?.ticketCode;

        if (
          (paymentStatus === "paid" || status.includes("confirm")) &&
          ticketCode
        ) {
          (navigation as any).replace("TicketDetail", { bookingId });
          return;
        }

        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 2500));
      }

      Alert.alert(
        "Chưa cập nhật",
        "Hệ thống chưa ghi nhận. Hãy thử lại sau vài giây.",
      );
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.friendlyMessage ||
        e?.message ||
        "Không kiểm tra được trạng thái.";
      setError(msg);
    } finally {
      setPolling(false);
    }
  }, [bookingId, navigation]);

  const autoRanRef = useRef(false);

  useEffect(() => {
    if (!bookingId) return;
    if (statusFromLink !== "success") return;
    if (autoRanRef.current) return;

    autoRanRef.current = true;

    const t = setTimeout(() => {
      checkPaidAndGoTicket();
    }, 600);

    return () => clearTimeout(t);
  }, [statusFromLink, checkPaidAndGoTicket, bookingId]);

  const holdText = useMemo(() => {
    if (holdLeftMs == null) return null;
    if (holdLeftMs <= 0) return "Đã hết hạn giữ chỗ";
    return `Còn giữ chỗ: ${formatMs(holdLeftMs)}`;
  }, [holdLeftMs]);

  return (
    <AppScreen statusBarStyle="dark-content">
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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <View style={{ padding: SPACING.md }}>
        {!!error && <AppFormMessage variant="error" message={error} />}

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
          <Text style={styles.subText}>Booking: {bookingId}</Text>
          {!!holdText && (
            <Text
              style={[
                styles.subText,
                holdLeftMs != null && holdLeftMs <= 0
                  ? styles.holdExpired
                  : null,
              ]}
            >
              {holdText}
            </Text>
          )}

          {loading ? (
            <View style={{ paddingVertical: 18 }}>
              <Text style={styles.subText}>Đang tạo link thanh toán…</Text>
            </View>
          ) : link?.checkoutUrl ? (
            <>
              <View style={styles.qrWrap}>
                <View style={styles.qrBox}>
                  <QRCode value={link.qrCode || link.checkoutUrl} size={180} />
                </View>
                <Text style={styles.qrHint}>
                  Quét QR hoặc bấm nút bên dưới để thanh toán
                </Text>
              </View>

              <AppButton
                title="Mở trang thanh toán"
                onPress={openCheckout}
                disabled={polling}
              />
              <View style={{ height: SPACING.sm }} />

              <AppButton
                title={polling ? "Đang kiểm tra…" : "Tôi đã thanh toán"}
                onPress={checkPaidAndGoTicket}
                variant="secondary"
                disabled={polling}
              />

              <View style={{ height: SPACING.sm }} />

              <AppButton
                title={polling ? "Đang xử lý…" : "Hủy giữ chỗ"}
                onPress={cancelHoldNow}
                variant="secondary"
                disabled={polling}
              />

              <Pressable
                onPress={loadLink}
                style={({ pressed }) => [
                  styles.refreshRow,
                  pressed && { opacity: 0.8 },
                ]}
                disabled={polling}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={COLORS.primary.main}
                />
                <Text style={styles.refreshText}>Tạo lại QR/link</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.subText}>Chưa có link thanh toán.</Text>
              <View style={{ height: SPACING.sm }} />
              <AppButton
                title="Thử lại"
                onPress={loadLink}
                disabled={polling}
              />
              <View style={{ height: SPACING.sm }} />
              <AppButton
                title="Hủy giữ chỗ"
                onPress={cancelHoldNow}
                variant="secondary"
                disabled={polling}
              />
            </>
          )}
        </AppCard>

        <AppCard style={styles.cardNote}>
          <Text style={styles.noteTitle}>Lưu ý</Text>
          <Text style={styles.noteText}>
            • Giữ chỗ có thời hạn. Nếu quá thời gian, đơn sẽ tự hủy và ghế sẽ
            được trả về.
          </Text>
          <Text style={styles.noteText}>
            • Sau khi thanh toán, hệ thống sẽ cập nhật mã vé (ticketCode). Nếu
            chưa thấy ngay, hãy bấm “Tôi đã thanh toán”.
          </Text>
          <Text style={styles.noteText}>
            • Nếu bạn quay lại app mà không thấy cập nhật, hãy thử lại sau vài
            giây (PayOS cần thời gian ghi nhận).
          </Text>
        </AppCard>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  card: {
    padding: SPACING.md,
    borderRadius: 18,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  subText: {
    marginTop: 6,
    color: COLORS.text.secondary,
    fontWeight: "600",
  },
  holdExpired: {
    color: "#b91c1c",
    fontWeight: "900",
  },

  qrWrap: {
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  qrBox: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
  },
  qrHint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: "600",
    textAlign: "center",
  },
  refreshRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  refreshText: {
    color: COLORS.primary.main,
    fontWeight: "800",
  },

  cardNote: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 18,
    backgroundColor: withOpacity(COLORS.primary.main, 0.04),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.14),
  },
  noteTitle: {
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  noteText: {
    color: COLORS.text.secondary,
    fontWeight: "600",
    lineHeight: 18,
    marginBottom: 6,
  },
});
