export function constructVerificationUrl(
  baseUrl: string,
  path: string,
  success: boolean,
  messageKey: string,
  accessToken?: string,
): string {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${cleanBase}${cleanPath}`);
  url.searchParams.set("success", String(success));
  url.searchParams.set("message", messageKey);

  if (success && accessToken) {
    url.searchParams.set("accessToken", accessToken);
  }
  return url.toString();
}

export function transformMongoId(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => transformMongoId(item));
  }
  if (
    data &&
    typeof data.toString === "function" &&
    /^[0-9a-fA-F]{24}$/.test(data.toString()) &&
    !data.substring
  ) {
    return data.toString();
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === "object") {
    const obj = typeof data.toObject === "function" ? data.toObject() : data;
    const newData: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === "_id") {
          newData["id"] = obj[key].toString();
        } else if (key === "__v") {
          continue;
        } else {
          newData[key] = transformMongoId(obj[key]);
        }
      }
    }
    return newData;
  }

  return data;
}

/**
 * Format tiền tệ VNĐ (Hỗ trợ dạng viết tắt: 1 tỷ, 1 triệu)
 */
export function formatCurrency(
  amount: number,
  compact: boolean = false,
): string {
  if (amount === undefined || amount === null) return "0₫";
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)} triệu`;
    }
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số lượng hiển thị (VD: 1.000)
 */
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString("vi-VN");
}

/**
 * Format ngày tháng linh hoạt
 */
export function formatDate(
  date: string | Date | undefined,
  format: string = "DD/MM/YYYY",
): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY HH:mm":
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case "HH:mm DD/MM/YYYY":
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Format số điện thoại VN (chia 4-3-3)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
}

/**
 * Format hiển thị danh sách ghế (VD: A01, A02 và 3 ghế khác)
 */
export function formatSeatNumbers(seats: string[]): string {
  if (!seats || seats.length === 0) return "";
  if (seats.length <= 3) {
    return seats.join(", ");
  }
  return `${seats.slice(0, 3).join(", ")} và ${seats.length - 3} ghế khác`;
}
