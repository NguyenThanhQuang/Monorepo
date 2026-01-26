import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
}

export function FAQHeader({ onBack }: Props) {
  const { t } = useLanguage();

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToHome')}</span>
          </button>
        </div>
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl mb-6 shadow-lg">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl text-gray-900 dark:text-white mb-4">
          {t('faqTitle')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('faqSubtitle')}
        </p>
      </div>
    </>
  );
}
