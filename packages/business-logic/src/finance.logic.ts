export const FINANCE_CONSTANTS = {
  PLATFORM_COMMISSION_RATE: 0.15, // Hoa hồng mặc định 15%
};

/**
 * Tính phí hoa hồng nền tảng
 */
export function calculateCommission(grossAmount: number): number {
  return grossAmount * FINANCE_CONSTANTS.PLATFORM_COMMISSION_RATE;
}

/**
 * Tính doanh thu thực nhận của nhà xe
 */
export function calculateNetProfit(grossAmount: number): number {
  return grossAmount - calculateCommission(grossAmount);
}
