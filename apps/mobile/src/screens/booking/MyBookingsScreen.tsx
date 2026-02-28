import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import AppScreen from "@/components/layout/AppScreen";
import SectionHeader from "@/components/ui/SectionHeader";
import AppCard from "@/components/ui/AppCard";
import AppFormMessage from "@/components/ui/AppFormMessage";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import IconCircle from "@/components/ui/IconCircle";
import AppButton from "@/components/ui/AppButton";

import { bookingService } from "../../services/user/bookingService";
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, withOpacity } from "../../theme";

type UiStatus = "confirmed" | "pending" | "held" | "cancelled" | "completed";

interface BookingUI {
  id: string;
  ticketCode?: string;
  tripId: string;

  from: string;
  to: string;

  date: string;
  departureTime: string;
  arrivalTime: string;

  company: string;

  seats: string[];
  passengers: number;

  totalPrice: number;
  status: UiStatus;

  bookingDate: string;
}

const mapStatus = (s: any): UiStatus => {
  const st = String(s || "").toLowerCase();
  if (st.includes("cancel")) return "cancelled";
  if (st.includes("complete")) return "completed";
  if (st.includes("confirm")) return "confirmed";
  if (st.includes("held")) return "held";
  return "pending";
};

const formatDate = (isoOrDate: any) => {
  try {
    const d = new Date(isoOrDate);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return "-";
  }
};

const formatTime = (iso: any) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
};

const formatPrice = (price: number) => `${Number(price || 0).toLocaleString("vi-VN")}đ`;

const statusMeta = (status: UiStatus) => {
  switch (status) {
    case "confirmed":
      return { text: "Đã xác nhận", color: COLORS.success.main, icon: "checkmark-circle" as const };
    case "pending":
      return { text: "Chờ thanh toán", color: COLORS.warning.main, icon: "time" as const };
    case "held":
      return { text: "Giữ chỗ", color: COLORS.warning.main, icon: "time" as const };
    case "cancelled":
      return { text: "Đã hủy", color: COLORS.error.main, icon: "close-circle" as const };
    case "completed":
      return { text: "Hoàn thành", color: COLORS.info.main, icon: "checkmark-done-circle" as const };
    default:
      return { text: "Không xác định", color: COLORS.text.secondary, icon: "help-circle" as const };
  }
};

const TabChip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <AnimatedPressable
    onPress={onPress}
    scaleTo={0.985}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text numberOfLines={1} style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </AnimatedPressable>
);

const ActionChip = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <AnimatedPressable
    onPress={onPress}
    scaleTo={0.985}
    style={[
      styles.actionChip,
      { borderColor: withOpacity(color, 0.22), backgroundColor: withOpacity(color, 0.08) },
    ]}
  >
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[styles.actionText, { color }]}>{label}</Text>
  </AnimatedPressable>
);

