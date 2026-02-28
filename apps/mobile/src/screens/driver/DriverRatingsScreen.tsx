import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import AppFormMessage from "@/components/ui/AppFormMessage";

import { reviewService } from "@/services/user/reviewService";
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT, ICONS, withOpacity } from "@/theme";

type Props = any;

const StarRow = ({ value }: { value: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    {Array.from({ length: 5 }).map((_, i) => {
      const v = i + 1;
      const active = v <= value;
      return (
        <Ionicons
          key={v}
          name={active ? "star" : "star-outline"}
          size={16}
          color={active ? COLORS.warning.main : withOpacity(COLORS.text.secondary, 0.7)}
          style={{ marginRight: 2 }}
        />
      );
    })}
  </View>
);

export default function DriverRatingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const res = await reviewService.getMyDriverReviews({ limit: 50, skip: 0 });
      setStats(res?.stats ?? null);
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.friendlyMessage ||
        e?.message ||
        "Không tải được đánh giá.";
      setError(msg);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const avgText = useMemo(() => {
    const v = Number(stats?.avgRating ?? 0);
    return v ? v.toFixed(1) : "0.0";
  }, [stats?.avgRating]);

  const count = Number(stats?.count ?? 0);

  return (
    <AppScreen statusBarStyle="dark-content">
      <View style={styles.header}>
        <Pressable onPress={() => (navigation as any).goBack()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name={ICONS.arrowBack as any} size={22} color={COLORS.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
        <View style={{ width: LAYOUT.headerIconSize }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it: any) => String(it?._id ?? Math.random())}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListHeaderComponent={
          <>
            {!!error && <AppFormMessage variant="error" message={error} />}

            <AppCard style={styles.card}>
              <Text style={styles.sectionTitle}>Tổng quan</Text>
              <View style={{ height: SPACING.sm }} />
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Điểm trung bình</Text>
                <Text style={styles.kvValue}>{avgText}/5</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Số lượt đánh giá</Text>
                <Text style={styles.kvValue}>{count}</Text>
              </View>
            </AppCard>

            <Text style={[styles.sectionTitle, { marginBottom: SPACING.sm }]}>Nhận xét</Text>
          </>
        }
        renderItem={({ item }: any) => {
          return (
            <AppCard style={styles.reviewCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.reviewer}>{item?.displayName || "Ẩn danh"}</Text>
                <StarRow value={Number(item?.rating ?? 0)} />
              </View>
              {!!item?.comment && <Text style={styles.comment}>{String(item.comment)}</Text>}
              <Text style={styles.time}>
                {item?.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
              </Text>
            </AppCard>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <Text style={{ color: COLORS.text.secondary, textAlign: "center", marginTop: 24 }}>
              Đang tải...
            </Text>
          ) : (
            <Text style={{ color: COLORS.text.secondary, textAlign: "center", marginTop: 24 }}>
              Chưa có đánh giá nào.
            </Text>
          )
        }
      />
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
    width: LAYOUT.headerIconSize,
    height: LAYOUT.headerIconSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.neutral.white, 0.9),
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text.primary },

  card: { padding: SPACING.md, borderRadius: 18, marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.h3.fontSize, fontWeight: "900", color: COLORS.text.primary },

  kvRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(COLORS.border.light, 0.7),
  },
  kvLabel: { color: COLORS.text.secondary, fontWeight: "700" },
  kvValue: { color: COLORS.text.primary, fontWeight: "900" },

  reviewCard: { padding: SPACING.md, borderRadius: 18, marginBottom: SPACING.sm },
  reviewer: { fontWeight: "900", color: COLORS.text.primary },
  comment: { marginTop: 8, color: COLORS.text.primary, fontWeight: "600", lineHeight: 20 },
  time: { marginTop: 8, color: COLORS.text.secondary, fontWeight: "600", fontSize: 12 },
});
