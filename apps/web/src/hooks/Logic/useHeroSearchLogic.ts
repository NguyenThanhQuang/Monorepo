import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { LocationItem, UseHeroSearchLogicProps } from '../Props/layout/HeroSearchProps';
export function useHeroSearchLogic({
  onSearch,
  initialFrom = '',
  initialTo = '',
}: UseHeroSearchLogicProps) {
  const { t } = useLanguage();

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState('');

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFrom(initialFrom);
    setTo(initialTo);
  }, [initialFrom, initialTo]);

  /** 🔹 LOAD POPULAR LOCATIONS */
  useEffect(() => {
    fetch('/api/locations/popular')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(console.error);
  }, []);

  const handleSearch = () => {
    if (!from || !to) {
      alert(t('selectBothLocations'));
      return;
    }

    const searchDate = date || new Date().toISOString().split('T')[0];
    setDate(searchDate);
    onSearch?.(from, to, searchDate);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const filteredFromLocations = locations.filter(
    l =>
      l.name.toLowerCase().includes(from.toLowerCase()) &&
      l.name !== to,
  );

  const filteredToLocations = locations.filter(
    l =>
      l.name.toLowerCase().includes(to.toLowerCase()) &&
      l.name !== from,
  );

  return {
    t,
    from,
    to,
    date,
    setFrom,
    setTo,
    setDate,
    locations,
    filteredFromLocations,
    filteredToLocations,
    showFromSuggestions,
    showToSuggestions,
    setShowFromSuggestions,
    setShowToSuggestions,
    fromInputRef,
    toInputRef,
    handleSearch,
    handleSwap,
  };
}
