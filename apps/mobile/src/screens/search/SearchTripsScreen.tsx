import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppInput from "@/components/ui/AppInput";
import AppButton from "@/components/ui/AppButton";
import AppFormMessage, {
  FormMessageVariant,
} from "@/components/ui/AppFormMessage";

import { SEARCH_STYLES } from "../../theme/screens/searchStyles";
import {
  searchLocations,
  getLocationsByProvince,
  Location,
} from "../../services/user/locationService";
import { bookingService } from "../../services/user/bookingService";

// ✅ theme (Modern Tech)
import {
  COLORS,
  SPACING,
  LAYOUT,
  TYPOGRAPHY,
  COMMON_SHADOWS,
  withOpacity,
} from "../../theme";

interface Trip {
  // id thật backend để gọi API
  tripId: string;

  // id UI để render list (fallback được)
  uiId: string;

  // giữ _id để tương thích code cũ (nhưng sẽ = tripId)
  _id: string;

  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  expectedArrivalTime: string;
  price: number;
  availableSeats: number;
  company: { name: string };
  seats?: any[];
  route?: {
    fromLocationId: { name: string; province: string };
    toLocationId: { name: string; province: string };
    stops: any[];
  };
  companyId?: { name: string; _id: string };
  vehicleId?: { type: string; totalSeats: number; _id: string };
  status?: string;
}

type Nav = any;
type TimeoutHandle = ReturnType<typeof setTimeout>;

type PresetParams = {
  // HomeScreen có thể gửi 1 trong 2 kiểu:
  // (1) gửi text
  fromText?: string;
  toText?: string;
  // (2) gửi thẳng Location (có _id thật)
  fromLoc?: Location | null;
  toLoc?: Location | null;
  // optional: preset date
  date?: string;
  passengers?: number;
  // auto fetch
  autoSearch?: boolean;
};

