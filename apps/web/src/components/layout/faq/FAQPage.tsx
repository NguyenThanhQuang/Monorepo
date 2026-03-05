import { useState, useMemo } from 'react';
import { FAQHeader } from './FAQHeader';
import { FAQSearch } from './FAQSearch';
import { FAQCategories } from './FAQCategories';
import { FAQList } from './FAQList';
import { buildCategories, buildFAQs } from './faq.data';
import { useLanguage } from '../../../contexts/LanguageContext';

interface Props {
  onBack: () => void;
}

export function FAQPage({ onBack }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = useMemo(() => buildCategories(t), [t]);
  const faqs = useMemo(() => buildFAQs(t), [t]);

  const filtered = useMemo(
    () =>
      faqs.filter(f =>
        (category === 'all' || f.category === category) &&
        (f.question.toLowerCase().includes(search.toLowerCase()) ||
         f.answer.toLowerCase().includes(search.toLowerCase()))
      ),
    [faqs, category, search]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <FAQHeader onBack={onBack} />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <FAQSearch value={search} onChange={setSearch} />
        <FAQCategories
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
        <FAQList
          faqs={filtered}
          expandedId={expanded}
          onToggle={(id) => setExpanded(expanded === id ? null : id)}
          emptyText={t('noApplicationsFound')}
          hintText={t('tryChangeFilter')}
        />
      </div>
    </div>
  );
}
