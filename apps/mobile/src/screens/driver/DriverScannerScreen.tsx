// mobile-app/src/screens/driver/DriverScannerScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as CameraModule from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import apiService from "../../services/common/apiService";

type TicketInfo = {
  id: string;
  bookingId?: string;
  passengerName?: string;
  seat?: string;
  tripId?: string;
  status?: string;
  extras?: any;
};

type ValidateResponse = {
  ticket?: TicketInfo;
  message?: string;
  ok?: boolean;
};

// Try to get the official hook; fallback if it's nested on default
const useCameraPermissionsHook =
  (CameraModule as any).useCameraPermissions ||
  (CameraModule as any).default?.useCameraPermissions;

// Resolve runtime camera component:
// prefer CameraView, then Camera, then default export
const cameraCandidate =
  (CameraModule as any).CameraView ||
  (CameraModule as any).Camera ||
  (CameraModule as any).default ||
  null;

// If candidate is an object with `.default`, prefer that (common interop)
const getRuntimeCamera = (c: any) => {
  if (!c) return null;
  if (typeof c === "function") return c;
  if (c && typeof c === "object" && typeof c.default === "function") return c.default;
  return c;
};

export default function DriverScannerScreen({ navigation }: any) {
  const permsHook = useCameraPermissionsHook as any;

  const [cameraPermission, requestCameraPermission] = permsHook
    ? permsHook()
    : ([
        undefined,
        async () => {
          if ((CameraModule as any).requestCameraPermissionsAsync) {
            try {
              return await (CameraModule as any).requestCameraPermissionsAsync();
            } catch {
              return undefined;
            }
          }
          return undefined;
        },
      ] as any);

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);

  const CameraRuntime = getRuntimeCamera(cameraCandidate) as any;

  useEffect(() => {
    (async () => {
      try {
        if (!cameraPermission?.granted && requestCameraPermission) {
          await requestCameraPermission();
        }
      } catch (e) {
        console.warn("Camera permission request failed", e);
      }
    })();
  }, [cameraPermission?.granted, requestCameraPermission]);

  const permissionGranted = cameraPermission?.granted ?? false;
  const permissionUndetermined = cameraPermission == null;

  const resetScanner = () => {
    setScanned(false);
    setTicket(null);
    setLoading(false);
  };

  const handleValidateTicket = useCallback(async (ticketId: string) => {
    try {
      setLoading(true);

      const res = await apiService.post<ValidateResponse>("/drivers/validate", {
        ticketId,
      });

      // Backend có thể trả { ok, ticket, message } hoặc wrap
      const data: any = (res as any)?.data?.data ?? res.data;

      if (data?.ticket) {
        setTicket(data.ticket);
      } else {
        Alert.alert("Không hợp lệ", data?.message ?? "Không tìm thấy vé");
        setScanned(false);
      }
    } catch (err: any) {
      console.error("Validate error", err);
      const errData = err?.response?.data;
      const message =
        errData?.message ||
        errData?.msg ||
        (typeof errData === "string" ? errData : null) ||
        err?.message ||
        "Không thể xác thực vé";
      Alert.alert("Lỗi", message);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Handler scan (chấp nhận QR là ticketCode string hoặc JSON)
  const onScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      if (scanned || loading) return;
      setScanned(true);

      let ticketId = String(data || "").trim();

      // Nếu QR là JSON, thử lấy các field phổ biến
      try {
        const parsed = JSON.parse(ticketId);
        if (parsed?.ticketCode) ticketId = String(parsed.ticketCode);
        else if (parsed?.ticketId) ticketId = String(parsed.ticketId);
        else if (parsed?.id) ticketId = String(parsed.id);
        else if (parsed?.code) ticketId = String(parsed.code);
      } catch {
        // not JSON -> keep raw string
      }

      if (!ticketId) {
        Alert.alert("Lỗi", "QR không hợp lệ.");
        setScanned(false);
        return;
      }

      handleValidateTicket(ticketId);
    },
    [scanned, loading, handleValidateTicket],
  );

  const confirmUseTicket = useCallback(async () => {
    if (!ticket) return;
    try {
      setLoading(true);

      const res = await apiService.post<{ ok?: boolean; message?: string }>("/drivers/confirm-ticket", {
        ticketId: ticket.id, // backend nhận code hoặc id đều được (repo bạn đã hỗ trợ code/id)
      });

      const data: any = (res as any)?.data?.data ?? res.data;

      if (data?.ok) {
        Alert.alert("Thành công", "Xác nhận vé thành công");
        resetScanner();
      } else {
        Alert.alert("Lỗi", data?.message ?? "Xác nhận thất bại");
      }
    } catch (err: any) {
      console.error("Confirm error", err);
      const errData = err?.response?.data;
      const message =
        errData?.message ||
        errData?.msg ||
        (typeof errData === "string" ? errData : null) ||
        err?.message ||
        "Xác nhận thất bại";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, [ticket]);

  // Permission UI
  if (permissionUndetermined) {
    return (
      <View style={styles.center}>
        <Text>Đang yêu cầu quyền camera...</Text>
      </View>
    );
  }

  if (!permissionGranted) {
    return (
      <View style={styles.center}>
        <Text>Không có quyền camera. Vui lòng cấp quyền trong cài đặt.</Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 12 }]}
          onPress={() => requestCameraPermission && requestCameraPermission()}
        >
          <Text style={styles.buttonText}>Yêu cầu quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!ticket ? (
        <>
          <View style={styles.scannerContainer}>
            {CameraRuntime ? (
              <CameraRuntime
                style={StyleSheet.absoluteFillObject}
                // ✅ tương thích cả 2 API của expo-camera (Camera vs CameraView)
                onBarCodeScanned={scanned ? undefined : onScanned}
                onBarcodeScanned={scanned ? undefined : onScanned}
                ratio="16:9"
              />
            ) : (
              <View style={[styles.center, { flex: 1 }]}>
                <Text style={{ marginBottom: 8 }}>Module camera chưa sẵn sàng.</Text>
                <Text style={{ textAlign: "center", color: "#666" }}>
                  Hãy mở ứng dụng bằng Expo Go (hoặc rebuild dev client nếu dùng custom client).
                </Text>
              </View>
            )}

            <View style={styles.scanOverlay}>
              <Ionicons name="scan-outline" size={36} color="#fff" />
              <Text style={styles.scanText}>
                {loading ? "Đang kiểm tra vé..." : "Quét mã vé"}
              </Text>
            </View>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
          </View>

          <View style={styles.controls}>
            {scanned && !loading && (
              <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
                <Text style={styles.buttonText}>Quét lại</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Thoát</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Thông tin vé</Text>

          {/* ✅ ưu tiên hiển thị ticketCode nếu có */}
          <Text style={styles.field}>
            Mã vé: {ticket?.extras?.ticketCode ?? ticket.id}
          </Text>

          {ticket.bookingId && <Text style={styles.field}>Booking: {ticket.bookingId}</Text>}
          {ticket.passengerName && <Text style={styles.field}>Hành khách: {ticket.passengerName}</Text>}
          {ticket.seat && <Text style={styles.field}>Ghế: {ticket.seat}</Text>}
          {ticket.status && <Text style={styles.field}>Trạng thái: {ticket.status}</Text>}

          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.button, { marginRight: 8 }]}
              onPress={confirmUseTicket}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Xác nhận</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={resetScanner}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },

  scannerContainer: { flex: 1, overflow: "hidden", borderRadius: 8 },
  scanOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
  },
  scanText: { color: "#fff", marginTop: 8, fontWeight: "700" },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  controls: { padding: 16, flexDirection: "row", justifyContent: "center", gap: 10 },
  button: { backgroundColor: "#1976d2", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  cancel: { backgroundColor: "#999" },
  buttonText: { color: "#fff", fontWeight: "700" },

  result: { padding: 16 },
  resultTitle: { fontSize: 20, fontWeight: "900", marginBottom: 8 },
  field: { fontSize: 16, marginTop: 6 },
});