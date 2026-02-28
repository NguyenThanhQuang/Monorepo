import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Trip, TripCardProps } from "../../types/index-types";

// ✅ theme
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, COMMON_SHADOWS, withOpacity } from "@/theme";

const TripCard: React.FC<TripCardProps> = ({ trip, onPress, onBookNow }) => {
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeString;
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return COLORS.status.active;
      case "cancelled":
        return COLORS.status.cancelled;
      case "completed":
        return COLORS.status.completed;
      default:
        return COLORS.status.pending;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(trip)} activeOpacity={0.92}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <View style={styles.companyIcon}>
            <Ionicons name="business-outline" size={18} color={COLORS.primary.main} />
          </View>
          <Text style={styles.companyName} numberOfLines={1}>
            {trip.company?.name || "Nhà xe"}
          </Text>
        </View>

        {!!trip.status && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
            <Text style={styles.statusText}>{trip.status}</Text>
          </View>
        )}
      </View>

      <View style={styles.route}>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.secondary.main} />
          <Text style={styles.locText} numberOfLines={1}>
            {trip.route?.fromLocationId?.name || trip.from}
          </Text>
        </View>

        <View style={styles.locRow}>
          <Ionicons name="flag-outline" size={16} color={COLORS.error.main} />
          <Text style={styles.locText} numberOfLines={1}>
            {trip.route?.toLocationId?.name || trip.to}
          </Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Giờ đi:</Text>
          <Text style={styles.timeText}>{formatTime(trip.departureTime)}</Text>
        </View>

        <View style={styles.timeItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Giờ đến:</Text>
          <Text style={styles.timeText}>{formatTime(trip.arrivalTime)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.seatRow}>
          <Ionicons name="car-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.seatText}>{trip.availableSeats} ghế trống</Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Giá vé</Text>
          <Text style={styles.priceText}>{formatPrice(trip.price)}</Text>
        </View>
      </View>

      {!!onBookNow && (
        <TouchableOpacity style={styles.bookBtn} onPress={() => onBookNow(trip)} activeOpacity={0.9}>
          <Ionicons name="bookmark-outline" size={16} color={COLORS.primary.contrast} />
          <Text style={styles.bookText}>Đặt ngay</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderRadius: LAYOUT.borderRadius.xl,
    padding: LAYOUT.cardPadding,
    marginHorizontal: LAYOUT.screenPaddingHorizontal,
    marginBottom: SPACING.md,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    ...(COMMON_SHADOWS.elevation1 ?? COMMON_SHADOWS.card),
  },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },

  companyInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: SPACING.sm },
  companyIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    flex: 1,
    fontSize: TYPOGRAPHY.body2?.fontSize ?? 16,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: LAYOUT.borderRadius.round },
  statusText: { color: COLORS.neutral.white, fontSize: 12, fontWeight: "900" },

  route: { gap: SPACING.sm, marginBottom: SPACING.md },
  locRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  locText: { flex: 1, fontSize: 15, fontWeight: "800", color: COLORS.text.primary },

  timeRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md },
  timeItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  timeLabel: { fontSize: 13, color: COLORS.text.secondary, fontWeight: "800" },
  timeText: { fontSize: 15, color: COLORS.text.primary, fontWeight: "900" },

  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  seatRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  seatText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: "800" },

  priceBox: { alignItems: "flex-end" },
  priceLabel: { fontSize: 12, color: COLORS.text.secondary, fontWeight: "800" },
  priceText: { fontSize: 16, fontWeight: "900", color: COLORS.primary.dark },

  bookBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary.main,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    ...(COMMON_SHADOWS.button ?? COMMON_SHADOWS.elevation2 ?? {}),
  },
  bookText: { color: COLORS.primary.contrast, fontSize: 15, fontWeight: "900" },
});

export default TripCard;
