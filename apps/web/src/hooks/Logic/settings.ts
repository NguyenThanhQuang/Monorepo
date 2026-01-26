import { useState } from 'react';
import type { SettingsTab,CompanySettings,
  PricingSettings,
  PaymentSettings,
  NotificationSettings,
  SecuritySettings, } from '../../features/settings/types';
import { useLanguage } from '../../contexts/LanguageContext';

export function useSettingsPageLogic() {
  const { language, setLanguage, t } = useLanguage();

  const [selectedTab, setSelectedTab] = useState<SettingsTab>('general');

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'Nhà Xe Phương Trang',
    email: 'contact@phuongtrang.vn',
    phone: '1900 6067',
    address: '272 Đề Thám, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
    taxCode: '0123456789',
    website: 'https://phuongtrang.vn',
    logo: '',
  });

  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    baseRate: 5000,
    perKmRate: 15000,
    cancellationFee: 20,
    lateCancellationHours: 24,
    childDiscountPercent: 50,
    studentDiscountPercent: 10,
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    vnpayEnabled: true,
    momoEnabled: true,
    zalopayEnabled: true,
    bankTransferEnabled: true,
    cashEnabled: true,
  });

  const handleSave = () => {
    alert(t('success') + '!');
  };

  return {
    t,
    language,
    setLanguage,

    selectedTab,
    setSelectedTab,

    notifications,
    setNotifications,

    security,
    setSecurity,

    companySettings,
    setCompanySettings,

    pricingSettings,
    setPricingSettings,

    paymentSettings,
    setPaymentSettings,

    handleSave,
  };
}
