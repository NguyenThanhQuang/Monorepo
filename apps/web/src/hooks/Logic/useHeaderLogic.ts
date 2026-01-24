import { useState } from 'react';
import { useTheme } from '../../components/layout/ThemeProvider/ThemeProvider';
import { useLanguage } from '../../contexts/LanguageContext';

export function useHeaderLogic() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return {
    theme,
    toggleTheme,
    language,
    t,
    showUserMenu,
    setShowUserMenu,
    toggleLanguage,
  };
}
