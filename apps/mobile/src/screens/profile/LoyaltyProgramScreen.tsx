import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import IconCircle from "@/components/ui/IconCircle";
import Stagger from "@/components/ui/Stagger";
import AppButton from "@/components/ui/AppButton";

import { COLORS, SPACING, LAYOUT, TYPOGRAPHY, withOpacity } from "../../theme";

type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

interface UserPoints {
  current: number;
  total: number;
  nextTierPoints: number;
  tier: Tier;
}

interface Voucher {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: "percentage" | "fixed";
  pointsCost: number;
  validUntil: string;
  minOrderAmount: number;
  maxDiscount?: number;
  category: "discount" | "upgrade" | "service";
  available: number;
  used?: boolean;
}

interface PointHistory {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  date: string;
  tripId?: string;
}

const tierMeta = (tier: Tier) => {
  switch (tier) {
    case "Bronze":
      return { label: "Bronze", colors: ["#B45309", "#7C2D12"], icon: "medal" as const };
    case "Silver":
      return { label: "Silver", colors: ["#64748B", "#0F172A"], icon: "medal" as const };
    case "Gold":
      return { label: "Gold", colors: ["#F59E0B", "#92400E"], icon: "medal" as const };
    case "Platinum":
      return { label: "Platinum", colors: ["#0EA5E9", "#1D4ED8"], icon: "diamond" as const };
    default:
      return { label: tier, colors: [COLORS.primary.main, COLORS.primary.dark], icon: "star" as const };
  }
};

const nextTierLabel = (tier: Tier) => {
  if (tier === "Bronze") return "Silver";
  if (tier === "Silver") return "Gold";
  if (tier === "Gold") return "Platinum";
  return "Platinum";
};

