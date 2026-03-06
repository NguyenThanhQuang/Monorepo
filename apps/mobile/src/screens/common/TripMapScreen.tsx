import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Linking from "expo-linking";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { COLORS, SPACING, TYPOGRAPHY, withOpacity } from "@/theme";
import { trackingService } from "@/services/user/trackingService";
import { getTripById } from "@/services/user/tripService";
import { decodePolyline, LatLng, midpoint } from "@/utils/polyline";

type Props = any;

const pickCoord = (loc: any): LatLng | null => {
  const coords = loc?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
};

const formatAgo = (sec: number) => {
  if (sec < 0) return "0s trước";
  if (sec < 60) return `${sec}s trước`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  return `${h} giờ trước`;
};

export default function TripMapScreen({ navigation, route }: Props) {
  const tripId: string = String(route?.params?.tripId ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [trip, setTrip] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  const [bus, setBus] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [busUpdatedAt, setBusUpdatedAt] = useState<string | null>(null);

  // tick thời gian để UI "X giây trước" chạy realtime
  const [nowMs, setNowMs] = useState(() => Date.now());

  // ✅ FIX TS: dùng object ref
  const mapRef = useRef<MapView | null>(null);

  const from = useMemo(() => trip?.route?.fromLocationId, [trip]);
  const to = useMemo(() => trip?.route?.toLocationId, [trip]);
  const fromCoord = useMemo(() => pickCoord(from), [from]);
  const toCoord = useMemo(() => pickCoord(to), [to]);

  const initialRegion = useMemo(() => {
    const a = fromCoord;
    const b = toCoord;
    if (a && b) {
      const m = midpoint(a, b);
      return {
        latitude: m.latitude,
        longitude: m.longitude,
        latitudeDelta: Math.abs(a.latitude - b.latitude) * 1.8 + 0.5,
        longitudeDelta: Math.abs(a.longitude - b.longitude) * 1.8 + 0.5,
      };
    }
    if (a) {
      return {
        latitude: a.latitude,
        longitude: a.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      };
    }
    return {
      latitude: 10.8231,
      longitude: 106.6297,
      latitudeDelta: 5,
      longitudeDelta: 5,
    };
  }, [fromCoord, toCoord]);

  // LIVE/OFFLINE dựa vào updatedAt
  const lastUpdated = busUpdatedAt ? new Date(busUpdatedAt) : null;
  const ageSec =
    lastUpdated && Number.isFinite(lastUpdated.getTime())
      ? Math.max(0, Math.floor((nowMs - lastUpdated.getTime()) / 1000))
      : null;

  // coi là LIVE nếu cập nhật trong 15 giây gần nhất
  const isLive = ageSec !== null && ageSec < 15;

  const loadAll = async () => {
    if (!tripId) {
      setError("Thiếu tripId");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1) trip details (có tọa độ)
      const t = await getTripById(tripId);
      setTrip((t as any)?.data ?? t);

      // 2) route polyline (OSRM)
      const r = await trackingService.getTripRoute(tripId);
      const decoded = decodePolyline(r?.polyline || "");
      setRouteCoords(decoded);

      // 3) initial live location
      const live = await trackingService.getTripLocation(tripId);
      if (live?.lat != null && live?.lng != null) {
        setBus({ latitude: Number(live.lat), longitude: Number(live.lng) });
      } else {
        setBus(null);
      }
      setBusUpdatedAt(live?.updatedAt ? String(live.updatedAt) : null);

      // Fit map if we have route
      setTimeout(() => {
        if (decoded.length && mapRef.current) {
          mapRef.current.fitToCoordinates(decoded, {
            edgePadding: { top: 120, right: 40, bottom: 220, left: 40 },
            animated: true,
          });
        }
      }, 250);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.friendlyMessage ||
        e?.message ||
        "Không tải được bản đồ.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // tick "now"
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Poll live location every 5s
  useEffect(() => {
    if (!tripId) return;

    const timer = setInterval(async () => {
      try {
        const live = await trackingService.getTripLocation(tripId);
        if (live?.lat != null && live?.lng != null) {
          setBus({ latitude: Number(live.lat), longitude: Number(live.lng) });
        } else {
          // nếu API trả null -> xe offline/chưa chia sẻ
          setBus(null);
        }
        setBusUpdatedAt(live?.updatedAt ? String(live.updatedAt) : null);
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [tripId]);

  const openExternalMaps = () => {
    if (!fromCoord || !toCoord) {
      Alert.alert("Lỗi", "Thiếu tọa độ điểm đi/đến.");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${fromCoord.latitude},${fromCoord.longitude}&destination=${toCoord.latitude},${toCoord.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const title = `${from?.name ?? from?.province ?? "-"} → ${to?.name ?? to?.province ?? "-"}`;

  const liveLabel = useMemo(() => {
    if (ageSec === null) return "Chưa có dữ liệu";
    return `Cập nhật: ${formatAgo(ageSec)}`;
  }, [ageSec]);

  return (
    <AppScreen statusBarStyle="dark-content">
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Lộ trình
        </Text>
        <Pressable onPress={loadAll} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="refresh" size={20} color={COLORS.text.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      ) : error ? (
        <View style={{ padding: SPACING.lg }}>
          <AppFormMessage variant="error" message={error} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          >
            {fromCoord && (
              <Marker
                coordinate={fromCoord}
                title="Điểm đi"
                description={from?.name ?? from?.province ?? ""}
              />
            )}
            {toCoord && (
              <Marker
                coordinate={toCoord}
                title="Điểm đến"
                description={to?.name ?? to?.province ?? ""}
              />
            )}

            {routeCoords.length > 1 && (
              <Polyline coordinates={routeCoords} strokeWidth={4} />
            )}

            {bus && (
              <Marker
                coordinate={bus}
                title="Xe đang ở đây"
                description={
                  busUpdatedAt
                    ? `Cập nhật: ${new Date(busUpdatedAt).toLocaleTimeString("vi-VN")}`
                    : "Đang lấy dữ liệu..."
                }
              >
                <View
                  style={[
                    styles.busDot,
                    {
                      backgroundColor: isLive
                        ? COLORS.success.main
                        : COLORS.warning.main,
                    },
                  ]}
                />
              </Marker>
            )}
          </MapView>

          {/* ✅ OVERLAY LIVE/OFFLINE */}
          <View style={styles.topOverlay}>
            <View
              style={[
                styles.livePill,
                {
                  borderColor: withOpacity(
                    isLive ? COLORS.success.main : COLORS.text.secondary,
                    0.25,
                  ),
                  backgroundColor: withOpacity(
                    isLive ? COLORS.success.main : COLORS.text.secondary,
                    0.1,
                  ),
                },
              ]}
            >
              <Ionicons
                name={isLive ? "radio" : "radio-outline"}
                size={16}
                color={isLive ? COLORS.success.main : COLORS.text.secondary}
              />
              <Text
                style={[
                  styles.liveText,
                  {
                    color: isLive ? COLORS.success.main : COLORS.text.secondary,
                  },
                ]}
              >
                {isLive ? "LIVE" : "OFFLINE"}
              </Text>
              <Text style={styles.liveSub}>• {liveLabel}</Text>
            </View>
          </View>

          <View style={styles.bottomWrap}>
            <AppCard style={styles.bottomCard}>
              <Text style={styles.routeTitle} numberOfLines={2}>
                {title}
              </Text>

              <View style={styles.metaRow}>
                <Ionicons
                  name="map-outline"
                  size={16}
                  color={COLORS.primary.main}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  Chuyến đi:{" "}
                  {tripId ? `${tripId.slice(0, 6)}…${tripId.slice(-4)}` : "-"}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons
                  name={isLive ? "radio" : "radio-outline"}
                  size={16}
                  color={isLive ? COLORS.success.main : COLORS.text.secondary}
                />
                <Text style={styles.metaText}>
                  {bus
                    ? `Xe: ${bus.latitude.toFixed(4)}, ${bus.longitude.toFixed(4)} • ${liveLabel}`
                    : "Chưa có vị trí xe (tài xế chưa bật chia sẻ vị trí)"}
                </Text>
              </View>

              <Pressable style={styles.extBtn} onPress={openExternalMaps}>
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color={COLORS.primary.main}
                />
                <Text style={styles.extBtnText}>Mở Google Maps</Text>
              </Pressable>
            </AppCard>
          </View>
        </View>
      )}
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.neutral.white, 0.9),
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: "900",
    color: COLORS.text.primary,
    flex: 1,
    textAlign: "center",
    marginHorizontal: SPACING.sm,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "800",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },

  topOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  liveText: { ...TYPOGRAPHY.body3, fontWeight: "900" },
  liveSub: {
    ...TYPOGRAPHY.body3,
    fontWeight: "800",
    color: withOpacity(COLORS.text.secondary, 0.92),
    marginLeft: 6,
  },

  bottomWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  bottomCard: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.8),
    backgroundColor: withOpacity(COLORS.background.secondary, 0.96),
  },
  routeTitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  metaText: {
    flex: 1,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },

  extBtn: {
    marginTop: SPACING.md,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.25),
    backgroundColor: withOpacity(COLORS.primary.light, 0.12),
  },
  extBtnText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    color: COLORS.primary.main,
  },

  busDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
});
