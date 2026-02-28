import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { bookingService } from "../../services/user/bookingService";
import type { Trip } from "../../types/index-types";

import {
  COLORS,
  withOpacity,
  SPACING,
  TYPOGRAPHY,
  LAYOUT,
  COMMON_SHADOWS,
  ICONS,
} from "@/theme";

type TripDetailsRouteProp = RouteProp<
  {
    TripDetails: {
      trip: Trip;
    };
  },
  "TripDetails"
>;

interface Seat {
  _id: string;
  seatNumber: string;
  status: "available" | "booked" | "held" | "selected";
  price: number;
  isWindow?: boolean;
  isAisle?: boolean;
  row?: number;
  column?: number;
}


const mapBackendSeatsToUI = (backendSeats: any[], defaultPrice = 0): Seat[] => {
  return (backendSeats || []).map((s: any, idx: number) => {
    const st = String(s.status || '').toUpperCase();
    const mapped: Seat['status'] =
      st === 'AVAILABLE' ? 'available' :
      st === 'HELD' ? 'held' :
      st === 'BOOKED' || st === 'RESERVED' ? 'booked' :
      'available';
    return {
      _id: s.bookingId ? String(s.bookingId) : String(idx),
      seatNumber: String(s.seatNumber),
      status: mapped,
      price: defaultPrice,
      row: s.position?.row,
      column: s.position?.col,
    };
  });
};
const isObjectId = (s: any) =>
  typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);

const unwrapTrip = (input: any) => (input?.data ? input.data : input);

// lấy tripId an toàn dù trip bị bọc {success,data,...}
const getTripId = (t: any) =>
  String(
    unwrapTrip(t)?.tripId ?? unwrapTrip(t)?._id ?? unwrapTrip(t)?.id ?? "",
  ).trim();

const { width } = Dimensions.get("window");


