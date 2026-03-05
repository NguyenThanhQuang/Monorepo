import { useLanguage } from "../../contexts/LanguageContext";
import type { FooterProps } from "../Props/layout/FooterProps";

export function useFooterLogic({ onNavigate }: FooterProps = {}) {
  const { t } = useLanguage();

  const handleNavigation = (page: string) => {
    onNavigate?.(page);
  };

  return {
    t,
    handleNavigation,
  };
}
