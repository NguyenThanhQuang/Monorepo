import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppInput from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import AppFormMessage from "@/components/ui/AppFormMessage";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import IconCircle from "@/components/ui/IconCircle";
import Stagger from "@/components/ui/Stagger";

import apiService from "../../services/common/apiService";
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, withOpacity } from "@/theme";

const { width } = Dimensions.get("window");

type BusStatus = "on-time" | "delayed" | "early";

interface BusLocation {
  id: string;
  busNumber: string;
  route: string;
  from: string;
  to: string;
  currentLocation: string;
  estimatedArrival: string;
  status: BusStatus;
  delay: number;
  nextStop: string;
  distance: number;
}

const fmtTime = (iso: any) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "--:--";
  }
};

const pickPlace = (loc: any) => {
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  return loc?.province || loc?.name || String(loc);
};

const normalizeStopStatus = (s: any) => String(s || "").toLowerCase();

const computeStatus = (delayMin: number): BusStatus => {
  if (delayMin >= 6) return "delayed";
  if (delayMin <= -6) return "early";
  return "on-time";
};

const getStatusMeta = (status: BusStatus) => {
  switch (status) {
    case "on-time":
      return { text: "Đúng giờ", color: COLORS.success.main, icon: "checkmark-circle" as const };
    case "delayed":
      return { text: "Trễ", color: COLORS.error.main, icon: "alert-circle" as const };
    case "early":
      return { text: "Sớm", color: COLORS.info.main, icon: "flash" as const };
    default:
      return { text: "N/A", color: COLORS.neutral.gray500, icon: "help-circle" as const };
  }
};

