import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppFormMessage from "@/components/ui/AppFormMessage";
import AppInput from "@/components/ui/AppInput";

import { bookingService } from "@/services/user/bookingService";
import { reviewService } from "@/services/user/reviewService";
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT, ICONS, withOpacity } from "@/theme";

type Props = any;

export default function ReviewDriverScreen({ navigation, route }: Props) {
  const bookingId: string = String(route?.params?.bookingId ?? "");

  const [loading, setLoading] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [booking, setBooking] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoadingBooking(true);
      const res: any = await bookingService.getBookingById(bookingId);
      const b = res?.data ?? res;
      setBooking(b);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.friendlyMessage ||
        e?.message ||
        "Không tải được đơn đặt vé.";
      setError(msg);
    } finally {
      setLoadingBooking(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const driver = booking?.checkedInByDriverId;
  const driverName = driver?.name || booking?.checkedInBy || "Tài xế";
  const canSubmit = !!bookingId && rating >= 1 && rating <= 5 && !loading;

  const onSubmit = async () => {
    if (!bookingId) {
      setError("Thiếu bookingId.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await reviewService.createDriverReview({
        bookingId,
        rating,
        comment: comment?.trim() ? comment.trim() : undefined,
        isAnonymous,
      });

      Alert.alert("Thành công", "Đã gửi đánh giá tài xế.", [
        {
          text: "OK",
          onPress: () => {
            // quay lại vé & refresh
            (navigation as any).navigate("TicketDetail", { bookingId });
          },
        },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.friendlyMessage ||
        e?.message ||
        "Không thể gửi đánh giá.";
      setError(msg);
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
        <Text style={styles.headerTitle}>Đánh giá tài xế</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 28 }}>
        {!!error && <AppFormMessage variant="error" message={error} />}

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin</Text>
          <Text style={styles.subText}>Booking: {bookingId}</Text>
          <Text style={styles.subText}>Tài xế: {driverName}</Text>

          {!!booking?.checkedInAt && (
            <Text style={styles.subText}>
              Check-in lúc: {new Date(booking.checkedInAt).toLocaleString("vi-VN")}
            </Text>
          )}
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Chấm điểm</Text>

          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, i) => {
              const v = i + 1;
              const active = v <= rating;
              return (
                <Pressable key={v} onPress={() => setRating(v)} hitSlop={8} style={{ padding: 6 }}>
                  <Ionicons
                    name={active ? "star" : "star-outline"}
                    size={34}
                    color={active ? COLORS.warning.main : withOpacity(COLORS.text.secondary, 0.7)}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.ratingText}>{rating}/5</Text>

          <View style={{ height: SPACING.sm }} />

          <AppInput
            label="Nhận xét (tuỳ chọn)"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={comment}
            onChangeText={setComment}
            multiline
            style={{ height: 120, textAlignVertical: "top", paddingTop: 14 }}
          />

          <Pressable
            onPress={() => setIsAnonymous((v) => !v)}
            style={styles.anonRow}
          >
            <Ionicons
              name={isAnonymous ? "checkbox" : "square-outline"}
              size={22}
              color={isAnonymous ? COLORS.primary.main : COLORS.text.secondary}
            />
            <Text style={styles.anonText}>Đánh giá ẩn danh</Text>
          </Pressable>

          <View style={{ height: SPACING.md }} />

          <AppButton
            title={loading ? "Đang gửi..." : "Gửi đánh giá"}
            onPress={onSubmit}
            disabled={!canSubmit || loadingBooking}
          />

          {!!loadingBooking && (
            <Text style={{ marginTop: 10, color: COLORS.text.secondary, fontWeight: "600" }}>
              Đang tải booking...
            </Text>
          )}
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

  card: { padding: SPACING.md, borderRadius: 18, marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: "900", color: COLORS.text.primary },
  subText: { marginTop: 6, color: COLORS.text.secondary, fontWeight: "600" },

  starsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: SPACING.sm },
  ratingText: { marginTop: 6, textAlign: "center", fontWeight: "900", color: COLORS.text.primary, fontSize: 18 },

  anonRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.sm, gap: 10 },
  anonText: { color: COLORS.text.primary, fontWeight: "700" },
});
