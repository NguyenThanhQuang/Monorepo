import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Location, LocationPickerProps } from "../../types/index-types";

// ✅ theme
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, COMMON_SHADOWS, withOpacity } from "@/theme";

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  placeholder,
  onLocationSelect,
  suggestions,
  showSuggestions,
  onQueryChange,
  onFocus,
  onBlur,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const hasSuggestions = useMemo(
    () => showSuggestions && Array.isArray(suggestions) && suggestions.length > 0,
    [showSuggestions, suggestions]
  );

  const handleInputChange = (text: string) => {
    setInputValue(text);
    onQueryChange(text);
  };

  const handleSelect = (location: Location) => {
    // hiển thị label đẹp hơn: "name, province" (tránh trùng)
    const name = (location?.name || "").trim();
    const prov = (location?.province || "").trim();
    const label =
      name && prov && name.toLowerCase() !== prov.toLowerCase()
        ? `${name}, ${prov}`
        : name || prov;

    setInputValue(label || name);
    onLocationSelect(location);
    Keyboard.dismiss();
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    const isStation = item.type === "bus_station";
    return (
      <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)} activeOpacity={0.85}>
        <View style={styles.locationInfo}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={isStation ? "bus-outline" : "location-outline"}
              size={18}
              color={isStation ? COLORS.primary.main : COLORS.secondary.main}
            />
          </View>

          <View style={styles.locationText}>
            <Text style={styles.locationName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.locationProvince} numberOfLines={1}>
              {item.province}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        placeholderTextColor={withOpacity(COLORS.text.secondary, 0.9)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />

      {hasSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item._id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: "relative", zIndex: 1 },

  input: {
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    borderRadius: LAYOUT.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    height: 56,
    fontSize: TYPOGRAPHY.body2?.fontSize ?? 16,
    backgroundColor: COLORS.background.tertiary,
    color: COLORS.text.primary,
  },

  suggestionsContainer: {
    position: "absolute",
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    borderRadius: LAYOUT.borderRadius.xl,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    maxHeight: 240,
    zIndex: 1000,
    elevation: 10,
    ...(COMMON_SHADOWS.elevation2 ?? COMMON_SHADOWS.card),
  },

  suggestionsList: { maxHeight: 240 },

  suggestionItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(COLORS.border.light, 0.7),
  },

  locationInfo: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
    marginRight: SPACING.sm,
  },

  locationText: { flex: 1 },
  locationName: {
    fontSize: TYPOGRAPHY.body2?.fontSize ?? 16,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  locationProvince: {
    marginTop: 2,
    fontSize: TYPOGRAPHY.body3?.fontSize ?? 13,
    color: COLORS.text.secondary,
    fontWeight: "700",
  },
});

export default LocationPicker;