const normalizeProvinceKey = (input: string) => {
  const parts = (input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const last =
    parts.length > 0 ? parts[parts.length - 1] : (input || "").trim();
  return last.trim();
};

const canonicalizeProvince = (s: string) => {
  const t = (s || "").trim();
  const lower = t.toLowerCase();

  if (
    lower.includes("tp.hcm") ||
    lower.includes("tp hcm") ||
    lower.includes("tp. hồ chí minh") ||
    lower.includes("tphcm") ||
    lower.includes("thành phố hồ chí minh")
  ) {
    return "TP. Hồ Chí Minh";
  }
  if (lower.includes("thành phố hà nội")) return "Hà Nội";
  return t;
};

const displayLocationLabel = (loc?: Location | null) => {
  if (!loc) return "";
  const name = (loc.name || "").trim();
  const prov = (loc.province || "").trim();
  if (!name) return prov;
  if (!prov) return name;
  if (name.toLowerCase() === prov.toLowerCase()) return name;
  return `${name}, ${prov}`;
};

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

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

const getLocationId = (loc: any) => String(loc?._id ?? loc?.id ?? "");

export default function SearchTripsScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route?: any;
}) {
  const [formData, setFormData] = useState({
    departureDate: "",
    passengers: 1 as number,
  });

  const [dateObj, setDateObj] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedFrom, setSelectedFrom] = useState<Location | null>(null);
  const [selectedTo, setSelectedTo] = useState<Location | null>(null);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);

  const [recentSearches, setRecentSearches] = useState<
    Array<{ from: string; to: string }>
  >([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formMessage, setFormMessage] = useState<{
    text: string;
    variant: FormMessageVariant;
  } | null>(null);

  const fromDebounceRef = useRef<TimeoutHandle | null>(null);
  const toDebounceRef = useRef<TimeoutHandle | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ✅ tránh autoSearch chạy trước khi init xong
  const initDoneRef = useRef(false);
  const [resolvingPreset, setResolvingPreset] = useState(false);

  const popularCities = useMemo(
    () => [
      "Hà Nội",
      "TP. Hồ Chí Minh",
      "Đà Nẵng",
      "Hải Phòng",
      "Cần Thơ",
      "Đà Lạt",
      "Nha Trang",
      "Vũng Tàu",
      "Phan Thiết",
      "Huế",
    ],
    [],
  );

  const showMsg = (text: string, variant: FormMessageVariant = "info") => {
    setFormMessage({ text, variant });
  };

  const initDefaults = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setFormData((p) => ({ ...p, departureDate: `${yyyy}-${mm}-${dd}` }));
    setDateObj(today);
  };

  const loadRecentSearches = async () => {
    try {
      const data = await AsyncStorage.getItem("recentTripSearches");
      if (data) setRecentSearches(JSON.parse(data));
    } catch {}
  };

  const saveRecentSearch = async (from: string, to: string) => {
    try {
      const next = [
        { from, to },
        ...recentSearches.filter((s) => !(s.from === from && s.to === to)),
      ].slice(0, 5);
      setRecentSearches(next);
      await AsyncStorage.setItem("recentTripSearches", JSON.stringify(next));
    } catch {}
  };

  /**
   * ✅ Suggestions:
   * - Không trả về _id fake nữa vì backend cần ObjectId thật.
   * - Với query rỗng: resolve popularCities -> Location thật.
   */
  const searchLocation = async (q: string) => {
    const query = (q || "").trim();

    try {
      if (query.length < 1) {
        const results: Location[] = [];
        for (const city of popularCities.slice(0, 8)) {
          try {
            const res = await searchLocations(city);
            if (Array.isArray(res) && res.length > 0) {
              const cityItem =
                res.find((x: any) => x?.type === "city") ?? res[0];
              if (cityItem?._id) results.push(cityItem);
            }
          } catch {}
        }
        return results;
      }

      const provinceKeyRaw = normalizeProvinceKey(query);
      const provinceKey = canonicalizeProvince(provinceKeyRaw);
      const nameKey = (query.split(",")[0] || "").trim();

      if (provinceKeyRaw.length >= 2) {
        const tryKeys = Array.from(
          new Set([provinceKeyRaw, provinceKey].filter(Boolean)),
        );
        for (const k of tryKeys) {
          const byProvince = await getLocationsByProvince(k);
          if (Array.isArray(byProvince) && byProvince.length > 0) {
            const stations = byProvince.filter(
              (l: any) => l.type === "bus_station",
            );
            const cities = byProvince.filter(
              (l: any) => l.type !== "bus_station",
            );
            return [...cities, ...stations];
          }
        }
      }

      const keyForSearch = nameKey.length >= 2 ? nameKey : provinceKey;
      const res = await searchLocations(keyForSearch);
      if (Array.isArray(res) && res.length > 0) return res;

      return [];
    } catch {
      return [];
    }
  };

  /**
   * ✅ Resolve string -> Location thật (có _id)
   * - Ưu tiên type="city" trước
   */
  const resolveLocationForText = async (
    text: string,
  ): Promise<Location | null> => {
    const t = canonicalizeProvince(normalizeProvinceKey(text || ""));
    if (!t) return null;

    try {
      const res = await searchLocations(t);
      if (!Array.isArray(res) || res.length === 0) return null;

      const city = res.find((x: any) => x?.type === "city" && x?._id);
      if (city) return city;

      const station = res.find((x: any) => x?.type === "bus_station" && x?._id);
      if (station) return station;

      return res[0]?._id ? res[0] : null;
    } catch {
      return null;
    }
  };

  // ✅ init
  useEffect(() => {
    (async () => {
      try {
        initDefaults();
        await loadRecentSearches();
      } finally {
        initDoneRef.current = true;
        setInitialLoading(false);
      }
    })();
  }, []);

  /**
   * ✅ NEW: nhận preset từ HomeScreen (PopularRoutes)
   * HomeScreen nên navigate kiểu:
   * navigation.navigate(ROUTES.SearchTrips, {
   *   preset: { fromText:"Hà Nội", toText:"TP. Hồ Chí Minh", autoSearch:true }
   * })
   *
   * hoặc nếu bạn có Location object:
   * preset: { fromLoc: locationObj, toLoc: locationObj }
   */
  useEffect(() => {
    const preset: PresetParams | undefined = route?.params?.preset;
    if (!preset) return;

    let alive = true;

    (async () => {
      try {
        setResolvingPreset(true);

        // set date/passengers nếu có
        if (preset.date) {
          setFormData((p) => ({ ...p, departureDate: preset.date! }));
          const d = new Date(preset.date);
          if (!isNaN(d.getTime())) setDateObj(d);
        }
        if (typeof preset.passengers === "number") {
          setFormData((p) => ({ ...p, passengers: preset.passengers! }));
        }

        // text hiển thị
        const fromText = preset.fromText || "";
        const toText = preset.toText || "";
        if (fromText) setFromQuery(fromText);
        if (toText) setToQuery(toText);

        // reset UI + state cũ
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
        setFromSuggestions([]);
        setToSuggestions([]);
        setTrips([]);
        setError(null);
        setFormMessage(null);

        // ✅ ưu tiên dùng loc được gửi thẳng từ Home
        let fromLoc = preset.fromLoc ?? null;
        let toLoc = preset.toLoc ?? null;

        // ✅ nếu Home chỉ gửi text, thì resolve ngay tại đây
        if (!getLocationId(fromLoc) && fromText) {
          fromLoc = await resolveLocationForText(fromText);
        }
        if (!getLocationId(toLoc) && toText) {
          toLoc = await resolveLocationForText(toText);
        }

        if (!alive) return;

        setSelectedFrom(fromLoc);
        setSelectedTo(toLoc);

        if (fromLoc) setFromQuery(displayLocationLabel(fromLoc));
        if (toLoc) setToQuery(displayLocationLabel(toLoc));

        // ✅ autoSearch chỉ chạy SAU khi đã resolve xong selected
        if (preset.autoSearch) {
          // đợi init xong nữa
          const tryRun = () => {
            if (!initDoneRef.current) return setTimeout(tryRun, 30);
            fetchTrips({
              fromOverride: fromLoc,
              toOverride: toLoc,
              silentWarning: true,
            });
          };
          tryRun();
        }
      } finally {
        if (alive) setResolvingPreset(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.preset]);

  // suggestions debounce
  useEffect(() => {
    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
    if (!showFromSuggestions) return;

    fromDebounceRef.current = setTimeout(async () => {
      const results = await searchLocation(fromQuery);
      setFromSuggestions(results);
    }, 220);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromQuery, showFromSuggestions]);

  useEffect(() => {
    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);
    if (!showToSuggestions) return;

    toDebounceRef.current = setTimeout(async () => {
      const results = await searchLocation(toQuery);
      setToSuggestions(results);
    }, 220);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toQuery, showToSuggestions]);

  const handleSelectFrom = (loc: Location) => {
    setSelectedFrom(loc);
    setFromQuery(displayLocationLabel(loc));
    setShowFromSuggestions(false);
    setFromSuggestions([]);
  };

  const handleSelectTo = (loc: Location) => {
    setSelectedTo(loc);
    setToQuery(displayLocationLabel(loc));
    setShowToSuggestions(false);
    setToSuggestions([]);
  };

  const swapDirections = () => {
    setFormMessage(null);
    setError(null);
    setTrips([]);

    const prevFrom = selectedFrom;
    const prevTo = selectedTo;

    setSelectedFrom(prevTo);
    setSelectedTo(prevFrom);
    setFromQuery(displayLocationLabel(prevTo));
    setToQuery(displayLocationLabel(prevFrom));

    setShowFromSuggestions(false);
    setShowToSuggestions(false);
    setFromSuggestions([]);
    setToSuggestions([]);
  };

const mapTrip = (trip: any): Trip => {
  const tripId = String(trip?.id ?? trip?._id ?? "").trim();
  const uiId = tripId || String(`${trip?.departureTime ?? "trip"}-${Math.random()}`);

  return {
    tripId,
    _id: tripId, // ✅ _id luôn là tripId (backend id) để TripDetails dùng được
    uiId,

    from:
      trip?.from ||
      trip?.route?.fromLocationId?.name ||
      trip?.route?.fromLocationId?.province ||
      "",
    to:
      trip?.to ||
      trip?.route?.toLocationId?.name ||
      trip?.route?.toLocationId?.province ||
      "",
    departureTime: String(trip?.departureTime ?? ""),
    arrivalTime: String(trip?.expectedArrivalTime ?? ""),
    expectedArrivalTime: String(trip?.expectedArrivalTime ?? ""),

    // ✅ giữ giá luôn là number
    price: Number(trip?.price ?? 0) || 0,

    availableSeats:
      Number(trip?.availableSeats ?? trip?.availableSeatsCount ?? 0) ||
      (Array.isArray(trip?.seats)
        ? trip.seats.filter((s: any) => s?.status === "available").length
        : 0),

    company: trip?.company || trip?.companyId || { name: "Unknown Company" },
    seats: Array.isArray(trip?.seats) ? trip.seats : [],
    route: trip?.route,
    companyId: trip?.companyId,
    vehicleId: trip?.vehicleId,
    status: trip?.status,
  };
};


  const fetchTrips = async (opts?: {
    fromOverride?: Location | null;
    toOverride?: Location | null;
    silentWarning?: boolean; // autoSearch thì đừng spam warning
  }) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setSearching(true);
    setError(null);
    setFormMessage(null);

    try {
      let fromLoc = opts?.fromOverride ?? selectedFrom;
      let toLoc = opts?.toOverride ?? selectedTo;

      // ✅ resolve nếu chỉ có text
      if (!getLocationId(fromLoc)) {
        const resolved = await resolveLocationForText(fromQuery);
        if (resolved) {
          fromLoc = resolved;
          setSelectedFrom(resolved);
          setFromQuery(displayLocationLabel(resolved));
        }
      }

      if (!getLocationId(toLoc)) {
        const resolved = await resolveLocationForText(toQuery);
        if (resolved) {
          toLoc = resolved;
          setSelectedTo(resolved);
          setToQuery(displayLocationLabel(resolved));
        }
      }

      const fromId = getLocationId(fromLoc);
      const toId = getLocationId(toLoc);

      if (!fromId || !toId) {
        if (!opts?.silentWarning) {
          showMsg(
            "Vui lòng chọn điểm đi/điểm đến từ danh sách gợi ý",
            "warning",
          );
        }
        return;
      }

      const a = (fromLoc?.province || fromLoc?.name || "").trim();
      const b = (toLoc?.province || toLoc?.name || "").trim();
      if (a && b && a.toLowerCase() === b.toLowerCase()) {
        showMsg("Điểm đi và điểm đến không được giống nhau", "warning");
        return;
      }

      const dateRe = /^\d{4}-\d{2}-\d{2}$/;
      if (!formData.departureDate || !dateRe.test(formData.departureDate)) {
        showMsg("Ngày đi không hợp lệ (YYYY-MM-DD)", "warning");
        return;
      }

      const passengers = Number(formData.passengers);
      if (passengers < 1 || passengers > 10) {
        showMsg("Số hành khách phải từ 1-10 người", "warning");
        return;
      }

      console.log("🚀 CALL /trips/search", {
        fromLocationId: fromId,
        toLocationId: toId,
        date: formData.departureDate,
      });

      const res = await bookingService.searchTrips(
        {
          fromLocationId: fromId,
          toLocationId: toId,
          date: formData.departureDate,
          passengers,
        },
        { signal: abortRef.current.signal },
      );
      console.log("🧾 searchTrips raw res =", JSON.stringify(res, null, 2));

      const tripsRaw: any[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.trips)
          ? res.trips
          : [];
      console.log("🧾 tripsRaw[0] =", tripsRaw?.[0]);
      console.log(
        "🧾 keys tripsRaw[0] =",
        tripsRaw?.[0] ? Object.keys(tripsRaw[0]) : null,
      );
      console.log(
        "🧾 tripsRaw ids =",
        tripsRaw.map((t) => ({ _id: t?._id, id: t?.id, tripId: t?.tripId })),
      );

      const transformed = tripsRaw.filter(Boolean).map(mapTrip);
      setTrips(transformed);

      if (transformed.length === 0)
        showMsg("Không tìm thấy chuyến xe phù hợp", "info");
      else showMsg(`Tìm thấy ${transformed.length} chuyến phù hợp`, "success");

      const fromLabel = displayLocationLabel(fromLoc);
      const toLabel = displayLocationLabel(toLoc);
      if (fromLabel && toLabel) saveRecentSearch(fromLabel, toLabel);
    } catch (e: any) {
      if (e?.code === "ERR_CANCELED") return;
      const msg =
        e?.friendlyMessage ||
        e?.response?.data?.message ||
        e?.message ||
        "Không thể tìm kiếm chuyến xe. Vui lòng thử lại.";
      setError(msg);
      showMsg(msg, "error");
    } finally {
      setSearching(false);
      setRefreshing(false);
    }
  };

  const handleSearchTrips = () => fetchTrips();

  const onRefresh = async () => {
    if (searching) return;
    setRefreshing(true);
    await fetchTrips();
  };

  const safeNavigate = (routeName: string, params?: any) => {
    try {
      navigation?.navigate?.(routeName, params);
    } catch {
      showMsg("Không thể chuyển trang. Vui lòng thử lại.", "error");
    }
  };

  const enrichTrip = (trip: Trip) => ({
    ...trip,
    route: trip.route || {
      fromLocationId: { name: trip.from || "Điểm đi", province: "" },
      toLocationId: { name: trip.to || "Điểm đến", province: "" },
      stops: [],
    },
    companyId: trip.companyId ||
      (trip.company as any) || { name: "Nhà xe", _id: "default" },
    vehicleId: trip.vehicleId || {
      type: "Xe khách",
      totalSeats: 45,
      _id: "default",
    },
    seats: trip.seats || [],
    status: trip.status || "scheduled",
  });

  const handleTripSelect = (trip: Trip) =>
    safeNavigate("TripDetails", { trip: enrichTrip(trip) });

  const handleQuickBook = (trip: Trip) => {
    const t = enrichTrip(trip);
    const availableSeats =
      trip.seats?.filter((s: any) => s.status === "available") || [];
    const defaultSeats =
      availableSeats.length > 0 ? [availableSeats[0].seatNumber] : ["A1"];
    const totalAmount = defaultSeats.length * (t.price || 0);

    safeNavigate("BookingCheckout", {
      trip: t,
      selectedSeats: defaultSeats,
      totalAmount,
    });
  };

  if (initialLoading) {
    return (
      <AppScreen statusBarStyle="dark-content">
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen statusBarStyle="dark-content" style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.main}
          />
        }
      >
        {/* Header mini */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Tìm kiếm chuyến xe</Text>
          <View style={{ width: 40 }} />
        </View>

        {!!formMessage?.text && (
          <AppFormMessage
            message={formMessage.text}
            variant={formMessage.variant}
            onClose={() => setFormMessage(null)}
          />
        )}

        {/* Recent */}
        {recentSearches.length > 0 && (
          <View style={SEARCH_STYLES.recentSearchesSection}>
            <Text style={SEARCH_STYLES.recentSearchesTitle}>
              Tìm kiếm gần đây
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={SEARCH_STYLES.recentSearchesScroll}
            >
              {recentSearches.map((s, idx) => (
                <TouchableOpacity
                  key={`${s.from}-${s.to}-${idx}`}
                  style={SEARCH_STYLES.recentSearchChip}
                  onPress={() => {
                    setFormMessage(null);

                    setFromQuery(s.from);
                    setToQuery(s.to);

                    setSelectedFrom(null);
                    setSelectedTo(null);

                    setShowFromSuggestions(false);
                    setShowToSuggestions(false);
                    setTrips([]);
                  }}
                >
                  <Text style={SEARCH_STYLES.recentSearchText}>
                    {s.from} → {s.to}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Form */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Tìm kiếm chi tiết</Text>

          {/* From */}
          <View style={{ zIndex: 30 }}>
            <AppInput
              label="Điểm đi *"
              icon="location-outline"
              value={fromQuery}
              placeholder="Nhập tên thành phố / bến xe..."
              onChangeText={(t) => {
                setFormMessage(null);
                setFromQuery(t);
                setSelectedFrom(null);
                setShowFromSuggestions(true);
                setShowToSuggestions(false);
              }}
              onFocus={() => {
                setShowFromSuggestions(true);
                setShowToSuggestions(false);
              }}
            />

            {showFromSuggestions && (
              <View style={styles.suggestions}>
                {fromSuggestions.length > 0 ? (
                  fromSuggestions.map((loc, i) => (
                    <TouchableOpacity
                      key={`${String((loc as any)._id ?? "")}-${loc.name ?? ""}-${i}`}
                      style={styles.sItem}
                      onPress={() => handleSelectFrom(loc)}
                    >
                      <Ionicons
                        name={
                          (loc as any).type === "bus_station"
                            ? "bus-outline"
                            : "location-outline"
                        }
                        size={16}
                        color={COLORS.text.secondary}
                        style={{ marginRight: SPACING.sm }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sName}>{loc.name}</Text>
                        <Text style={styles.sSub}>{loc.province}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View
                    style={{
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                    }}
                  >
                    <Text style={{ color: COLORS.text.secondary }}>
                      Không có gợi ý. Hãy thử nhập từ khoá khác.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Swap */}
          <View style={styles.swapRow}>
            <TouchableOpacity style={styles.swapBtn} onPress={swapDirections}>
              <Ionicons
                name="swap-vertical"
                size={18}
                color={COLORS.primary.main}
              />
              <Text style={styles.swapText}>Đổi chiều</Text>
            </TouchableOpacity>
          </View>

          {/* To */}
          <View style={{ zIndex: 20 }}>
            <AppInput
              label="Điểm đến *"
              icon="flag-outline"
              value={toQuery}
              placeholder="Nhập tên thành phố / bến xe..."
              onChangeText={(t) => {
                setFormMessage(null);
                setToQuery(t);
                setSelectedTo(null);
                setShowToSuggestions(true);
                setShowFromSuggestions(false);
              }}
              onFocus={() => {
                setShowToSuggestions(true);
                setShowFromSuggestions(false);
              }}
            />

            {showToSuggestions && (
              <View style={styles.suggestions}>
                {toSuggestions.length > 0 ? (
                  toSuggestions.map((loc, i) => (
                    <TouchableOpacity
                      key={`${String((loc as any)._id ?? "")}-${loc.name ?? ""}-${i}`}
                      style={styles.sItem}
                      onPress={() => handleSelectTo(loc)}
                    >
                      <Ionicons
                        name={
                          (loc as any).type === "bus_station"
                            ? "bus-outline"
                            : "location-outline"
                        }
                        size={16}
                        color={COLORS.text.secondary}
                        style={{ marginRight: SPACING.sm }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sName}>{loc.name}</Text>
                        <Text style={styles.sSub}>{loc.province}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View
                    style={{
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                    }}
                  >
                    <Text style={{ color: COLORS.text.secondary }}>
                      Không có gợi ý. Hãy thử nhập từ khoá khác.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Date */}
          <View style={{ marginTop: SPACING.xs }}>
            <Text style={styles.label}>Ngày đi *</Text>
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <AppInput
                  value={formData.departureDate}
                  editable={false}
                  icon="calendar-outline"
                />
              </View>
              <TouchableOpacity
                style={styles.calendarBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={COLORS.primary.main}
                />
                <Text style={styles.calendarText}>Chọn</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dateObj || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    const yyyy = selectedDate.getFullYear();
                    const mm = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const dd = String(selectedDate.getDate()).padStart(2, "0");
                    setDateObj(selectedDate);
                    setFormData((p) => ({
                      ...p,
                      departureDate: `${yyyy}-${mm}-${dd}`,
                    }));
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Passengers */}
          <Text style={styles.label}>Số hành khách</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={formData.passengers}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, passengers: Number(v) }))
              }
              style={{ height: 52, color: COLORS.text.primary }}
              dropdownIconColor={COLORS.text.primary}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <Picker.Item key={n} label={`${n} người`} value={n} />
              ))}
            </Picker>
          </View>

          <View style={{ marginTop: SPACING.sm }}>
            <AppButton
              title={searching ? "Đang tìm..." : "Tìm kiếm chuyến xe"}
              onPress={handleSearchTrips}
              loading={searching || resolvingPreset}
              disabled={searching || resolvingPreset}
            />
          </View>
        </AppCard>

        {!!error && !searching && (
          <AppCard style={[styles.card, styles.errorCard]}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={COLORS.error.main}
            />
            <Text style={styles.errorText}>{error}</Text>
            <AppButton title="Thử lại" onPress={handleSearchTrips} />
          </AppCard>
        )}

        {trips.length > 0 && (
          <View style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>
              Kết quả ({trips.length} chuyến)
            </Text>

            {trips.map((trip, idx) => (
              <AppCard key={`${trip.uiId}-${idx}`} style={styles.tripCard}>
                <TouchableOpacity
                  onPress={() => handleTripSelect(trip)}
                  activeOpacity={0.9}
                >
                  <View style={styles.tripTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.company}>
                        {trip.company?.name || "Nhà xe"}
                      </Text>
                      <Text style={styles.route}>
                        {trip.from} → {trip.to}
                      </Text>

                      <Text style={styles.meta}>
                        Khởi hành: {formatTime(trip.departureTime)} • Đến:{" "}
                        {formatTime(trip.expectedArrivalTime)}
                      </Text>
                      <Text style={styles.meta}>
                        {formatDate(trip.departureTime)}
                      </Text>
                      <Text style={styles.meta}>
                        Ghế trống: {trip.availableSeats}
                      </Text>
                    </View>

                    <View style={styles.priceBox}>
                      <Text style={styles.price}>
                        {formatPrice(trip.price)}
                      </Text>
                      <Text style={styles.per}>/vé</Text>
                    </View>
                  </View>

                  <View style={styles.tripActions}>
                    <TouchableOpacity
                      style={styles.outlineBtn}
                      onPress={() => handleTripSelect(trip)}
                    >
                      <Text style={styles.outlineText}>Xem chi tiết</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => handleQuickBook(trip)}
                    >
                      <Text style={styles.primaryText}>Đặt vé</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={COLORS.primary.contrast}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </AppCard>
            ))}
          </View>
        )}

        {trips.length === 0 && !searching && !error && !formMessage && (
          <AppCard style={[styles.card, styles.emptyCard]}>
            <Ionicons
              name="search-outline"
              size={56}
              color={COLORS.text.secondary}
            />
            <Text style={styles.emptyText}>
              Nhập thông tin để tìm chuyến xe
            </Text>
          </AppCard>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background.secondary },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPaddingHorizontal,
    paddingTop: SPACING.sm,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: LAYOUT.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background.tertiary,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    ...(COMMON_SHADOWS.elevation1 ?? COMMON_SHADOWS.card),
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: (TYPOGRAPHY?.h3 as any)?.fontSize ?? 18,
    fontWeight: (TYPOGRAPHY?.h3 as any)?.fontWeight ?? "800",
    color: COLORS.text.primary,
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontWeight: "800",
    color: COLORS.text.primary,
  },

  card: { padding: LAYOUT.cardPadding, marginTop: SPACING.md },
  cardTitle: {
    fontSize: (TYPOGRAPHY?.h4 as any)?.fontSize ?? 16,
    fontWeight: (TYPOGRAPHY?.h4 as any)?.fontWeight ?? "800",
    textAlign: "center",
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: (TYPOGRAPHY?.h4 as any)?.fontSize ?? 16,
    fontWeight: (TYPOGRAPHY?.h4 as any)?.fontWeight ?? "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },

  label: {
    fontSize: (TYPOGRAPHY?.caption as any)?.fontSize ?? 12,
    fontWeight: "800",
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  swapRow: {
    alignItems: "center",
    marginTop: -SPACING.xs,
    marginBottom: SPACING.xs,
  },
  swapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.round,
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.primary.main, 0.18),
  },
  swapText: { fontWeight: "900", color: COLORS.primary.main },

  dateRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  calendarBtn: {
    height: 56,
    paddingHorizontal: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.primary.main, 0.18),
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  calendarText: { fontWeight: "900", color: COLORS.primary.main },

  pickerWrap: {
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    borderRadius: LAYOUT.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: COLORS.background.tertiary,
  },

  suggestions: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    borderRadius: LAYOUT.borderRadius.xl,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    paddingVertical: SPACING.xs,
    zIndex: 999,
    elevation: 10,
    ...(COMMON_SHADOWS.elevation2 ?? COMMON_SHADOWS.card),
  },
  sItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  sName: { fontWeight: "900", color: COLORS.text.primary },
  sSub: { marginTop: 2, fontSize: 12, color: COLORS.text.secondary },

  tripCard: { padding: LAYOUT.cardPadding, marginTop: SPACING.sm },
  tripTop: { flexDirection: "row", gap: SPACING.sm },
  company: { color: COLORS.text.secondary, fontWeight: "700" },
  route: {
    fontWeight: "900",
    fontSize: 16,
    marginTop: 2,
    color: COLORS.text.primary,
  },
  meta: { marginTop: 4, color: COLORS.text.secondary },

  priceBox: { alignItems: "flex-end", justifyContent: "center" },
  price: { fontSize: 16, fontWeight: "900", color: COLORS.primary.dark },
  per: { fontSize: 12, color: COLORS.text.secondary },

  tripActions: {
    marginTop: SPACING.sm,
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "flex-end",
  },
  outlineBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.lg,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary.main, 0.45),
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
  },
  outlineText: { fontWeight: "900", color: COLORS.primary.main },
  primaryBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.primary.main,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    ...(COMMON_SHADOWS.button ?? COMMON_SHADOWS.elevation2 ?? {}),
  },
  primaryText: { color: COLORS.primary.contrast, fontWeight: "900" },

  emptyCard: { alignItems: "center", paddingVertical: SPACING.xl },
  emptyText: {
    marginTop: SPACING.sm,
    fontWeight: "800",
    color: COLORS.text.secondary,
    textAlign: "center",
  },

  errorCard: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
    backgroundColor: withOpacity(COLORS.error.main, 0.08),
    borderColor: withOpacity(COLORS.error.main, 0.25),
    borderWidth: 1,
  },
  errorText: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    fontWeight: "800",
    color: COLORS.error.dark,
    textAlign: "center",
  },
});