export default function MyBookingsScreen() {
  const navigation = useNavigation<any>();

  const [bookings, setBookings] = useState<BookingUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  const loadBookings = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setErrorText("");

      const apiBookings: any[] = await bookingService.getUserBookings();

      const mapped: BookingUI[] = (apiBookings || []).map((b: any) => {
        const trip = b.tripId;
        const company = b.companyId ?? b.company ?? null;

        const departureTime = trip?.departureTime ?? b.departureTime;
        const arrivalTime = trip?.expectedArrivalTime ?? trip?.arrivalTime ?? b.arrivalTime;

        const seats = Array.isArray(b.passengers)
          ? b.passengers.map((p: any) => p.seatNumber).filter(Boolean)
          : [];

        const from =
          trip?.route?.fromLocationId?.name ??
          trip?.route?.fromLocationId?.province ??
          trip?.route?.fromLocationName ??
          b.from ??
          "-";

        const to =
          trip?.route?.toLocationId?.name ??
          trip?.route?.toLocationId?.province ??
          trip?.route?.toLocationName ??
          b.to ??
          "-";

        return {
          id: b.id ?? b._id,
          ticketCode: b.ticketCode,
          tripId: trip?.id ?? trip?._id ?? trip ?? b.tripId,

          from,
          to,

          date: departureTime ? formatDate(departureTime) : b.bookingTime ? formatDate(b.bookingTime) : "-",
          departureTime: departureTime ? formatTime(departureTime) : "-",
          arrivalTime: arrivalTime ? formatTime(arrivalTime) : "-",

          company: company?.name ?? String(company ?? "-"),

          seats,
          passengers: seats.length || (Array.isArray(b.passengers) ? b.passengers.length : 1),

          totalPrice: b.totalAmount ?? b.totalPrice ?? 0,
          status: mapStatus(b.status),

          bookingDate: b.createdAt ? formatDate(b.createdAt) : b.bookingTime ? formatDate(b.bookingTime) : "-",
        };
      });

      setBookings(mapped);
    } catch (error) {
      console.log("❌ loadBookings error:", error);
      setErrorText("Không thể tải danh sách vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadBookings(false);
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeTab === "all") return bookings;
    if (activeTab === "completed") return bookings.filter((b) => b.status === "completed");
    if (activeTab === "cancelled") return bookings.filter((b) => b.status === "cancelled");
    return bookings.filter((b) => b.status === "pending" || b.status === "held" || b.status === "confirmed");
  }, [bookings, activeTab]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "held" || b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    return { total, upcoming, completed, cancelled };
  }, [bookings]);

  const cancelBooking = async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings(false);
    } catch {
      Alert.alert("Lỗi", "Không thể hủy vé. Vui lòng thử lại.");
    }
  };

  const handleView = (bookingId: string) => {
    navigation.navigate("TicketDetail", { bookingId });
  };

  const handleCancel = (booking: BookingUI) => {
    Alert.alert("Hủy vé", "Bạn có chắc chắn muốn hủy vé này?", [
      { text: "Không", style: "cancel" },
      { text: "Có", onPress: () => cancelBooking(booking.id), style: "destructive" },
    ]);
  };

  const goPay = (bookingId: string) => {
    navigation.navigate("PaymentCheckout", { bookingId });
  };

  const Header = () => (
    <View style={{ padding: SPACING.lg, paddingBottom: SPACING.md }}>
      <SectionHeader title="Vé của tôi" subtitle="Quản lý tất cả vé đã đặt" onRefresh={() => loadBookings(true)} />

      {!!errorText && (
        <AppFormMessage variant="error" message={errorText} onClose={() => setErrorText("")} />
      )}

      <AppCard style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <IconCircle size={46} bg={withOpacity(COLORS.primary.light, 0.14)}>
            <Ionicons name="ticket-outline" size={20} color={COLORS.primary.main} />
          </IconCircle>

          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Tổng quan</Text>
            <Text style={styles.summarySub}>
              {stats.total} vé • {stats.upcoming} sắp tới
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.livePill}>
              <Ionicons name="sparkles" size={14} color={COLORS.primary.main} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          )}
        </View>

        <View style={styles.statRow}>
          {[
            { n: stats.total, label: "Tất cả" },
            { n: stats.upcoming, label: "Sắp tới" },
            { n: stats.completed, label: "Hoàn thành" },
            { n: stats.cancelled, label: "Đã hủy" },
          ].map((x, i) => (
            <View key={x.label} style={[styles.statBox, i !== 3 && styles.statBoxMr]}>
              <Text style={styles.statNum}>{x.n}</Text>
              <Text numberOfLines={2} style={styles.statLabel}>
                {x.label}
              </Text>
            </View>
          ))}
        </View>
      </AppCard>

      <FlatList
        data={[
          { key: "all", label: "Tất cả" },
          { key: "upcoming", label: "Sắp tới" },
          { key: "completed", label: "Hoàn thành" },
          { key: "cancelled", label: "Đã hủy" },
        ]}
        keyExtractor={(i) => i.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        renderItem={({ item }) => (
          <TabChip
            label={item.label}
            active={activeTab === (item.key as any)}
            onPress={() => setActiveTab(item.key as any)}
          />
        )}
      />

      {loading && bookings.length === 0 && (
        <AppCard style={styles.loadingCard}>
          <ActivityIndicator color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Đang tải vé...</Text>
        </AppCard>
      )}
    </View>
  );

  const Empty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <IconCircle size={62} bg={withOpacity(COLORS.primary.light, 0.14)}>
          <Ionicons name="ticket-outline" size={26} color={COLORS.primary.main} />
        </IconCircle>
        <Text style={styles.emptyTitle}>
          {activeTab === "all"
            ? "Chưa có vé nào"
            : `Chưa có vé ${activeTab === "upcoming" ? "sắp tới" : activeTab === "completed" ? "hoàn thành" : "đã hủy"}`}
        </Text>
        <Text style={styles.emptySub}>
          {activeTab === "all"
            ? "Hãy đặt vé để bắt đầu hành trình của bạn."
            : "Các vé sẽ xuất hiện ở đây khi có thay đổi trạng thái."}
        </Text>
        <View style={{ marginTop: SPACING.md }}>
          <AppButton title="Tải lại" onPress={() => loadBookings(true)} />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: BookingUI }) => {
    const meta = statusMeta(item.status);
    const showPay = item.status === "pending" || item.status === "held";
    const showCancel = item.status === "pending" || item.status === "held" || item.status === "confirmed";
    const showDownload = item.status === "confirmed";

    return (
      <AnimatedPressable
        onPress={() => handleView(item.id)}
        scaleTo={0.988}
        style={{ marginBottom: SPACING.md, marginHorizontal: SPACING.lg }}
      >
        <AppCard style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.route} numberOfLines={1}>
                {item.from} → {item.to}
              </Text>

              <Text style={styles.dateLine}>
                {item.date} • {item.departureTime} - {item.arrivalTime}
              </Text>

              <Text style={styles.metaLine} numberOfLines={1}>
                <Text style={styles.metaStrong}>Mã đặt:</Text> {item.id}
              </Text>
              <Text style={styles.metaLine} numberOfLines={1}>
                <Text style={styles.metaStrong}>Mã vé:</Text> {item.ticketCode ?? "Chưa có (chưa thanh toán)"}
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                { backgroundColor: withOpacity(meta.color, 0.10), borderColor: withOpacity(meta.color, 0.22) },
              ]}
            >
              <Ionicons name={meta.icon as any} size={16} color={meta.color} />
              <Text style={[styles.statusText, { color: meta.color }]}>{meta.text}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={16} color={withOpacity(COLORS.text.secondary, 0.9)} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.company}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={withOpacity(COLORS.text.secondary, 0.9)} />
              <Text style={styles.infoText}>{item.passengers} hành khách</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={withOpacity(COLORS.text.secondary, 0.9)} />
              <Text style={styles.infoText} numberOfLines={1}>
                Ghế: {item.seats.join(", ") || "-"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={withOpacity(COLORS.text.secondary, 0.9)} />
              <Text style={styles.infoText}>Đặt: {item.bookingDate}</Text>
            </View>

            <View style={styles.priceRow}>
              <Ionicons name="card-outline" size={16} color={COLORS.primary.main} />
              <Text style={styles.priceText}>{formatPrice(item.totalPrice)}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <ActionChip icon="eye-outline" label="Xem" color={COLORS.primary.main} onPress={() => handleView(item.id)} />

            {showPay && (
              <ActionChip
                icon="card-outline"
                label="Thanh toán"
                color={COLORS.primary.main}
                onPress={() => goPay(item.id)}
              />
            )}

            {showDownload && (
              <ActionChip
                icon="download-outline"
                label="Tải vé"
                color={COLORS.success.main}
                onPress={() => Alert.alert("Thông báo", "Tính năng tải vé đang được phát triển")}
              />
            )}

            {showCancel && (
              <ActionChip icon="close-outline" label="Hủy" color={COLORS.error.main} onPress={() => handleCancel(item)} />
            )}
          </View>
        </AppCard>
      </AnimatedPressable>
    );
  };

  return (
    <AppScreen>
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListEmptyComponent={Empty}
        contentContainerStyle={{ paddingBottom: SPACING["2xl"] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadBookings(true)} />}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { padding: SPACING.lg, marginTop: SPACING.sm },
  summaryTop: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  summaryTitle: { ...TYPOGRAPHY.h4, fontWeight: "900", color: COLORS.text.primary },
  summarySub: { marginTop: 4, ...TYPOGRAPHY.body3, fontWeight: "700", color: withOpacity(COLORS.text.secondary, 0.92) },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.primary.light, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.7),
  },
  liveText: { ...TYPOGRAPHY.body3, fontWeight: "900", color: COLORS.primary.main },

  statRow: { flexDirection: "row", marginTop: SPACING.sm },
  statBox: {
    flex: 1,
    minHeight: 78,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: withOpacity(COLORS.background.secondary, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.8),
  },
  statBoxMr: { marginRight: SPACING.sm },
  statNum: { ...TYPOGRAPHY.h4, fontWeight: "900", color: COLORS.text.primary },
  statLabel: {
    marginTop: 2,
    ...TYPOGRAPHY.body3,
    fontWeight: "800",
    color: withOpacity(COLORS.text.secondary, 0.92),
    textAlign: "center",
    lineHeight: 16,
  },

  tabsRow: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    backgroundColor: withOpacity(COLORS.background.secondary, 0.9),
  },
  tabActive: { backgroundColor: COLORS.primary.main, borderColor: withOpacity(COLORS.primary.dark, 0.45) },
  tabText: { ...TYPOGRAPHY.body3, fontWeight: "900", color: withOpacity(COLORS.text.secondary, 0.92) },
  tabTextActive: { color: COLORS.text.inverse },

  loadingCard: { padding: SPACING.lg, alignItems: "center", gap: SPACING.sm },
  loadingText: { ...TYPOGRAPHY.body3, fontWeight: "800", color: withOpacity(COLORS.text.secondary, 0.92) },

  emptyWrap: { alignItems: "center", paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  emptyTitle: { marginTop: SPACING.md, ...TYPOGRAPHY.h4, fontWeight: "900", color: COLORS.text.primary, textAlign: "center" },
  emptySub: { marginTop: 6, ...TYPOGRAPHY.body3, fontWeight: "700", color: withOpacity(COLORS.text.secondary, 0.92), textAlign: "center" },

  card: { padding: SPACING.lg },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md },
  route: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.text.primary },
  dateLine: { marginTop: 6, ...TYPOGRAPHY.body3, fontWeight: "800", color: withOpacity(COLORS.text.secondary, 0.92) },
  metaLine: { marginTop: 4, ...TYPOGRAPHY.body3, fontWeight: "700", color: COLORS.text.primary },
  metaStrong: { fontWeight: "900" },

  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  statusText: { ...TYPOGRAPHY.body3, fontWeight: "900" },

  infoGrid: { marginTop: SPACING.md, gap: SPACING.sm },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { flex: 1, ...TYPOGRAPHY.body3, fontWeight: "700", color: COLORS.text.primary },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: SPACING.xs },
  priceText: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.primary.main },

  actionsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexBasis: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionText: { marginLeft: 6, ...TYPOGRAPHY.body3, fontWeight: "900" },
});