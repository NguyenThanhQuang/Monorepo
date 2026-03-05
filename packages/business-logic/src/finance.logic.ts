export const FINANCE_CONFIG = {
  PLATFORM_COMMISSION_RATE: 0.1, // 10%
};

/**
 * Tính hoa hồng hệ thống
 */
export function calculatePlatformCommission(grossAmount: number): number {
  return grossAmount * FINANCE_CONFIG.PLATFORM_COMMISSION_RATE;
}

/**
 * Tính doanh thu thực nhận của nhà xe sau khi trừ phí
 */
export function calculateCompanyNetRevenue(grossAmount: number): number {
  return grossAmount * (1 - FINANCE_CONFIG.PLATFORM_COMMISSION_RATE);
}