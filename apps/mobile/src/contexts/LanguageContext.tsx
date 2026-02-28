import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simplified translations - use full translations from web app
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Home
    home: 'Trang chủ',
    searchTickets: 'Tìm vé',
    from: 'Điểm đi',
    to: 'Điểm đến',
    date: 'Ngày đi',
    passengers: 'Số hành khách',
    search: 'Tìm kiếm',
    
    // Common
    back: 'Quay lại',
    confirm: 'Xác nhận',
    cancel: 'Hủy',
    save: 'Lưu',
    continue: 'Tiếp tục',
    
    // Booking
    selectSeats: 'Chọn ghế',
    totalPrice: 'Tổng tiền',
    payment: 'Thanh toán',
    bookingSuccess: 'Đặt vé thành công',
    
    // Profile
    profile: 'Hồ sơ',
    myTrips: 'Chuyến đi của tôi',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
  },
  en: {
    // Home
    home: 'Home',
    searchTickets: 'Search Tickets',
    from: 'From',
    to: 'To',
    date: 'Date',
    passengers: 'Passengers',
    search: 'Search',
    
    // Common
    back: 'Back',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    continue: 'Continue',
    
    // Booking
    selectSeats: 'Select Seats',
    totalPrice: 'Total Price',
    payment: 'Payment',
    bookingSuccess: 'Booking Successful',
    
    // Profile
    profile: 'Profile',
    myTrips: 'My Trips',
    settings: 'Settings',
    logout: 'Logout',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