export default function BusTrackingScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [routes, setRoutes] = useState<string[]>(["Tất cả"]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const mapTripToBus = (trip: any): BusLocation => {
    const from = pickPlace(trip?.route?.fromLocationId);
    const to = pickPlace(trip?.route?.toLocationId);
    const route = `${from} - ${to}`.trim();

    const busNumber =
      trip?.vehicleId?.vehicleNumber ||
      trip?.vehicleId?.licensePlate ||
      trip?.vehicleNumber ||
      trip?.busNumber ||
      "N/A";

    const stops: any[] = Array.isArray(trip?.route?.stops) ? trip.route.stops : [];

    const visitedIdx = stops
      .map((s, idx) => ({ idx, st: normalizeStopStatus(s?.status) }))
      .filter((x) => x.st && x.st !== "pending")
      .map((x) => x.idx);

    const lastVisitedIndex = visitedIdx.length ? visitedIdx[visitedIdx.length - 1] : -1;

    const currentLocation =
      lastVisitedIndex >= 0 ? pickPlace(stops[lastVisitedIndex]?.locationId) : from;

    const nextStopObj = stops.find((s) => normalizeStopStatus(s?.status) === "pending");
    const nextStop = nextStopObj ? pickPlace(nextStopObj.locationId) : to;

    const rawDistance = Number(trip?.route?.distance || 0);
    const distance = rawDistance > 1000 ? Math.round(rawDistance / 1000) : rawDistance;

    const eta =
      trip?.expectedArrivalTime ||
      trip?.estimatedArrivalTime ||
      trip?.arrivalTime ||
      trip?.departureTime;

    const delayMin = Number(trip?.delayMinutes ?? trip?.delay ?? 0) || 0;
    const status = computeStatus(delayMin);

    return {
      id: String(trip?._id || trip?.id || busNumber),
      busNumber,
      route,
      from,
      to,
      currentLocation,
      estimatedArrival: fmtTime(eta),
      status,
      delay: delayMin,
      nextStop,
      distance: Number.isFinite(distance) ? distance : 0,
    };
  };

  const extractTrips = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  };

  const loadBusData = async (firstLoad = false) => {
    try {
      if (firstLoad) setLoading(true);
      setErrorText("");

      const res = await apiService.get("/trips/active");
      const trips = extractTrips(res?.data);

      const mapped = trips.map(mapTripToBus);

      setBuses(mapped);
      const uniqRoutes = Array.from(new Set(mapped.map((b) => b.route).filter(Boolean)));
      setRoutes(["Tất cả", ...uniqRoutes]);
      setLastUpdated(new Date());
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.friendlyMessage ||
        err?.message ||
        "Không thể tải dữ liệu xe buýt.";

      setErrorText(String(msg));
      setBuses([]);
      setRoutes(["Tất cả"]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadBusData(true);
  }, []);

  const filteredBuses = useMemo(() => {
    let list = buses;
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (b) =>
          b.busNumber.toLowerCase().includes(q) ||
          b.route.toLowerCase().includes(q) ||
          b.currentLocation.toLowerCase().includes(q) ||
          b.nextStop.toLowerCase().includes(q),
      );
    }

    if (selectedRoute) {
      list = list.filter((b) => b.route === selectedRoute);
    }

    return list;
  }, [buses, searchQuery, selectedRoute]);

  const stats = useMemo(() => {
    const total = filteredBuses.length;
    const onTime = filteredBuses.filter((b) => b.status === "on-time").length;
    const delayed = filteredBuses.filter((b) => b.status === "delayed").length;
    const early = filteredBuses.filter((b) => b.status === "early").length;
    return { total, onTime, delayed, early };
  }, [filteredBuses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusData(false);
  };

  const handleBusPress = (bus: BusLocation) => {
    const meta = getStatusMeta(bus.status);
    Alert.alert(
      `Xe ${bus.busNumber}`,
      `Tuyến: ${bus.route}\nVị trí hiện tại: ${bus.currentLocation}\nĐiểm dừng tiếp theo: ${bus.nextStop}\nETA: ${bus.estimatedArrival}\nTrạng thái: ${meta.text}${
        bus.delay !== 0 ? `\n${bus.delay > 0 ? "Trễ" : "Sớm"}: ${Math.abs(bus.delay)} phút` : ""
      }`,
      [{ text: "OK" }],
    );
  };

  const contentW = Math.min(520, width - SPACING.lg * 2);

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <SectionHeader
          title="Theo dõi xe buýt"
          subtitle={
            lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
              : "Theo dõi vị trí & trạng thái chuyến"
          }
          onRefresh={() => onRefresh()}
        />

        {/* Summary */}
        <AppCard style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <IconCircle size={46} bg={withOpacity(COLORS.primary.light, 0.14)}>
              <Ionicons name="bus" size={20} color={COLORS.primary.main} />
            </IconCircle>

            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Tổng quan</Text>
              <Text style={styles.summarySub}>{stats.total} xe phù hợp bộ lọc hiện tại</Text>
            </View>

            {loading ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.pill}>
                <Ionicons name="navigate" size={14} color={COLORS.primary.main} />
                <Text style={styles.pillText}>Live</Text>
              </View>
            )}
          </View>

          <View style={styles.statRow}>
            {[
              { n: stats.total, label: "Đang chạy" },
              { n: stats.onTime, label: "Đúng" },
              { n: stats.delayed, label: "Trễ" },
              { n: stats.early, label: "Sớm" },
            ].map((x, idx) => (
              <View key={x.label} style={[styles.statBox, idx !== 3 && styles.statBoxMr]}>
                <Text style={styles.statNum}>{x.n}</Text>
                <Text numberOfLines={2} style={styles.statLabel}>
                  {x.label}
                </Text>
              </View>
            ))}
          </View>
        </AppCard>

        {/* Search */}
        <View style={{ marginTop: SPACING.md }}>
          <AppInput
            icon="search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm xe / tuyến / vị trí / điểm dừng..."
            autoCorrect={false}
          />
        </View>

        {!!errorText && (
          <AppFormMessage
            message={errorText}
            variant="error"
            onClose={() => setErrorText("")}
            style={{ marginTop: SPACING.sm }}
          />
        )}

        {/* Route chips */}
        <View style={{ marginTop: SPACING.sm }}>
          <Text style={styles.chipTitle}>Lọc theo tuyến</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipWrap}
          >
            {routes.map((r, idx) => {
              const isAll = r === "Tất cả";
              const selected = (isAll && !selectedRoute) || selectedRoute === r;

              return (
                <AnimatedPressable
                  key={`${r}-${idx}`}
                  onPress={() => setSelectedRoute(isAll ? "" : r)}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                    { maxWidth: Math.max(120, contentW * 0.78) },
                  ]}
                  scaleTo={0.985}
                >
                  <Text numberOfLines={1} style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {r}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        <View style={{ marginTop: SPACING.md }}>
          {loading ? (
            <AppCard style={styles.loadingCard}>
              <ActivityIndicator color={COLORS.primary.main} />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </AppCard>
          ) : filteredBuses.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <IconCircle size={58} bg={withOpacity(COLORS.primary.light, 0.14)}>
                <Ionicons name="bus-outline" size={26} color={COLORS.primary.main} />
              </IconCircle>
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedRoute ? "Không có kết quả phù hợp" : "Chưa có xe đang hoạt động"}
              </Text>
              <Text style={styles.emptySub}>Kéo xuống để tải lại hoặc đổi bộ lọc / từ khóa tìm kiếm.</Text>
            </AppCard>
          ) : (
            <Stagger baseDelay={60} step={70}>
              {filteredBuses.map((bus) => {
                const meta = getStatusMeta(bus.status);

                return (
                  <AnimatedPressable
                    key={bus.id}
                    onPress={() => handleBusPress(bus)}
                    style={{ marginBottom: SPACING.md }}
                    scaleTo={0.985}
                  >
                    <AppCard style={styles.busCard}>
                      <View style={styles.busNumberRow}>
                        <View style={styles.busNumberPill}>
                          <Ionicons name="bus" size={14} color={COLORS.primary.main} />
                          <Text numberOfLines={1} style={styles.busNumber}>
                            {bus.busNumber}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: withOpacity(meta.color, 0.12),
                              borderColor: withOpacity(meta.color, 0.25),
                            },
                          ]}
                        >
                          <Ionicons name={meta.icon} size={14} color={meta.color} />
                          <Text numberOfLines={1} style={[styles.statusText, { color: meta.color }]}>
                            {meta.text}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.busRoute} numberOfLines={1}>
                        {bus.route}
                      </Text>

                      <View style={styles.metaWrap}>
                        <View style={styles.metaRow}>
                          <Ionicons name="location" size={16} color={COLORS.primary.main} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            Hiện tại: <Text style={styles.metaStrong}>{bus.currentLocation}</Text>
                          </Text>
                        </View>

                        <View style={styles.metaRow}>
                          <Ionicons name="flag" size={16} color={COLORS.secondary.main} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            Tiếp theo: <Text style={styles.metaStrong}>{bus.nextStop}</Text>
                          </Text>
                        </View>

                        <View style={styles.metaRow}>
                          <Ionicons name="time" size={16} color={COLORS.warning.main} />
                          <Text style={styles.metaText} numberOfLines={1}>
                            ETA: <Text style={styles.metaStrong}>{bus.estimatedArrival}</Text>
                            <Text style={styles.dot}>  •  </Text>
                            <Ionicons name="navigate" size={14} color={COLORS.info.main} />
                            <Text style={styles.metaStrong}> {bus.distance} km</Text>
                          </Text>
                        </View>
                      </View>

                      {bus.delay !== 0 && (
                        <View
                          style={[
                            styles.delayBadge,
                            {
                              backgroundColor: withOpacity(
                                bus.delay > 0 ? COLORS.error.main : COLORS.success.main,
                                0.10,
                              ),
                              borderColor: withOpacity(
                                bus.delay > 0 ? COLORS.error.main : COLORS.success.main,
                                0.22,
                              ),
                            },
                          ]}
                        >
                          <Ionicons
                            name={bus.delay > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
                            size={16}
                            color={bus.delay > 0 ? COLORS.error.main : COLORS.success.main}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.delayText,
                              { color: bus.delay > 0 ? COLORS.error.main : COLORS.success.main },
                            ]}
                          >
                            {bus.delay > 0 ? `Trễ ${bus.delay} phút` : `Sớm ${Math.abs(bus.delay)} phút`}
                          </Text>
                        </View>
                      )}
                    </AppCard>
                  </AnimatedPressable>
                );
              })}
            </Stagger>
          )}
        </View>
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

  summaryCard: { padding: SPACING.lg },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  summaryTitle: { ...TYPOGRAPHY.h4, fontWeight: "900", color: COLORS.text.primary },
  summarySub: { marginTop: 4, ...TYPOGRAPHY.body3, color: withOpacity(COLORS.text.secondary, 0.92), fontWeight: "700" },

  pill: {
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
  pillText: { ...TYPOGRAPHY.body3, fontWeight: "900", color: COLORS.primary.main },

  // ✅ stats đều nhau
  statRow: { flexDirection: "row", marginTop: SPACING.lg },
  statBox: {
    flex: 1,
    minHeight: 78,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: withOpacity(COLORS.background.secondary, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.8),
  },
  statBoxMr: { marginRight: SPACING.sm },
  statNum: { ...TYPOGRAPHY.h4, fontWeight: "900", color: COLORS.text.primary },
  statLabel: {
    marginTop: 2,
    ...TYPOGRAPHY.body3,
    color: withOpacity(COLORS.text.secondary, 0.92),
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 16,
  },

  chipTitle: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.text.primary, marginBottom: SPACING.sm },
  chipWrap: { paddingRight: SPACING.md, gap: SPACING.sm, alignItems: "center" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.8),
    backgroundColor: withOpacity(COLORS.background.secondary, 0.9),
    alignSelf: "flex-start",
  },
  chipSelected: { backgroundColor: COLORS.primary.main, borderColor: withOpacity(COLORS.primary.dark, 0.45) },
  chipText: { ...TYPOGRAPHY.body3, fontWeight: "800", color: COLORS.text.primary },
  chipTextSelected: { color: COLORS.text.inverse, fontWeight: "900" },

  loadingCard: { padding: SPACING.lg, alignItems: "center", gap: SPACING.sm },
  loadingText: { ...TYPOGRAPHY.body3, fontWeight: "800", color: withOpacity(COLORS.text.secondary, 0.92) },

  emptyCard: { padding: SPACING.lg, alignItems: "center", gap: SPACING.sm },
  emptyTitle: { marginTop: 6, ...TYPOGRAPHY.h5, fontWeight: "900", textAlign: "center", color: COLORS.text.primary },
  emptySub: { ...TYPOGRAPHY.body3, fontWeight: "700", textAlign: "center", color: withOpacity(COLORS.text.secondary, 0.92) },

  busCard: { padding: SPACING.lg },

  // ✅ row 2 pill không bị wrap/lệch
  busNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  busNumberPill: {
    flex: 1,
    minWidth: 0,
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
  busNumber: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    color: COLORS.primary.main,
    flexShrink: 1,
  },

  statusPill: {
    flexShrink: 0,
    maxWidth: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    flexShrink: 1,
  },

  busRoute: {
    marginTop: SPACING.sm,
    ...TYPOGRAPHY.body2,
    fontWeight: "800",
    color: withOpacity(COLORS.text.secondary, 0.95),
  },

  metaWrap: { marginTop: SPACING.md, gap: SPACING.sm },
  metaRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  metaText: { flex: 1, ...TYPOGRAPHY.body3, fontWeight: "700", color: COLORS.text.primary },
  metaStrong: { fontWeight: "900", color: COLORS.text.primary },
  dot: { color: withOpacity(COLORS.text.secondary, 0.7) },

  delayBadge: {
    marginTop: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  delayText: { ...TYPOGRAPHY.body3, fontWeight: "900", flexShrink: 1 },
});