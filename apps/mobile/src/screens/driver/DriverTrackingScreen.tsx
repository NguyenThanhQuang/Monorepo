import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useSelector } from "react-redux";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppFormMessage from "@/components/ui/AppFormMessage";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

import { COLORS, SPACING, TYPOGRAPHY, withOpacity } from "@/theme";
import { trackingService } from "@/services/user/trackingService";
import { getTripById, getActiveTrips, getMyDriverTrips } from "@/services/user/tripService";
import { decodePolyline, LatLng, midpoint } from "@/utils/polyline";
import { RootState } from "@/store/index-store";

type Props = any;

const pickCoord = (loc: any): LatLng | null => {
  const coords = loc?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
};

const getTripId = (t: any) => String(t?._id ?? t?.id ?? t?.tripId ?? "");

const fmtTime = (iso: any) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
};

const SelectChip = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <AnimatedPressable onPress={onPress} scaleTo={0.985} style={styles.selectChip}>
    <Text style={styles.selectChipText}>{label}</Text>
  </AnimatedPressable>
);

export default function DriverTrackingScreen({ navigation, route }: Props) {
  const auth = useSelector((s: RootState) => s.auth);
  const myUserId = String(auth?.user?._id ?? "");

  const presetTripId = String(route?.params?.tripId ?? "");

  const [tripId, setTripId] = useState(presetTripId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [trips, setTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  const [trip, setTrip] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  const [me, setMe] = useState<LatLng | null>(null);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [tracking, setTracking] = useState(false);

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const fromCoord = useMemo(() => pickCoord(trip?.route?.fromLocationId), [trip]);
  const toCoord = useMemo(() => pickCoord(trip?.route?.toLocationId), [trip]);

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
      return { latitude: a.latitude, longitude: a.longitude, latitudeDelta: 0.2, longitudeDelta: 0.2 };
    }
    return { latitude: 10.8231, longitude: 106.6297, latitudeDelta: 5, longitudeDelta: 5 };
  }, [fromCoord, toCoord]);

  const stopTracking = () => {
    try {
      watchRef.current?.remove();
      watchRef.current = null;
    } catch {
      // ignore
    }
    setTracking(false);
  };

  useEffect(() => {
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTripRoute = async (targetTripId: string) => {
    try {
      setLoading(true);
      setError("");

      const t = await getTripById(targetTripId);
      const tripData = (t as any)?.data ?? t;
      setTrip(tripData);

      const r = await trackingService.getTripRoute(targetTripId);
      const decoded = decodePolyline(r?.polyline || "");
      setRouteCoords(decoded);

      setTimeout(() => {
        if (decoded.length && mapRef.current) {
          mapRef.current.fitToCoordinates(decoded, {
            edgePadding: { top: 90, right: 40, bottom: 220, left: 40 },
            animated: true,
          });
        }
      }, 250);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.friendlyMessage || e?.message || "Không tải được chuyến.";
      setError(String(msg));
      setTrip(null);
      setRouteCoords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    setTripsLoading(true);
    setError("");
    try {
      let list: any[] = [];
      try {
        list = await getMyDriverTrips();
      } catch {
        list = [];
      }

      if (!list.length) {
        const active = await getActiveTrips();
        const assigned = myUserId
          ? (active || []).filter((x: any) => String(x?.driverId?._id ?? x?.driverId ?? "") === myUserId)
          : [];
        list = assigned.length ? assigned : active;
      }

      if (myUserId) {
        list = [...(list || [])].sort((a: any, b: any) => {
          const aMine = String(a?.driverId?._id ?? a?.driverId ?? "") === myUserId;
          const bMine = String(b?.driverId?._id ?? b?.driverId ?? "") === myUserId;
          if (aMine !== bMine) return aMine ? -1 : 1;
          return new Date(a?.departureTime).getTime() - new Date(b?.departureTime).getTime();
        });
      }

      setTrips(list || []);

      if (!presetTripId && !tripId && (list || []).length === 1) {
        const onlyId = getTripId(list[0]);
        if (onlyId) {
          setTripId(onlyId);
          await loadTripRoute(onlyId);
        }
      }
    } catch (e: any) {
      setError(e?.friendlyMessage || e?.message || "Không tải được danh sách chuyến.");
      setTrips([]);
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    void loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (presetTripId) {
      setTripId(presetTripId);
      void loadTripRoute(presetTripId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetTripId]);

  const startTracking = async (targetTripId?: string) => {
    const id = String(targetTripId ?? tripId ?? "").trim();
    if (!id) {
      Alert.alert("Thiếu chuyến", "Bạn hãy chọn một chuyến trong danh sách.");
      return;
    }

    setTripId(id);
    await loadTripRoute(id);

    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Quyền vị trí", "Bạn cần cấp quyền vị trí để chia sẻ vị trí xe.");
      return;
    }

    stopTracking();
    setTracking(true);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 20,
      },
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const heading = pos.coords.heading ?? undefined;
        const speed = pos.coords.speed ?? undefined;

        setMe({ latitude: lat, longitude: lng });

        try {
          await trackingService.updateTripLocation(id, {
            lat,
            lng,
            heading: heading === null ? undefined : Number(heading),
            speed: speed === null ? undefined : Number(speed),
          });
          setLastSent(new Date());
        } catch (e: any) {
          setError(e?.friendlyMessage || e?.message || "Không gửi được vị trí.");
        }
      },
    );
  };

  const title = `${trip?.route?.fromLocationId?.name ?? "-"} → ${trip?.route?.toLocationId?.name ?? "-"}`;

  const renderTrip = ({ item }: { item: any }) => {
    const id = getTripId(item);
    const from = item?.route?.fromLocationId?.name ?? item?.route?.fromLocationId?.province ?? "-";
    const to = item?.route?.toLocationId?.name ?? item?.route?.toLocationId?.province ?? "-";
    const time = fmtTime(item?.departureTime);
    const mine = myUserId && String(item?.driverId?._id ?? item?.driverId ?? "") === myUserId;

    return (
      <AppCard style={[styles.tripCard, mine && styles.tripCardMine]}>
        <View style={styles.tripRow}>
          <Ionicons name={mine ? "car-sport" : "bus"} size={18} color={mine ? COLORS.success.main : COLORS.text.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tripTitle} numberOfLines={1}>
              {from} → {to}
            </Text>
            <Text style={styles.tripSub} numberOfLines={1}>
              Khởi hành: {time} • {id.slice(0, 6)}…
            </Text>
          </View>
          <SelectChip label="Chọn" onPress={() => startTracking(id)} />
        </View>
      </AppCard>
    );
  };

  const androidTopPad = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <AppScreen statusBarStyle="dark-content">
      <View style={[styles.header, { paddingTop: androidTopPad + SPACING.md }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Chia sẻ vị trí</Text>
        </View>
        <Ionicons
          name={tracking ? "radio" : "radio-outline"}
          size={20}
          color={tracking ? COLORS.success.main : COLORS.text.secondary}
        />
      </View>

      <View style={{ padding: SPACING.lg, paddingBottom: 0 }}>
        {!!error && <AppFormMessage variant="error" message={error} onClose={() => setError("")} />}

        {!tracking && (
          <AppCard style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.title}>Chọn chuyến để chia sẻ</Text>
              <Ionicons name="refresh" size={18} color={COLORS.text.secondary} onPress={loadTrips} />
            </View>

            {tripsLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 12 }}>
                <ActivityIndicator color={COLORS.primary.main} />
                <Text style={styles.small}>Đang tải danh sách chuyến...</Text>
              </View>
            ) : trips.length === 0 ? (
              <View style={{ paddingVertical: 8 }}>
                <Text style={styles.small}>Chưa có chuyến nào trong ngày.</Text>
                <Text style={[styles.small, { marginTop: 6 }]}>Nếu bạn là tài xế, nhà xe cần phân công chuyến cho bạn.</Text>
                <View style={{ marginTop: 10 }}>
                  <SelectChip label="Tải lại" onPress={loadTrips} />
                </View>
              </View>
            ) : (
              <FlatList
                data={trips}
                keyExtractor={(x, idx) => getTripId(x) || String(idx)}
                renderItem={renderTrip}
                style={styles.tripsList}
                contentContainerStyle={{ paddingVertical: 10 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </AppCard>
        )}

        <AppCard style={[styles.card, { marginTop: SPACING.md }]}>
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 10 }}>
              <ActivityIndicator color={COLORS.primary.main} />
              <Text style={styles.small}>Đang tải tuyến đường...</Text>
            </View>
          ) : tracking ? (
            <SelectChip label="Dừng chia sẻ" onPress={stopTracking} />
          ) : tripId ? (
            <SelectChip label="Bắt đầu chia sẻ" onPress={() => startTracking(tripId)} />
          ) : (
            <Text style={styles.small}>Chọn chuyến phía trên để bắt đầu.</Text>
          )}

          {!!trip && (
            <Text style={[styles.small, { marginTop: 10 }]} numberOfLines={2}>
              {title}
            </Text>
          )}

          <Text style={styles.small}>{lastSent ? `Đã gửi lúc: ${lastSent.toLocaleTimeString("vi-VN")}` : "Chưa gửi vị trí"}</Text>
        </AppCard>
      </View>

      {/* Map chỉ hiển thị khi đã chọn chuyến (tránh bị list đẩy mất map) */}
      {(tracking || tripId) && (
        <View style={{ flex: 1, marginTop: SPACING.md }}>
          <MapView
            ref={(r) => (mapRef.current = r)}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          >
            {routeCoords.length > 1 && <Polyline coordinates={routeCoords} strokeWidth={4} />}
            {fromCoord && <Marker coordinate={fromCoord} title="Điểm đi" />}
            {toCoord && <Marker coordinate={toCoord} title="Điểm đến" />}

            {me && (
              <Marker coordinate={me} title="Bạn (tài xế)">
                <View style={styles.meDot} />
              </Marker>
            )}
          </MapView>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { ...TYPOGRAPHY.h4, fontWeight: "900", color: COLORS.text.primary },

  card: { padding: SPACING.lg },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.text.primary },
  small: { marginTop: 6, ...TYPOGRAPHY.body3, fontWeight: "700", color: withOpacity(COLORS.text.secondary, 0.92) },

  tripsList: {
    marginTop: 10,
    maxHeight: 420,
  },

  tripCard: { padding: SPACING.md, borderWidth: 1, borderColor: withOpacity(COLORS.border.light, 0.8) },
  tripCardMine: {
    borderColor: withOpacity(COLORS.success.main, 0.35),
    backgroundColor: withOpacity((COLORS as any).success?.light ?? COLORS.success.main, 0.06),
  },
  tripRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tripTitle: { ...TYPOGRAPHY.body2, fontWeight: "900", color: COLORS.text.primary },
  tripSub: { marginTop: 4, ...TYPOGRAPHY.body3, fontWeight: "700", color: withOpacity(COLORS.text.secondary, 0.92) },

  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary.main,
  },
  selectChipText: { ...TYPOGRAPHY.body3, fontWeight: "900", color: COLORS.text.inverse },

  meDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success.main,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
