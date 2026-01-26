import {
  HelpCircle,
  Ticket,
  CreditCard,
  MapPin,
  Phone
} from 'lucide-react';
import type { FAQCategory, FAQItem } from './faq.types';

export const buildCategories = (t: (key: string) => string): FAQCategory[] => [
  { id: 'all', name: t('allCategories'), icon: HelpCircle },
  { id: 'booking', name: t('bookingCategory'), icon: Ticket },
  { id: 'payment', name: t('paymentCategory'), icon: CreditCard },
  { id: 'trip', name: t('tripCategory'), icon: MapPin },
  { id: 'support', name: t('supportCategory'), icon: Phone }
];

export const buildFAQs = (t: (key: string) => string): FAQItem[] => [
  { id: '1', category: 'booking', question: t('faq1Q'), answer: t('faq1A') },
  { id: '2', category: 'booking', question: t('faq2Q'), answer: t('faq2A') },
  { id: '3', category: 'booking', question: t('faq3Q'), answer: t('faq3A') },
  { id: '4', category: 'payment', question: t('faq4Q'), answer: t('faq4A') },
  { id: '5', category: 'payment', question: t('faq5Q'), answer: t('faq5A') },
  { id: '6', category: 'payment', question: t('faq6Q'), answer: t('faq6A') },
  { id: '7', category: 'trip', question: t('faq7Q'), answer: t('faq7A') },
  { id: '8', category: 'trip', question: t('faq8Q'), answer: t('faq8A') },
  { id: '9', category: 'trip', question: t('faq9Q'), answer: t('faq9A') },
  { id: '10', category: 'support', question: t('faq10Q'), answer: t('faq10A') },
  { id: '11', category: 'support', question: t('faq11Q'), answer: t('faq11A') },
  { id: '12', category: 'support', question: t('faq12Q'), answer: t('faq12A') }
];
