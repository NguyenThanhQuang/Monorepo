import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { SearchFormProps, Location } from "../../types/index-types";
import LocationPicker from "./LocationPicker";
import { searchLocations } from "../../services/user/locationService";

// ✅ theme
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, COMMON_SHADOWS, withOpacity } from "@/theme";

const SearchForm: React.FC<SearchFormProps> = ({ formData, onFormChange, onSubmit, loading = false }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState<Date>(new Date());

  const [selectedFrom, setSelectedFrom] = useState<Location | null>(null);
  const [selectedTo, setSelectedTo] = useState<Location | null>(null);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);

  // simple debounce (avoid spamming /locations/search)
  const [fromTimer, setFromTimer] = useState<NodeJS.Timeout | null>(null);
  const [toTimer, setToTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // init local query from formData
    setFromQuery(formData.from || "");
    setToQuery(formData.to || "");
  }, [formData.from, formData.to]);

  const handleInputChange = (field: string, value: any) => {
    onFormChange(field, value);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (!selectedDate) return;

    setDateObj(selectedDate);
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    handleInputChange("departureDate", `${yyyy}-${mm}-${dd}`);
  };

  const handleFromQueryChange = async (query: string) => {
    setFromQuery(query);
    // keep formData in sync even if user doesn't pick suggestion
    handleInputChange("from", query);
    // if user edits text after selecting, clear exact id
    if (selectedFrom) {
      setSelectedFrom(null);
      handleInputChange("fromLocationId", "");
    }
    if (query.length >= 2) {
      try {
        if (fromTimer) clearTimeout(fromTimer);
        const t = setTimeout(async () => {
          const results = await searchLocations(query);
          setFromSuggestions(Array.isArray(results) ? (results as any) : []);
          setShowFromSuggestions(true);
        }, 250);
        setFromTimer(t);
      } catch {
        setFromSuggestions([]);
      }
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  const handleToQueryChange = async (query: string) => {
    setToQuery(query);
    handleInputChange("to", query);
    if (selectedTo) {
      setSelectedTo(null);
      handleInputChange("toLocationId", "");
    }
    if (query.length >= 2) {
      try {
        if (toTimer) clearTimeout(toTimer);
        const t = setTimeout(async () => {
          const results = await searchLocations(query);
          setToSuggestions(Array.isArray(results) ? (results as any) : []);
          setShowToSuggestions(true);
        }, 250);
        setToTimer(t);
      } catch {
        setToSuggestions([]);
      }
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  const handleFromLocationSelect = (location: Location) => {
    setSelectedFrom(location);
    // store label + id (mobile will call backend by exact locationId)
    handleInputChange("from", location.name);
    handleInputChange("fromLocationId", location._id);
    setFromQuery(location.name);
    setShowFromSuggestions(false);
  };

  const handleToLocationSelect = (location: Location) => {
    setSelectedTo(location);
    handleInputChange("to", location.name);
    handleInputChange("toLocationId", location._id);
    setToQuery(location.name);
    setShowToSuggestions(false);
  };

  const validateForm = () => {
    // ✅ Nếu user không chọn suggestion (ví dụ dùng Recent Search), vẫn cho submit bằng text
    if (!selectedFrom && !formData.from)
      return Alert.alert("Lỗi", "Vui lòng chọn điểm đi"), false;
    if (!selectedTo && !formData.to)
      return Alert.alert("Lỗi", "Vui lòng chọn điểm đến"), false;

    const fromKey = (selectedFrom?.province || selectedFrom?.name || formData.from || "").trim();
    const toKey = (selectedTo?.province || selectedTo?.name || formData.to || "").trim();

    if (fromKey && toKey && fromKey === toKey) {
      return Alert.alert("Lỗi", "Điểm đi và điểm đến không được giống nhau"), false;
    }

    if (!formData.departureDate) return Alert.alert("Lỗi", "Vui lòng chọn ngày đi"), false;

    const passengers = Number(formData.passengers);
    if (passengers < 1 || passengers > 10) return Alert.alert("Lỗi", "Số hành khách phải từ 1-10 người"), false;

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) onSubmit();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm chi tiết</Text>

      {/* From */}
      <View style={[styles.block, { zIndex: 30 }]}>
        <View style={styles.labelRow}>
          <Ionicons name="location-outline" size={18} color={COLORS.text.secondary} />
          <Text style={styles.label}>Điểm đi</Text>
        </View>

        <LocationPicker
          value={fromQuery}
          placeholder="Chọn điểm đi"
          onLocationSelect={handleFromLocationSelect}
          suggestions={fromSuggestions}
          showSuggestions={showFromSuggestions}
          onQueryChange={handleFromQueryChange}
          onFocus={() => setShowFromSuggestions(true)}
          onBlur={() => setShowFromSuggestions(false)}
        />
      </View>

      {/* To */}
      <View style={[styles.block, { zIndex: 20 }]}>
        <View style={styles.labelRow}>
          <Ionicons name="flag-outline" size={18} color={COLORS.text.secondary} />
          <Text style={styles.label}>Điểm đến</Text>
        </View>

        <LocationPicker
          value={toQuery}
          placeholder="Chọn điểm đến"
          onLocationSelect={handleToLocationSelect}
          suggestions={toSuggestions}
          showSuggestions={showToSuggestions}
          onQueryChange={handleToQueryChange}
          onFocus={() => setShowToSuggestions(true)}
          onBlur={() => setShowToSuggestions(false)}
        />
      </View>

      {/* Date + Passengers */}
      <View style={styles.row}>
        <View style={[styles.half, { zIndex: 10 }]}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.label}>Ngày đi</Text>
          </View>

          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
            <Text style={styles.dateText}>{formData.departureDate || "Chọn ngày"}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.half, { zIndex: 10 }]}>
          <View style={styles.labelRow}>
            <Ionicons name="people-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.label}>Số khách</Text>
          </View>

          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={String(formData.passengers)}
              onValueChange={(v) => handleInputChange("passengers", v)}
              style={{ height: 52, color: COLORS.text.primary }}
              dropdownIconColor={COLORS.text.primary}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Picker.Item key={num} label={`${num}`} value={String(num)} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <Text style={styles.searchButtonText}>Đang tìm...</Text>
        ) : (
          <>
            <Ionicons name="search" size={18} color={COLORS.primary.contrast} />
            <Text style={styles.searchButtonText}>Tìm chuyến đi</Text>
          </>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
          // ✅ Prod: chặn ngày quá khứ. Dev (Expo Go): cho chọn để test seed data.
          minimumDate={__DEV__ ? undefined : new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    padding: LAYOUT.cardPadding,
    borderRadius: LAYOUT.borderRadius.xl,
    margin: LAYOUT.screenPaddingHorizontal,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    ...(COMMON_SHADOWS.elevation1 ?? COMMON_SHADOWS.card),
  },

  title: {
    fontSize: TYPOGRAPHY.h4?.fontSize ?? 16,
    fontWeight: TYPOGRAPHY.h4?.fontWeight ?? "800",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },

  block: { marginBottom: SPACING.md },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.body3?.fontSize ?? 13,
    fontWeight: "900",
    color: COLORS.text.secondary,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  half: { flex: 1 },

  dateInput: {
    height: 56,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    borderRadius: LAYOUT.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.tertiary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: TYPOGRAPHY.body2?.fontSize ?? 16,
    fontWeight: "800",
    color: COLORS.text.primary,
  },

  pickerWrap: {
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    borderRadius: LAYOUT.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: COLORS.background.tertiary,
  },

  searchButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary.main,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    ...(COMMON_SHADOWS.button ?? COMMON_SHADOWS.elevation2 ?? {}),
  },
  searchButtonDisabled: {
    backgroundColor: withOpacity(COLORS.primary.main, 0.5),
  },
  searchButtonText: {
    color: COLORS.primary.contrast,
    fontSize: TYPOGRAPHY.body2?.fontSize ?? 16,
    fontWeight: "900",
  },
});

export default SearchForm;
