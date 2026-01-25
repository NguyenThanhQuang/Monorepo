import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Location } from '@obtp/shared-types';
import { locationApi } from '../../api/service/location/apiLocation';
import type { UseHeroSearchLogicProps } from '../Props/layout/HeaderProps';

export function useHeroSearchLogic({
  onSearch,
  initialFrom = null,
  initialTo = null,
}: UseHeroSearchLogicProps) {
  const { t } = useLanguage();

  /* =====================
     STATE
  ===================== */
  const [fromText, setFromText] = useState(
    initialFrom ? `${initialFrom.name}, ${initialFrom.province}` : '',
  );
  const [toText, setToText] = useState(
    initialTo ? `${initialTo.name}, ${initialTo.province}` : '',
  );

  const [fromLocation, setFromLocation] = useState<Location | null>(initialFrom);
  const [toLocation, setToLocation] = useState<Location | null>(initialTo);

  const [date, setDate] = useState('');

  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  /* =====================
     EFFECTS – AUTOCOMPLETE
  ===================== */
  useEffect(() => {
    if (!fromText || fromLocation) return;

    const timer = setTimeout(async () => {
      const res = await locationApi.search(fromText);
      setFromSuggestions(res.data);
    }, 300);

    return () => clearTimeout(timer);
  }, [fromText, fromLocation]);

  useEffect(() => {
    if (!toText || toLocation) return;

    const timer = setTimeout(async () => {
      const res = await locationApi.search(toText);
      setToSuggestions(res.data);
    }, 300);

    return () => clearTimeout(timer);
  }, [toText, toLocation]);

  /* =====================
     HANDLERS
  ===================== */
  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      alert(t('selectBothLocations'));
      return;
    }

    const finalDate =
      date || new Date().toISOString().split('T')[0];

    setDate(finalDate);
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
    t,

    // text
    fromText,
    toText,
    setFromText,
    setToText,

    // selected location
    fromLocation,
    toLocation,
    setFromLocation,
    setToLocation,

    // date
    date,
    setDate,

    // suggestions
    fromSuggestions,
    toSuggestions,
    showFromSuggestions,
    showToSuggestions,
    setShowFromSuggestions,
    setShowToSuggestions,

    // refs
    fromInputRef,
    toInputRef,

    // handlers
    handleSearch,
    handleSwap,
  };
}
