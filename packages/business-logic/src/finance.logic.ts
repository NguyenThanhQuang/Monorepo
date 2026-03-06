export const FINANCE_CONFIG = {
  PLATFORM_COMMISSION_RATE: 0.1, // 10%
};

/**
 * Tính hoa hồng hệ thống (10%)
 */
export function calculatePlatformCommission(grossAmount: number): number {
  return grossAmount * FINANCE_CONFIG.PLATFORM_COMMISSION_RATE;
}

/**
 * Tính doanh thu thực nhận của nhà xe (90%)
 */
export function calculateCompanyNetRevenue(grossAmount: number): number {
  return grossAmount * (1 - FINANCE_CONFIG.PLATFORM_COMMISSION_RATE);
}