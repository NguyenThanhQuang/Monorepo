import type { LucideIcon } from 'lucide-react';

export interface FAQCategory {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}
