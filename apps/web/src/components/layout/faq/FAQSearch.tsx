import { Search } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function FAQSearch({ value, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="relative mb-8">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchFAQ')}
        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 text-lg"
      />
    </div>
  );
}
