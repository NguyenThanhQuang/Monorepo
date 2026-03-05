/**
 * Tạo mã đơn hàng dạng số nguyên (PayOS bắt buộc Int64)
 * Format: TIMESTAMP + 3 RANDOM DIGITS
 * Cắt lấy 15 ký tự đầu để đảm bảo nằm trong range SafeInteger JS
 */
export function generatePaymentOrderCode(): number {
  const now = Date.now().toString(); // ~13 digits
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const rawString = `${now}${random}`;

  // Cắt chuỗi để không vượt quá giới hạn Number.MAX_SAFE_INTEGER (~9e15)
  // Time ms ~ 13 chars -> Order code dài tối đa 16 chữ số là an toàn
  return parseInt(rawString.slice(0, 15), 10);
}

/**
 * Tạo nội dung chuyển khoản ngắn gọn (để hiện trên App ngân hàng)
 * Ex: TT VEXE 12345
 */
export function formatPaymentDescription(orderCode: number | string): string {
  return `TT ve xe ${orderCode}`;
}