export default function TripDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<TripDetailsRouteProp>();
  const trip = route.params?.trip;

  const lastInvalidIdRef = useRef<string | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [tripData, setTripData] = useState<any>(unwrapTrip(trip) ?? trip ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const generateSeats = (totalSeats: number, price: number, prefix: string) => {
    const mockSeats: Seat[] = [];
    for (let i = 1; i <= totalSeats; i++) {
      const row = Math.ceil(i / 4);
      const col = ((i - 1) % 4) + 1;
      const seatNumber = `${String.fromCharCode(64 + row)}${col}`;

      mockSeats.push({
        _id: `${prefix}-${i}`,
        seatNumber,
        status: i % 10 < 3 ? "booked" : "available",
        price,
        isWindow: col === 1 || col === 4,
        isAisle: col === 2 || col === 3,
        row,
        column: col,
      });
    }
    return mockSeats;
  };

  const fetchDetails = async () => {
    const rawId = getTripId(trip);
    if (!rawId) return;

    // nếu không phải ObjectId thì fallback UI
    if (!isObjectId(rawId)) {
      setLoading(false);
      const base = unwrapTrip(trip) ?? trip;
      setTripData(base);

      const totalSeats = base?.vehicleId?.totalSeats || 45;
      setSeats(generateSeats(totalSeats, Number(base?.price || 0), "fallback-seat"));

      if (lastInvalidIdRef.current !== rawId) lastInvalidIdRef.current = rawId;
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const res: any = await bookingService.getTripDetails(rawId);

      // ✅ QUAN TRỌNG: unwrap nếu backend trả {success,data,price}
      const fullTrip = unwrapTrip(res);

      // giữ price không bị mất
      const normalized = {
        ...fullTrip,
        price: Number(fullTrip?.price ?? unwrapTrip(trip)?.price ?? trip?.price ?? 0) || 0,
      };

      setTripData(normalized);

      if (normalized?.seats && Array.isArray(normalized.seats) && normalized.seats.length > 0) {
        setSeats(normalized.seats as unknown as Seat[]);
      } else {
        const totalSeats = normalized?.vehicleId?.totalSeats || 45;
        setSeats(generateSeats(totalSeats, Number(normalized?.price || 0), "seat"));
      }
    } catch (e) {
      const base = unwrapTrip(trip) ?? trip;
      setTripData(base);

      const totalSeats = base?.vehicleId?.totalSeats || 45;
      setSeats(generateSeats(totalSeats, Number(base?.price || 0), "fallback-seat"));
      setLoadError("Không thể tải đầy đủ thông tin từ máy chủ. Đang hiển thị dữ liệu dự phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedSeats([]);
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTripId(trip)]);

  const handleSeatSelect = (seatNumber: string) => {
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    if (!seat || seat.status !== "available") return;

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber],
    );
  };

  const getSeatStatus = (seatNumber: string) => {
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    return (seat?.status ?? "available") as Seat["status"];
  };

  const getSeatStyle = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);

    if (isSelected) return [styles.seat, styles.seatSelected];

    switch (status) {
      case "available":
        return [styles.seat, styles.seatAvailable];
      case "booked":
        return [styles.seat, styles.seatBooked];
      case "held":
        return [styles.seat, styles.seatHeld];
      default:
        return [styles.seat, styles.seatAvailable];
    }
  };

  const getSeatTextStyle = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);

    if (isSelected) return styles.seatTextSelected;

    switch (status) {
      case "available":
        return styles.seatTextAvailable;
      case "booked":
        return styles.seatTextBooked;
      case "held":
        return styles.seatTextHeld;
      default:
        return styles.seatTextAvailable;
    }
  };

  const totalAmount = useMemo(() => {
    return selectedSeats.length * (tripData?.price || 0);
  }, [selectedSeats.length, tripData?.price]);

  const handleContinueToBooking = () => {
    if (!tripData) return;
    if (selectedSeats.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một ghế");
      return;
    }

    // ✅ QUAN TRỌNG: luôn truyền trip đã unwrap (để Checkout có id/_id)
    (navigation as any).navigate("BookingCheckout", {
      trip: unwrapTrip(tripData) ?? tripData,
      selectedSeats,
      totalAmount,
    });
  };

  const seatsPerRow = 4;
  const seatSize = useMemo(() => {
    const usable = width - SPACING.md * 2 - 24;
    const size = usable / seatsPerRow - 10;
    return Math.max(44, Math.min(62, size));
  }, []);

  const renderSeatMap = () => {
    const rows = Math.ceil(seats.length / seatsPerRow);

    return (
      <View>
        <View style={styles.driverArea}>
          <View style={styles.driverIconWrap}>
            <Ionicons
              name={ICONS.car as any}
              size={18}
              color={COLORS.text.secondary}
            />
          </View>
          <Text style={styles.driverText}>Khu vực tài xế</Text>
        </View>

        <View style={styles.seatsWrap}>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.seatRow}>
              {Array.from({ length: seatsPerRow }, (_, colIndex) => {
                const seatIndex = rowIndex * seatsPerRow + colIndex;
                const seatObj = seats[seatIndex];

                if (!seatObj) {
                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.emptySeat,
                        { width: seatSize, height: seatSize },
                      ]}
                    />
                  );
                }

                const seatNumber = seatObj.seatNumber;
                const disabled = getSeatStatus(seatNumber) !== "available";

                return (
                  <Pressable
                    key={colIndex}
                    onPress={() => handleSeatSelect(seatNumber)}
                    disabled={disabled}
                    style={({ pressed }) => [
                      getSeatStyle(seatNumber),
                      { width: seatSize, height: seatSize },
                      pressed && !disabled ? styles.seatPressed : null,
                    ]}
                  >
                    <Text style={getSeatTextStyle(seatNumber)}>
                      {seatNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <LegendItem label="Có sẵn" dotStyle={styles.legendDotAvailable} />
          <LegendItem label="Đã chọn" dotStyle={styles.legendDotSelected} />
          <LegendItem label="Đã đặt" dotStyle={styles.legendDotBooked} />
          <LegendItem label="Tạm giữ" dotStyle={styles.legendDotHeld} />
        </View>
      </View>
    );
  };

  if (!tripData) {
    return (
      <AppScreen statusBarStyle="dark-content">
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.headerBtn}
          >
            <Ionicons
              name={ICONS.arrowBack as any}
              size={22}
              color={COLORS.text.primary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết chuyến xe</Text>
          <View style={{ width: LAYOUT.headerIconSize }} />
        </View>

        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={54}
            color={COLORS.error.main}
          />
          <Text style={styles.centerTitle}>
            Không thể tải thông tin chuyến xe
          </Text>
          <Text style={styles.centerSub}>
            Vui lòng quay lại và thử mở lại chuyến.
          </Text>

          <AppButton title="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen statusBarStyle="dark-content">
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Ionicons
            name={ICONS.arrowBack as any}
            size={22}
            color={COLORS.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết chuyến xe</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!!loadError && <AppFormMessage variant="warning" message={loadError} />}

        <AppCard style={styles.cardPad}>
          <Text style={styles.sectionTitle}>Tuyến đường</Text>

          <View style={styles.locationRow}>
            <View
              style={[
                styles.locationIcon,
                { backgroundColor: withOpacity(COLORS.primary.main, 0.1) },
              ]}
            >
              <Ionicons
                name={ICONS.location as any}
                size={18}
                color={COLORS.primary.main}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>
                {tripData.route?.fromLocationId?.name || "Điểm đi"}
              </Text>
              {!!tripData.route?.fromLocationId?.province && (
                <Text style={styles.locationSub}>
                  {tripData.route?.fromLocationId?.province}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.routeLine}>
            <View style={styles.routeDot} />
            <View style={styles.routeStem} />
            <View
              style={[
                styles.routeDot,
                { backgroundColor: COLORS.company.phuongTrang },
              ]}
            />
          </View>

          <View style={styles.locationRow}>
            <View
              style={[
                styles.locationIcon,
                {
                  backgroundColor: withOpacity(COLORS.company.phuongTrang, 0.1),
                },
              ]}
            >
              <Ionicons
                name={ICONS.location as any}
                size={18}
                color={COLORS.company.phuongTrang}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>
                {tripData.route?.toLocationId?.name || "Điểm đến"}
              </Text>
              {!!tripData.route?.toLocationId?.province && (
                <Text style={styles.locationSub}>
                  {tripData.route?.toLocationId?.province}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.grid}>
            <InfoItem
              icon="time-outline"
              label="Khởi hành"
              value={formatTime(tripData.departureTime || new Date().toISOString())}
            />
            <InfoItem
              icon="time"
              label="Đến nơi"
              value={formatTime(
                tripData.expectedArrivalTime || new Date().toISOString(),
              )}
            />
            <InfoItem
              icon="timer-outline"
              label="Thời gian"
              value={calculateDuration(
                tripData.departureTime || new Date().toISOString(),
                tripData.expectedArrivalTime || new Date().toISOString(),
              )}
            />
            <InfoItem
              icon="calendar-outline"
              label="Ngày đi"
              value={formatDate(tripData.departureTime || new Date().toISOString())}
            />
            <InfoItem
              icon="business"
              label="Nhà xe"
              value={tripData.companyId?.name || "Nhà xe"}
            />
            <InfoItem
              icon="car"
              label="Loại xe"
              value={tripData.vehicleId?.type || "Xe khách"}
            />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá vé</Text>
            <Text style={styles.priceValue}>{formatPrice(tripData.price || 0)}</Text>
          </View>
        </AppCard>

        <AppCard style={styles.cardPad}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Chọn ghế</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {selectedSeats.length}/{seats.length || 0}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary.main} />
              <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
            </View>
          ) : seats.length > 0 ? (
            renderSeatMap()
          ) : (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={44}
                color={COLORS.error.main}
              />
              <Text style={styles.errorTitle}>Không thể tải sơ đồ ghế</Text>
              <Text style={styles.errorSub}>Vui lòng thử lại.</Text>
              <AppButton title="Thử lại" onPress={fetchDetails} />
            </View>
          )}
        </AppCard>

        {selectedSeats.length > 0 && (
          <AppCard style={styles.cardPad}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ghế đã chọn</Text>
              <Text style={styles.countText}>{selectedSeats.length} ghế</Text>
            </View>

            <View style={styles.chips}>
              {selectedSeats.map((s) => (
                <View key={s} style={styles.chipSelected}>
                  <Text style={styles.chipSelectedText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng tiền</Text>
              <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </AppCard>
        )}

        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}>
          <AppButton
            title={`Tiếp tục đặt vé (${selectedSeats.length} ghế)`}
            onPress={handleContinueToBooking}
            disabled={selectedSeats.length === 0}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function LegendItem({ label, dotStyle }: { label: string; dotStyle: any }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, dotStyle]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={COLORS.text.secondary} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

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
    backgroundColor: withOpacity(COLORS.background.secondary, 0.8),
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
    gap: SPACING.md as any,
  },

  cardPad: { padding: SPACING.lg, marginHorizontal: SPACING.md },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h6.fontSize,
    fontWeight: TYPOGRAPHY.h6.fontWeight as any,
    color: COLORS.text.primary,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md as any,
    paddingVertical: SPACING.sm,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
  },
  locationName: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    fontWeight: "800",
    color: COLORS.text.primary,
  },
  locationSub: {
    marginTop: 2,
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "600",
    color: COLORS.text.secondary,
  },

  routeLine: { alignItems: "center", paddingVertical: SPACING.xs },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary.main,
  },
  routeStem: {
    width: 2,
    height: 22,
    backgroundColor: withOpacity(COLORS.primary.main, 0.35),
    marginVertical: 6,
  },

  divider: {
    height: 1,
    backgroundColor: withOpacity(COLORS.border.light, 0.9),
    marginVertical: SPACING.md,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: SPACING.md as any,
  },
  infoItem: {
    width: "32%",
    minWidth: 92,
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
    marginBottom: 2,
    textAlign: "center",
  },
  infoValue: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
    color: COLORS.text.primary,
    textAlign: "center",
  },

  priceRow: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(COLORS.border.light, 0.9),
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.h4.fontSize,
    fontWeight: TYPOGRAPHY.h4.fontWeight as any,
    color: COLORS.primary.main,
  },

  driverArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm as any,
    padding: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    marginBottom: SPACING.md,
  },
  driverIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(COLORS.neutral.gray200, 0.6),
  },
  driverText: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },

  seatsWrap: { paddingVertical: SPACING.sm },
  seatRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm as any,
  },
  seat: {
    borderRadius: LAYOUT.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...COMMON_SHADOWS.elevation1,
  },
  seatPressed: { transform: [{ scale: 0.98 }] },

  seatAvailable: {
    backgroundColor: withOpacity(COLORS.success.main, 0.12),
    borderColor: withOpacity(COLORS.success.main, 0.35),
  },
  seatSelected: {
    backgroundColor: COLORS.primary.main,
    borderColor: withOpacity(COLORS.primary.dark, 0.95),
  },
  seatBooked: {
    backgroundColor: withOpacity(COLORS.error.main, 0.1),
    borderColor: withOpacity(COLORS.error.main, 0.28),
    opacity: 0.85,
  },
  seatHeld: {
    backgroundColor: withOpacity(COLORS.warning.main, 0.12),
    borderColor: withOpacity(COLORS.warning.main, 0.3),
  },

  emptySeat: { opacity: 0 },

  seatTextAvailable: {
    color: COLORS.success.dark,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
  },
  seatTextSelected: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
  },
  seatTextBooked: {
    color: COLORS.error.dark,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
  },
  seatTextHeld: {
    color: COLORS.warning.dark,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
  },

  legend: {
    marginTop: SPACING.md,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.md as any,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs as any,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
  },
  legendDotAvailable: {
    backgroundColor: withOpacity(COLORS.success.main, 0.35),
    borderColor: withOpacity(COLORS.success.main, 0.45),
  },
  legendDotSelected: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  legendDotBooked: {
    backgroundColor: withOpacity(COLORS.error.main, 0.3),
    borderColor: withOpacity(COLORS.error.main, 0.4),
  },
  legendDotHeld: {
    backgroundColor: withOpacity(COLORS.warning.main, 0.3),
    borderColor: withOpacity(COLORS.warning.main, 0.4),
  },
  legendText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
  },

  loadingBox: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm as any,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
  },

  errorBox: { paddingVertical: SPACING.xl, alignItems: "center" },
  errorTitle: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.h6.fontSize,
    fontWeight: TYPOGRAPHY.h6.fontWeight as any,
    color: COLORS.error.main,
    textAlign: "center",
  },
  errorSub: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "700",
    color: COLORS.text.secondary,
    textAlign: "center",
  },

  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.primary.main, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.18),
  },
  badgeText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
    color: COLORS.primary.main,
  },
  countText: {
    fontSize: TYPOGRAPHY.body3.fontSize,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm as any },
  chipSelected: {
    backgroundColor: COLORS.primary.main,
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    ...COMMON_SHADOWS.elevation1,
  },
  chipSelectedText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: "900",
  },

  totalRow: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(COLORS.border.light, 0.9),
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    fontWeight: "800",
    color: COLORS.text.secondary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.h5.fontSize,
    fontWeight: TYPOGRAPHY.h5.fontWeight as any,
    color: COLORS.secondary.main,
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
