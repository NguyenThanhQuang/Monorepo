export type SettingsTab =
  | 'general'
  | 'company'
  | 'notifications'
  | 'security'
  | 'payment';

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxCode?: string;
  website?: string;
  logo?: string;
}

export interface PricingSettings {
  baseRate: number;
  perKmRate: number;
  cancellationFee: number;
  lateCancellationHours: number;
  childDiscountPercent: number;
  studentDiscountPercent: number;
}

export interface PaymentSettings {
  vnpayEnabled: boolean;
  momoEnabled: boolean;
  zalopayEnabled: boolean;
  bankTransferEnabled: boolean;
  cashEnabled: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
}
