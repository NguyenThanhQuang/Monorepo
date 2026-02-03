import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Location } from '@obtp/shared-types';
import type { UseHeroSearchLogicProps } from '../Props/layout/HeroSearchProps';
import { locationApi } from '../../api/service/location/apiLocation';

export function useHeroSearchLogic({
  onSearch,
  initialFrom = null,
  initialTo = null,
}: UseHeroSearchLogicProps) {
  const { t } = useLanguage();

  const [fromText, setFromText] = useState(
    initialFrom ? `${initialFrom.name}, ${initialFrom.province}` : '',
  );
  const [toText, setToText] = useState(
    initialTo ? `${initialTo.name}, ${initialTo.province}` : '',
  );

  const [fromLocation, setFromLocation] = useState<Location | null>(initialFrom);
  const [toLocation, setToLocation] = useState<Location | null>(initialTo);

const [date, setDate] = useState<string | undefined>(undefined);

  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  /* ===== LOAD ALL WHEN CLICK ===== */
  const loadAllFromLocations = async () => {
    const res = await locationApi.search('');
    setFromSuggestions(res);
  };

  const loadAllToLocations = async () => {
    const res = await locationApi.search('');
    setToSuggestions(res);
  };

  /* ===== AUTOCOMPLETE FROM ===== */
  useEffect(() => {
    if (!fromText) return;

    const timer = setTimeout(async () => {
      const res = await locationApi.search(fromText);
      setFromSuggestions(res);
    }, 300);

    return () => clearTimeout(timer);
  }, [fromText]);

  /* ===== AUTOCOMPLETE TO ===== */
  useEffect(() => {
    if (!toText) return;

    const timer = setTimeout(async () => {
      const res = await locationApi.search(toText);
      setToSuggestions(res);
    }, 300);

    return () => clearTimeout(timer);
  }, [toText]);

  /* ===== SEARCH ===== */
  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      alert(t('selectBothLocations'));
      return;
    }

    const finalDate = date || new Date().toISOString().split('T')[0];
    onSearch?.(fromLocation.id, toLocation.id, finalDate);
  };

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);

    setFromText(
      toLocation ? `${toLocation.name}, ${toLocation.province}` : '',
    );
    setToText(
      fromLocation ? `${fromLocation.name}, ${fromLocation.province}` : '',
    );
  };

  return {
    fromText,
    toText,
    setFromText,
    setToText,

    fromLocation,
    toLocation,
    setFromLocation,
    setToLocation,

    date,
    setDate,

    fromSuggestions,
    toSuggestions,
    showFromSuggestions,
    showToSuggestions,
    setShowFromSuggestions,
    setShowToSuggestions,

    fromInputRef,
    toInputRef,

    loadAllFromLocations,
    loadAllToLocations,

    handleSearch,
    handleSwap,
  };
}
