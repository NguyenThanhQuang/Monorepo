import type { FAQCategory } from './faq.types';

interface Props {
  categories: FAQCategory[];
  selected: string;
  onSelect: (id: string) => void;
}

export function FAQCategories({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all ${
              selected === cat.id
                ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white'
                : 'bg-white dark:bg-gray-800 border'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
