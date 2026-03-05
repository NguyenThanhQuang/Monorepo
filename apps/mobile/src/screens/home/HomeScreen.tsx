import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl, View, Alert } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { ROUTES, COLORS, SPACING } from "../../theme";
import { RootState } from "../../store/index-store";
import { bookingService } from "../../services";

import Stagger from "../../components/ui/Stagger";
import HomeHeader from "../../components/home/HomeHeader";
import QuickActions from "../../components/home/QuickActions";
import PopularRoutes from "../../components/home/PopularRoutes";
import TodayTrips from "../../components/home/TodayTrips";
import RecentBooking from "../../components/home/RecentBooking";
import PromotionBanner from "../../components/home/PromotionBanner";
import { searchLocations } from "../../services/user/locationService";

type PresetLocation = {
  id: string;
  name: string;
  province?: string;
  type?: string;
};

/**
 * ✅ Resolve text -> Location thật (_id thật) để SearchTripsScreen nhận preset fromLoc/toLoc
 */
const resolveLocation = async (
  text: string,
): Promise<PresetLocation | null> => {
  const q = (text || "").trim();
  if (!q) return null;

  const res = await searchLocations(q);
  if (!Array.isArray(res) || res.length === 0) return null;

  const best = (res.find((x: any) => x?.type === "city") ?? res[0]) as any;
  const id = String(best?._id ?? best?.id ?? "");

  if (!id) return null;

  return {
    id,
    name: best.name ?? q,
    province: best.province ?? "",
    type: best.type,
  };
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [todayTrips, setTodayTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const handleSearchTrips = () =>
    navigation.navigate(ROUTES.SearchTrips as never);
  const handleMyBookings = () =>
    navigation.navigate(ROUTES.MyBookings as never);
  const handleBusTracking = () =>
    navigation.navigate(ROUTES.BusTracking as never);
  const handleProfile = () => navigation.navigate(ROUTES.Profile as never);

  /**
   * ✅ NEW: mở SearchTrips với preset tuyến phổ biến
   * - autoSearch: true để vào SearchTrips là tự search luôn
   * - nếu resolve fail vẫn mở SearchTrips với text để user tự chọn
   */
  const handlePopularRoutePress = async (fromText: string, toText: string) => {
    try {
      const [fromLoc, toLoc] = await Promise.all([
        resolveLocation(fromText),
        resolveLocation(toText),
      ]);

      navigation.navigate(
        ROUTES.SearchTrips as never,
        {
          preset: {
            fromText,
            toText,
            fromLoc: fromLoc ?? null,
            toLoc: toLoc ?? null,

            // optional
            passengers: 1,
            autoSearch: true,
          },
        } as never,
      );
    } catch {
      navigation.navigate(
        ROUTES.SearchTrips as never,
        {
          preset: {
            fromText,
            toText,
            passengers: 1,
            autoSearch: false,
          },
        } as never,
      );
    }
  };

  const handleTripSelect = (trip: any) => {
    // ✅ TripDetailsScreen expects { trip }, not { tripId }
    navigation.navigate("TripDetails" as never, { trip } as never);
  };

  const fetchTodayTrips = async () => {
    try {
      setLoadingTrips(true);
      const todayString = new Date().toISOString().split("T")[0];

      const popularRoutes = [
        { from: "Hà Nội", to: "TP. Hồ Chí Minh" },
        { from: "TP. Hồ Chí Minh", to: "Đà Nẵng" },
        { from: "Đà Nẵng", to: "Hà Nội" },
      ];

      const results = await Promise.all(
        popularRoutes.map(async (r) => {
          try {
            const [fromLoc, toLoc] = await Promise.all([
              resolveLocation(r.from),
              resolveLocation(r.to),
            ]);

            if (!fromLoc?.id || !toLoc?.id) return [];

            const res = await bookingService.searchTrips({
              fromLocationId: fromLoc.id,
              toLocationId: toLoc.id,
              date: todayString,
              passengers: 1,
            });

            return Array.isArray(res?.trips) ? res.trips : [];
          } catch {
            return [];
          }
        }),
      );

      const merged = results.flat().filter(Boolean);
      const unique = Array.from(
        new Map(merged.map((t: any) => [t._id, t])).values(),
      );
      setTodayTrips(unique.slice(0, 10));
    } catch (e) {
      console.error("Error fetching today trips:", e);
      setTodayTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchTodayTrips();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actions = useMemo(
    () => [
      {
        key: "search",
        label: "Tìm chuyến xe",
        icon: "search" as const,
        color: COLORS.primary.main,
        onPress: handleSearchTrips,
      },
      {
        key: "bookings",
        label: "Vé của tôi",
        icon: "bookmark" as const,
        color: COLORS.success.main,
        onPress: handleMyBookings,
      },
      {
        key: "tracking",
        label: "Theo dõi xe",
        icon: "location" as const,
        color: COLORS.warning.main,
        onPress: handleBusTracking,
      },
      {
        key: "profile",
        label: "Hồ sơ",
        icon: "person" as const,
        color: COLORS.info.main,
        onPress: handleProfile,
      },
    ],
    [],
  );

  // ✅ FIX: routes phổ biến bây giờ truyền tuyến cụ thể + preset
  const routes = useMemo(
    () => [
      {
        key: "hn-hcm",
        title: "Hà Nội → TP. HCM",
        priceText: "Từ 500.000đ",
        color: COLORS.primary.main,
        onPress: () => handlePopularRoutePress("Hà Nội", "TP. Hồ Chí Minh"),
      },
      {
        key: "hcm-dn",
        title: "TP. HCM → Đà Nẵng",
        priceText: "Từ 300.000đ",
        color: COLORS.success.main,
        onPress: () => handlePopularRoutePress("TP. Hồ Chí Minh", "Đà Nẵng"),
      },
      {
        key: "dn-hn",
        title: "Đà Nẵng → Hà Nội",
        priceText: "Từ 400.000đ",
        color: COLORS.warning.main,
        onPress: () => handlePopularRoutePress("Đà Nẵng", "Hà Nội"),
      },
    ],
    [],
  );

  // ✅ Parallax header on scroll
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const ty = interpolate(
      scrollY.value,
      [0, 160],
      [0, -18],
      Extrapolate.CLAMP,
    );
    const sc = interpolate(
      scrollY.value,
      [0, 160],
      [1, 1.03],
      Extrapolate.CLAMP,
    );
    return { transform: [{ translateY: ty }, { scale: sc }] as any };
  });

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: COLORS.background.primary }}
      contentContainerStyle={{ paddingBottom: 170 }}
      refreshControl={
        <RefreshControl
          refreshing={loadingTrips}
          onRefresh={fetchTodayTrips}
          colors={[COLORS.primary.main]}
          tintColor={COLORS.primary.main}
        />
      }
    >
      <Animated.View style={headerStyle}>
        <HomeHeader name={user?.name || "Bạn"} onProfile={handleProfile} />
      </Animated.View>

      <Stagger baseDelay={90} step={90}>
        <View style={{ marginTop: SPACING.xl }}>
          <QuickActions actions={actions} />
        </View>

        <PopularRoutes routes={routes} />

        <TodayTrips
          loading={loadingTrips}
          trips={todayTrips}
          onRefresh={fetchTodayTrips}
          onViewAll={handleSearchTrips}
          onSelectTrip={handleTripSelect}
          formatTime={formatTime}
        />

        <RecentBooking onPress={handleMyBookings} />
        <PromotionBanner />
      </Stagger>
    </Animated.ScrollView>
  );
}
