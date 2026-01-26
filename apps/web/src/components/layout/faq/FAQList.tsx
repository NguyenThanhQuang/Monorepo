import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FAQItem } from './faq.types';

interface Props {
  faqs: FAQItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  emptyText: string;
  hintText: string;
}

export function FAQList({
  faqs,
  expandedId,
  onToggle,
  emptyText,
  hintText
}: Props) {
  if (!faqs.length) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-lg">{emptyText}</p>
        <p className="text-sm text-gray-500">{hintText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-2xl border">
          <button
            onClick={() => onToggle(faq.id)}
            className="w-full flex justify-between p-6 text-left"
          >
            <span className="text-lg">{faq.question}</span>
            <ChevronDown
              className={`w-6 h-6 transition-transform ${
                expandedId === faq.id ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedId === faq.id && (
            <div className="px-6 pb-6 text-gray-600">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
