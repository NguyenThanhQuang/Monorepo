import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import AppScreen from "@/components/layout/AppScreen";
import AppCard from "@/components/ui/AppCard";
import SectionHeader from "@/components/ui/SectionHeader";
import AppInput from "@/components/ui/AppInput";
import AppFormMessage from "@/components/ui/AppFormMessage";
import AppButton from "@/components/ui/AppButton";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import IconCircle from "@/components/ui/IconCircle";
import Stagger from "@/components/ui/Stagger";

import { driveService, DriveFile } from "../../services/user/driveService";
import { COLORS, SPACING, TYPOGRAPHY, withOpacity, LAYOUT } from "../../theme";

const prettySize = (bytes?: number) => {
  const b = Number(bytes || 0);
  if (!b) return "";
  const units = ["B", "KB", "MB", "GB"];
  let x = b;
  let i = 0;
  while (x >= 1024 && i < units.length - 1) {
    x /= 1024;
    i++;
  }
  const v = i === 0 ? `${Math.round(x)}` : `${x.toFixed(1)}`;
  return `${v} ${units[i]}`;
};

export default function DriveScreen() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorText, setErrorText] = useState<string>("");

  const [q, setQ] = useState("");

  const load = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setErrorText("");

      const res = await driveService.listFiles();
      setFiles(res || []);
    } catch (e) {
      console.error(e);
      setErrorText("Không tải được danh sách file.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);
  }, []);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return files;
    return files.filter((f) => (f.name || "").toLowerCase().includes(key));
  }, [files, q]);

  const handlePickAndUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if ((res as any).type !== "success") return;

      setUploading(true);

      const success = res as any;
      const uri: string = success.uri;
      const name: string = success.name || uri.split("/").pop() || `file_${Date.now()}`;
      const mimeType: string | undefined = success.mimeType || success.mime || undefined;

      await driveService.uploadFile(uri, name, mimeType);
      Alert.alert("Thành công", "Tải lên thành công.");
      await load(false);
    } catch (e) {
      console.error("Upload error", e);
      Alert.alert("Lỗi", "Tải lên thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa tệp này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await driveService.deleteFile(fileId);
            await load(false);
          } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Không thể xóa tệp.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const openFile = async (file: DriveFile) => {
    if (file.url) {
      Linking.openURL(file.url).catch(() => Alert.alert("Lỗi", "Không thể mở tệp."));
    } else {
      Alert.alert("Thông báo", "Tệp chưa có URL trực tiếp.");
    }
  };

  const Header = () => (
    <View style={{ padding: SPACING.lg }}>
      <SectionHeader title="My Drive" subtitle="Tải lên & quản lý tệp" onRefresh={() => load(true)} />

      {!!errorText && (
        <AppFormMessage
          variant="error"
          message={errorText}
          onClose={() => setErrorText("")}
        />
      )}

      <AppCard style={styles.uploadCard}>
        <View style={styles.uploadRow}>
          <IconCircle size={46} bg={withOpacity(COLORS.primary.light, 0.14)}>
            <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary.main} />
          </IconCircle>

          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>Tải tệp lên</Text>
            <Text style={styles.uploadSub}>Hỗ trợ mọi định dạng • Nhấn để chọn file</Text>
          </View>
        </View>

        <AppButton
          title={uploading ? "Đang tải..." : "Chọn & tải lên"}
          onPress={handlePickAndUpload}
          loading={uploading}
          disabled={uploading}
        />
      </AppCard>

      <AppInput
        icon="search"
        value={q}
        onChangeText={setQ}
        placeholder="Tìm theo tên tệp..."
        autoCorrect={false}
      />

      <Text style={styles.countText}>
        {filtered.length} tệp
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: DriveFile }) => {
    const sizeText = prettySize(item.size);
    const timeText = item.uploadedAt ? new Date(item.uploadedAt).toLocaleString("vi-VN") : "";

    return (
      <AnimatedPressable style={{ marginBottom: SPACING.md }} scaleTo={0.988} onPress={() => openFile(item)}>
        <AppCard style={styles.fileCard}>
          <View style={styles.fileRow}>
            <IconCircle size={44} bg={withOpacity(COLORS.info.main, 0.10)}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.info.main} />
            </IconCircle>

            <View style={{ flex: 1 }}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.fileSub} numberOfLines={1}>
                {[sizeText, timeText].filter(Boolean).join(" • ")}
              </Text>
            </View>

            <View style={styles.actions}>
              <AnimatedPressable
                style={[styles.iconBtn, { backgroundColor: withOpacity(COLORS.primary.light, 0.14) }]}
                onPress={() => openFile(item)}
                hitSlop={10}
              >
                <Ionicons name="open-outline" size={18} color={COLORS.primary.main} />
              </AnimatedPressable>

              <AnimatedPressable
                style={[styles.iconBtn, { backgroundColor: withOpacity(COLORS.error.main, 0.10) }]}
                onPress={() => handleDelete(item.id)}
                hitSlop={10}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.error.main} />
              </AnimatedPressable>
            </View>
          </View>
        </AppCard>
      </AnimatedPressable>
    );
  };

  const Empty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <IconCircle size={62} bg={withOpacity(COLORS.primary.light, 0.14)}>
          <Ionicons name="folder-open-outline" size={26} color={COLORS.primary.main} />
        </IconCircle>
        <Text style={styles.emptyTitle}>Chưa có tệp nào</Text>
        <Text style={styles.emptySub}>Hãy tải lên tệp đầu tiên của bạn.</Text>
      </View>
    );
  };

  return (
    <AppScreen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id || item.name}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListEmptyComponent={Empty}
        contentContainerStyle={{ paddingBottom: SPACING["2xl"] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  uploadCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  uploadTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  uploadSub: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },

  countText: {
    marginTop: SPACING.xs,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.8),
  },

  fileCard: {
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  fileName: {
    ...TYPOGRAPHY.body2,
    fontWeight: "900",
    color: COLORS.text.primary,
  },
  fileSub: {
    marginTop: 4,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border.light, 0.8),
  },

  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    ...TYPOGRAPHY.h4,
    fontWeight: "900",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  emptySub: {
    marginTop: 6,
    ...TYPOGRAPHY.body3,
    fontWeight: "700",
    color: withOpacity(COLORS.text.secondary, 0.92),
    textAlign: "center",
  },
});