// src/hooks/Logic/useHeroSearchLogic.ts
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Location } from '@obtp/shared-types';
import { locationApi } from '../../api/service/location/apiLocation';

export interface UseHeroSearchLogicProps {
  onSearch?: (params: { fromProvince: string; toProvince: string; date?: string }) => void;
  initialFrom?: Location | null;
  initialTo?: Location | null;
}

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

  /* ================= LOAD ALL ================= */
  const loadAllFromLocations = async () => {
    try {
      const res = await locationApi.search('');
      setFromSuggestions(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Error loading from locations:', error);
      setFromSuggestions([]);
    }
  };

  const loadAllToLocations = async () => {
    try {
      const res = await locationApi.search('');
      setToSuggestions(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Error loading to locations:', error);
      setToSuggestions([]);
    }
  };

  /* ================= AUTOCOMPLETE FROM ================= */
  useEffect(() => {
    if (!fromText) {
      setFromSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await locationApi.search(fromText);
        setFromSuggestions(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Error searching from locations:', error);
        setFromSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fromText]);

  /* ================= AUTOCOMPLETE TO ================= */
  useEffect(() => {
    if (!toText) {
      setToSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await locationApi.search(toText);
        setToSuggestions(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Error searching to locations:', error);
        setToSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [toText]);

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      alert(t('selectBothLocations') || 'Vui lòng chọn cả điểm đi và điểm đến');
      return;
    }

    const finalDate = date || new Date().toISOString().split('T')[0];

    onSearch?.({
      fromProvince: fromLocation.province,
      toProvince: toLocation.province,
      date: finalDate,
    });
  };

  /* ================= SWAP ================= */
  const handleSwap = () => {
    // Swap locations
    setFromLocation(toLocation);
    setToLocation(fromLocation);

    // Swap text
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