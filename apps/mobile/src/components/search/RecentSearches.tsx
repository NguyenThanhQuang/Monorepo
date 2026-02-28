import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ theme
import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, COMMON_SHADOWS, withOpacity } from "@/theme";

interface RecentSearch {
  from: string;
  to: string;
  timestamp: number;
}

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchSelect: (from: string, to: string) => void;
  onClearAll: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ searches, onSearchSelect, onClearAll }) => {
  if (!searches || searches.length === 0) return null;

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={18} color={COLORS.text.secondary} />
          <Text style={styles.title}>Tìm kiếm gần đây</Text>
        </View>

        <TouchableOpacity onPress={onClearAll} style={styles.clearBtn} activeOpacity={0.85}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {searches.map((s, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() => onSearchSelect(s.from, s.to)}
            activeOpacity={0.9}
          >
            <View style={styles.route}>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={14} color={COLORS.secondary.main} />
                <Text style={styles.locText} numberOfLines={1}>
                  {s.from}
                </Text>
              </View>

              <View style={styles.row}>
                <Ionicons name="flag-outline" size={14} color={COLORS.error.main} />
                <Text style={styles.locText} numberOfLines={1}>
                  {s.to}
                </Text>
              </View>
            </View>

            <Text style={styles.time}>{formatTimeAgo(s.timestamp)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: LAYOUT.screenPaddingHorizontal, marginBottom: SPACING.md },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  title: {
    fontSize: TYPOGRAPHY.body2?.fontSize ?? 16,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  clearBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.round,
    backgroundColor: withOpacity(COLORS.primary.main, 0.08),
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.primary.main, 0.18),
  },
  clearText: {
    fontSize: TYPOGRAPHY.body3?.fontSize ?? 13,
    fontWeight: "900",
    color: COLORS.primary.main,
  },

  scrollContent: { paddingRight: LAYOUT.screenPaddingHorizontal },

  item: {
    minWidth: 160,
    backgroundColor: COLORS.background.primary,
    borderRadius: LAYOUT.borderRadius.xl,
    borderWidth: LAYOUT.borderWidth.light,
    borderColor: withOpacity(COLORS.border.light, 0.95),
    padding: SPACING.md,
    marginRight: SPACING.sm,
    ...(COMMON_SHADOWS.elevation1 ?? COMMON_SHADOWS.card),
  },

  route: { gap: SPACING.xs },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  locText: { flex: 1, fontWeight: "800", color: COLORS.text.primary },

  time: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.caption?.fontSize ?? 12,
    fontWeight: "700",
    color: COLORS.text.secondary,
    textAlign: "right",
  },
});

export default RecentSearches;
