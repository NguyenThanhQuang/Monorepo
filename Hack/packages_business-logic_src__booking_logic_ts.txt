// Hàm hỗ trợ random chuỗi (cho Ticket Code)
export function generateRandomString(
  length: number,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function generateTicketCode(prefix = "TICKET"): string {
  const randomPart = generateRandomString(6); // VD: X8Y9Z0
  return `${prefix}-${randomPart}`;
}

export function calculateTotalAmount(
  passengerCount: number,
  unitPrice: number,
): number {
  return passengerCount * unitPrice;
}

// Logic định nghĩa thời gian hết hạn
export function calculateHoldExpiration(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
