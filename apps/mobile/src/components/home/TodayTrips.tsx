import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SectionHeader from "../ui/SectionHeader";
import AppCard from "../ui/AppCard";
import AnimatedPressable from "../ui/AnimatedPressable";
import { COLORS, withOpacity, SPACING, TYPOGRAPHY, LAYOUT } from "../../theme";
import FadeInUp from "../ui/FadeInUp";

// đổi path đúng theo project bạn:
import AppButton from "../../components/ui/AppButton";

function Row({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons
        name={icon}
        size={14}
        color={withOpacity(COLORS.text.secondary, 0.9)}
      />
      <Text style={styles.rowText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

export default function TodayTrips({
  loading,
  trips,
  onRefresh,
  onViewAll,
  onSelectTrip,
  formatTime,
}: {
  loading: boolean;
  trips: any[];
  onRefresh: () => void;
  onViewAll: () => void;
  onSelectTrip: (trip: any) => void;
  formatTime: (s: string) => string;
}) {
  const subtitle = trips.length
    ? `${trips.length} chuyến xe có sẵn`
    : "Không có chuyến xe nào";

  return (
    <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
      <SectionHeader
        title="Chuyến xe hôm nay"
        subtitle={subtitle}
        onRefresh={onRefresh}
        onViewAll={trips.length ? onViewAll : undefined}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Đang tải chuyến xe...</Text>
        </View>
      ) : trips.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.lg }}
        >
          {trips.map((trip, idx) => {
            const isScheduled = trip.status === "scheduled";
            const badgeBg = isScheduled
              ? withOpacity(COLORS.success.main, 0.95)
              : withOpacity(COLORS.warning.main, 0.95);

            return (
              <FadeInUp
                key={trip._id || idx}
                delay={70 + idx * 60}
                distance={10}
              >
                <AppCard style={styles.tripCard}>
                  <AnimatedPressable
                    onPress={() => onSelectTrip(trip)}
                    style={styles.tripPress}
                    scaleTo={0.985}
                  >
                    <View style={styles.tripHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.routeRow}>
                          <Text style={styles.city} numberOfLines={1}>
                            {trip.route?.fromLocationId?.name || "Điểm đi"}
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={COLORS.primary.main}
                          />
                          <Text style={styles.city} numberOfLines={1}>
                            {trip.route?.toLocationId?.name || "Điểm đến"}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[styles.badge, { backgroundColor: badgeBg }]}
                      >
                        <Text style={styles.badgeText}>
                          {isScheduled ? "Sẵn sàng" : "Đang di chuyển"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.meta}>
                      <Row
                        icon="time"
                        text={`Khởi hành: ${formatTime(trip.departureTime)}`}
                      />
                      <Row icon="bus" text={trip.companyId?.name || "Nhà xe"} />
                      <Row
                        icon="people"
                        text={`Còn ${trip.availableSeats || 0} ghế trống`}
                      />
                      {!!trip.vehicleId?.type && (
                        <Row icon="car" text={trip.vehicleId.type} />
                      )}
                    </View>

                    <View style={styles.footer}>
                      <Text style={styles.price}>
                        {trip.price
                          ? `${trip.price.toLocaleString("vi-VN")}đ`
                          : "Liên hệ"}
                      </Text>

                      <View style={{ width: 124 }}>
                        <AppButton
                          title="Đặt vé"
                          onPress={() => onSelectTrip(trip)}
                        />
                      </View>
                    </View>
                  </AnimatedPressable>
                </AppCard>
              </FadeInUp>
            );
          })}
        </ScrollView>
      ) : (
        <AppCard style={styles.emptyCard}>
          <View style={{ alignItems: "center", gap: SPACING.sm }}>
            <Ionicons
              name="bus-outline"
              size={46}
              color={withOpacity(COLORS.text.secondary, 0.5)}
            />
            <Text style={styles.emptyTitle}>
              Không có chuyến xe nào hôm nay
            </Text>
            <Text style={styles.emptySub}>Hãy thử tìm kiếm chuyến xe khác</Text>

            <View style={{ width: "100%", marginTop: SPACING.sm }}>
              <AppButton title="Tìm chuyến xe" onPress={onViewAll} />
            </View>
          </View>
        </AppCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", paddingVertical: SPACING.xl },
  loadingText: {
    marginTop: SPACING.md,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: "800",
  },

  tripCard: { width: 332, marginRight: SPACING.md, overflow: "hidden" },
  tripPress: { padding: SPACING.md, gap: SPACING.md },

  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  city: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: {
    color: COLORS.text.inverse,
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
  },

  meta: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  rowText: {
    flex: 1,
    ...TYPOGRAPHY.body3,
    color: COLORS.text.secondary,
    fontWeight: "800",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  price: { ...TYPOGRAPHY.h3, fontWeight: "900", color: COLORS.primary.main },

  emptyCard: { padding: SPACING.lg, borderRadius: LAYOUT.borderRadius.xl },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: "900",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  emptySub: {
    ...TYPOGRAPHY.body3,
    fontWeight: "800",
    color: COLORS.text.secondary,
    textAlign: "center",
  },
});
