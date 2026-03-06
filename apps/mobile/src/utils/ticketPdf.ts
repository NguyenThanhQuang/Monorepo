import { Alert, Platform } from "react-native";

import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import * as QRCode from "qrcode";

import { bookingService } from "@/services/user/bookingService";

type TicketPdfOptions = {
  /** Tên file gợi ý (không có đuôi .pdf cũng được) */
  fileName?: string;
  /** Android: nếu true sẽ mở chọn thư mục để lưu (Storage Access Framework). */
  androidPickDirectory?: boolean;
};

const escapeHtml = (v: any) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const fmtMoney = (n: any) => `${Number(n ?? 0).toLocaleString("vi-VN")}đ`;

const fmtDT = (iso: any) => {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return { date: "-", time: "-", full: "-" };
  return {
    date: d.toLocaleDateString("vi-VN"),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    full: d.toLocaleString("vi-VN"),
  };
};

/**
 * React Native (Expo) KHÔNG có canvas DOM, nên qrcode.toDataURL() sẽ lỗi.
 * Cách an toàn: xuất QR dạng SVG string rồi nhúng trực tiếp vào HTML để in PDF.
 */
async function tryMakeQrSvg(payload: string): Promise<string | null> {
  try {
    // SVG string: <svg ...>...</svg>
    return await QRCode.toString(payload, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
  } catch (e) {
    console.log("❌ QR toString(svg) error:", e);
    return null;
  }
}

function buildTicketHtml(input: {
  bookingId: string;
  ticketCode: string;
  company: string;
  from: string;
  to: string;
  departureTime?: string;
  arrivalTime?: string;
  seats: string[];
  passengers: number;
  totalAmount: number;
  createdAt?: string;
  qrSvg?: string | null;
}) {
  const dep = fmtDT(input.departureTime);
  const arr = fmtDT(input.arrivalTime);
  const created = fmtDT(input.createdAt);

  const qrBlock = input.qrSvg
    ? `<div class="qr"><div class="frame">${input.qrSvg}</div></div>`
    : "";

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        *{ box-sizing:border-box; }
        body{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Helvetica Neue', sans-serif; margin:0; padding:24px; color:#0f172a; }
        .wrap{ border:1px solid #e2e8f0; border-radius:16px; padding:18px; }
        .top{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .brand{ font-size:18px; font-weight:800; }
        .sub{ margin-top:4px; color:#475569; font-size:12px; font-weight:600; }
        .code{ text-align:right; }
        .code .label{ color:#475569; font-size:12px; font-weight:700; }
        .code .value{ font-size:20px; font-weight:900; margin-top:4px; letter-spacing:0.5px; }
        .route{ margin-top:16px; font-size:18px; font-weight:900; }
        .grid{ margin-top:12px; display:grid; grid-template-columns: 1fr 1fr; gap:10px 14px; }
        .kv{ padding:10px 12px; border:1px solid #e2e8f0; border-radius:12px; }
        .k{ color:#64748b; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; }
        .v{ margin-top:6px; font-size:13px; font-weight:800; }
        .qr{ margin-top:16px; display:flex; justify-content:center; }
        .qr .frame{ width:240px; height:240px; border:1px solid #e2e8f0; border-radius:14px; padding:10px; display:flex; align-items:center; justify-content:center; }
        .qr svg{ width:100%; height:100%; }
        .hint{ margin-top:10px; color:#475569; font-size:12px; font-weight:600; text-align:center; }
        .hr{ margin:16px 0; height:1px; background:#e2e8f0; }
        .foot{ color:#64748b; font-size:11px; font-weight:600; line-height:1.5; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="top">
          <div>
            <div class="brand">${escapeHtml(input.company || "Vé xe")}</div>
            <div class="sub">Mã đặt chỗ: <b>${escapeHtml(input.bookingId)}</b></div>
          </div>
          <div class="code">
            <div class="label">Mã vé</div>
            <div class="value">${escapeHtml(input.ticketCode)}</div>
          </div>
        </div>

        <div class="route">${escapeHtml(input.from)} → ${escapeHtml(input.to)}</div>

        <div class="grid">
          <div class="kv"><div class="k">Khởi hành</div><div class="v">${escapeHtml(dep.date)} • ${escapeHtml(dep.time)}</div></div>
          <div class="kv"><div class="k">Dự kiến đến</div><div class="v">${escapeHtml(arr.date)} • ${escapeHtml(arr.time)}</div></div>

          <div class="kv"><div class="k">Ghế</div><div class="v">${escapeHtml(input.seats?.length ? input.seats.join(", ") : "-")}</div></div>
          <div class="kv"><div class="k">Hành khách</div><div class="v">${escapeHtml(String(input.passengers || 1))}</div></div>

          <div class="kv"><div class="k">Tổng tiền</div><div class="v">${escapeHtml(fmtMoney(input.totalAmount))}</div></div>
          <div class="kv"><div class="k">Ngày đặt</div><div class="v">${escapeHtml(created.full)}</div></div>
        </div>

        ${qrBlock}
        <div class="hint">Xuất trình QR / mã vé cho tài xế để quét</div>

        <div class="hr"></div>
        <div class="foot">
          • Vui lòng đến trước giờ khởi hành 15–30 phút.<br/>
          • Vé đã thanh toán thường không hoàn lại (tùy chính sách nhà xe).<br/>
          • Nếu có sự cố, liên hệ nhà xe/CSKH và cung cấp mã đặt chỗ.
        </div>
      </div>
    </body>
  </html>`;
}

async function saveOrSharePdf(uri: string, filename: string, opts?: TicketPdfOptions) {
  // iOS: share sheet là ổn nhất
  if (Platform.OS !== "android") {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Tải vé",
      });
      return;
    }
    Alert.alert("Thông báo", `Đã tạo file PDF: ${filename}`);
    return;
  }

  // Android: ưu tiên lưu vào thư mục user chọn (Downloads) bằng SAF
  const pickDir = opts?.androidPickDirectory ?? true;
  if (pickDir && FileSystem.StorageAccessFramework) {
    const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (perm.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
        perm.directoryUri,
        filename,
        "application/pdf",
      );
      await FileSystem.writeAsStringAsync(destUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert("Thành công", "Đã lưu vé về máy.");
      return;
    }
  }

  // Fallback: share
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    return;
  }
  Alert.alert("Thông báo", `Đã tạo file PDF: ${filename}`);
}

/**
 * Tạo PDF vé từ bookingId, sau đó lưu/chia sẻ về máy.
 */
export async function downloadTicketPdfByBookingId(bookingId: string, opts?: TicketPdfOptions) {
  if (!bookingId) throw new Error("BOOKING_ID_MISSING");

  const res: any = await bookingService.getBookingById(bookingId);
  const booking = res?.data ?? res;
  return downloadTicketPdfFromBooking(booking, opts);
}

/**
 * Tạo PDF vé từ object booking (đã có sẵn), sau đó lưu/chia sẻ về máy.
 */
export async function downloadTicketPdfFromBooking(booking: any, opts?: TicketPdfOptions) {
  const bookingId = String(booking?._id ?? booking?.id ?? "");
  const trip = booking?.tripId;

  const ticketCode = String(booking?.ticketCode ?? "");
  if (!ticketCode) {
    Alert.alert(
      "Thông báo",
      "Vé chưa có mã (ticketCode). Hãy thanh toán/đợi hệ thống cập nhật rồi thử lại.",
    );
    return;
  }

  const from = trip?.route?.fromLocationId?.name ?? trip?.from ?? "-";
  const to = trip?.route?.toLocationId?.name ?? trip?.to ?? "-";
  const company = trip?.companyId?.name ?? booking?.companyId?.name ?? "Vé xe";

  const departureTime = trip?.departureTime;
  const arrivalTime = trip?.expectedArrivalTime ?? trip?.arrivalTime;

  const seats: string[] = Array.isArray(booking?.passengers)
    ? booking.passengers.map((p: any) => p?.seatNumber).filter(Boolean)
    : [];

  const passengers = seats.length || (Array.isArray(booking?.passengers) ? booking.passengers.length : 1);
  const totalAmount = Number(booking?.totalAmount ?? booking?.totalPrice ?? 0);
  const createdAt = booking?.createdAt ?? booking?.bookingTime;

  // Payload QR: ưu tiên ticketCode để tài xế quét; kèm bookingId để debug khi cần.
  const qrPayload = `TICKET:${ticketCode}|BOOKING:${bookingId || "-"}`;
  const qrSvg = await tryMakeQrSvg(qrPayload);

  const html = buildTicketHtml({
    bookingId: bookingId || "-",
    ticketCode,
    company,
    from,
    to,
    departureTime,
    arrivalTime,
    seats,
    passengers,
    totalAmount,
    createdAt,
    qrSvg,
  });

  const safeCode = ticketCode.replace(/[^a-zA-Z0-9_-]/g, "");
  const filenameRaw = opts?.fileName || `ve_${safeCode || bookingId || "ticket"}`;
  const filename = filenameRaw.toLowerCase().endsWith(".pdf") ? filenameRaw : `${filenameRaw}.pdf`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await saveOrSharePdf(uri, filename, opts);
}