export default function LoyaltyProgramScreen() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const userPoints: UserPoints = {
    current: 2450,
    total: 8750,
    nextTierPoints: 10000,
    tier: "Silver",
  };

  const availableVouchers: Voucher[] = [
    {
      id: "v1",
      title: "Giảm 15% tổng giá trị",
      description: "Áp dụng cho tất cả tuyến đường",
      discount: 15,
      discountType: "percentage",
      pointsCost: 500,
      validUntil: "2024-02-28",
      minOrderAmount: 200000,
      maxDiscount: 50000,
      category: "discount",
      available: 100,
    },
    {
      id: "v2",
      title: "Miễn phí nâng cấp ghế VIP",
      description: "Nâng cấp từ ghế thường lên ghế VIP miễn phí",
      discount: 100,
      discountType: "fixed",
      pointsCost: 800,
      validUntil: "2024-03-15",
      minOrderAmount: 0,
      category: "upgrade",
      available: 50,
    },
    {
      id: "v3",
      title: "Giảm 20% cho chuyến xe đầu tiên",
      description: "Áp dụng cho người dùng mới",
      discount: 20,
      discountType: "percentage",
      pointsCost: 300,
      validUntil: "2024-04-01",
      minOrderAmount: 100000,
      maxDiscount: 100000,
      category: "discount",
      available: 200,
    },
  ];

  const pointHistory: PointHistory[] = [
    { id: "1", type: "earn", amount: 150, description: "Đặt vé Hà Nội - TP.HCM", date: "2024-01-15", tripId: "trip1" },
    { id: "2", type: "spend", amount: -500, description: "Đổi voucher giảm 15%", date: "2024-01-10" },
    { id: "3", type: "earn", amount: 200, description: "Đặt vé TP.HCM - Đà Nẵng", date: "2024-01-08", tripId: "trip2" },
  ];

  const meta = useMemo(() => tierMeta(userPoints.tier), [userPoints.tier]);

  const progress = useMemo(() => {
    const p = userPoints.nextTierPoints ? userPoints.current / userPoints.nextTierPoints : 0;
    return Math.max(0, Math.min(1, p));
  }, [userPoints.current, userPoints.nextTierPoints]);

  const remaining = useMemo(
    () => Math.max(0, userPoints.nextTierPoints - userPoints.current),
    [userPoints.nextTierPoints, userPoints.current],
  );

  const handleRedeemVoucher = (voucher: Voucher) => {
    if (userPoints.current < voucher.pointsCost) {
      Alert.alert("Không đủ điểm", "Bạn cần có đủ điểm để đổi voucher này");
      return;
    }

    Alert.alert(
      "Xác nhận đổi voucher",
      `Bạn có muốn đổi ${voucher.pointsCost} điểm để lấy voucher "${voucher.title}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => Alert.alert("Thành công", `Bạn đã đổi thành công voucher "${voucher.title}"`) },
      ],
    );
  };

  return (
    <AppScreen statusBarStyle="light-content">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <SectionHeader
          title="Khách hàng thân thiết"
          subtitle="Tích điểm và đổi ưu đãi"
        />

        {/* Points card */}
        <LinearGradient colors={meta.colors as any} style={styles.pointsCard}>
          <View style={styles.pointsTop}>
            <IconCircle size={54} bg={"rgba(255,255,255,0.18)"}>
              <Ionicons name={meta.icon as any} size={22} color="#fff" />
            </IconCircle>

            <View style={{ flex: 1 }}>
              <Text style={styles.tierText}>{meta.label}</Text>
              <Text style={styles.pointsText}>{userPoints.current.toLocaleString()} điểm</Text>
            </View>

            <View style={styles.livePill}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.liveText}>Rewards</Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Còn {remaining.toLocaleString()} điểm để lên {nextTierLabel(userPoints.tier)}
            </Text>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { k: 0 as const, label: "Voucher", icon: "gift-outline" as const },
            { k: 1 as const, label: "Lịch sử", icon: "time-outline" as const },
          ].map((t) => {
            const active = activeTab === t.k;
            return (
              <AnimatedPressable
                key={t.k}
                onPress={() => setActiveTab(t.k)}
                style={[styles.tab, active && styles.tabActive]}
                scaleTo={0.985}
              >
                <Ionicons
                  name={t.icon}
                  size={16}
                  color={active ? COLORS.text.inverse : withOpacity(COLORS.text.secondary, 0.9)}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>

        {activeTab === 0 ? (
          <View style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>Voucher có sẵn</Text>

            <Stagger baseDelay={50} step={70}>
              {availableVouchers.map((v) => {
                const canRedeem = userPoints.current >= v.pointsCost;

                return (
                  <AppCard key={v.id} style={styles.voucherCard}>
                    <View style={styles.voucherTop}>
                      <IconCircle size={44} bg={withOpacity(COLORS.primary.light, 0.14)}>
                        <Ionicons name="gift-outline" size={20} color={COLORS.primary.main} />
                      </IconCircle>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.voucherTitle}>{v.title}</Text>
                        <Text style={styles.voucherDesc}>{v.description}</Text>
                        <Text style={styles.voucherValid}>HSD: {v.validUntil}</Text>
                      </View>
                    </View>

                    <View style={styles.voucherInfoRow}>
                      <Text style={styles.infoLabel}>Giảm:</Text>
                      <Text style={styles.infoValue}>
                        {v.discountType === "percentage" ? `${v.discount}%` : `${v.discount.toLocaleString()}đ`}
                      </Text>
                    </View>

                    <View style={styles.voucherInfoRow}>
                      <Text style={styles.infoLabel}>Điểm cần:</Text>
                      <Text style={styles.infoValue}>{v.pointsCost} điểm</Text>
                    </View>

                    <View style={styles.voucherInfoRow}>
                      <Text style={styles.infoLabel}>Tối thiểu:</Text>
                      <Text style={styles.infoValue}>{v.minOrderAmount.toLocaleString()}đ</Text>
                    </View>

                    <View style={{ marginTop: SPACING.sm }}>
                      <AppButton
                        title={canRedeem ? "Đổi voucher" : "Không đủ điểm"}
                        onPress={() => handleRedeemVoucher(v)}
                        disabled={!canRedeem}
                      />
                    </View>
                  </AppCard>
                );
              })}
            </Stagger>
          </View>
        ) : (
          <View style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>Lịch sử điểm</Text>

            <Stagger baseDelay={50} step={70}>
              {pointHistory.map((h) => {
                const isEarn = h.type === "earn";
                const c = isEarn ? COLORS.success.main : COLORS.error.main;

                return (
                  <AppCard key={h.id} style={styles.historyCard}>
                    <View style={styles.historyRow}>
                      <IconCircle size={40} bg={withOpacity(c, 0.12)}>
                        <Ionicons
                          name={isEarn ? "add-circle-outline" : "remove-circle-outline"}
                          size={18}
                          color={c}
                        />
                      </IconCircle>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyDesc}>{h.description}</Text>
                        <Text style={styles.historyDate}>{h.date}</Text>
                      </View>

                      <Text style={[styles.historyAmount, { color: c }]}>
                        {isEarn ? "+" : ""}
                        {h.amount} điểm
                      </Text>
                    </View>
                  </AppCard>
                );
              })}
            </Stagger>
          </View>
        )}
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

  pointsCard: {
    borderRadius: LAYOUT.borderRadius.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  pointsTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  tierText: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: "#fff",
    opacity: 0.95,
  },
  pointsText: {
    marginTop: 4,
    ...TYPOGRAPHY.h3,
    fontWeight: "900",
    color: "#fff",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  liveText: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    color: "#fff",
  },

  progressWrap: {
    marginTop: SPACING.lg,
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  progressText: {
    marginTop: 10,
    ...TYPOGRAPHY.body3,
    fontWeight: "800",
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
  },

  tabs: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: LAYOUT.borderRadius.lg,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.9),
    backgroundColor: withOpacity(COLORS.background.secondary, 0.9),
  },
  tabActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: withOpacity(COLORS.primary.dark, 0.45),
  },
  tabText: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  tabTextActive: {
    color: COLORS.text.inverse,
  },

  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },

  voucherCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  voucherTop: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  voucherTitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  voucherDesc: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  voucherValid: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.78),
  },

  voucherInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoLabel: {
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  infoValue: {
    ...TYPOGRAPHY.body3,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  historyCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  historyDesc: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  historyDate: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.86),
  },
  historyAmount: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
  },
});