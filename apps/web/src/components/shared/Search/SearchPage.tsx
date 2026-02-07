// src/components/search/SearchPage.tsx
import { useEffect, useState } from 'react';
import { HeroSearch } from './HeroSearch';
import { SearchResults } from './SearchResults';

interface SearchParams {
  fromProvince: string;
  toProvince: string;
  date?: string; // undefined = all days
}

export function SearchPage() {
  const [params, setParams] = useState<SearchParams | null>(null);

  /* ================= SLIDER EVENT ================= */
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { fromProvince, toProvince } = e.detail;

      setParams({
        fromProvince,
        toProvince,
        date: undefined, // slider = all dates
      });
    };

    window.addEventListener('searchRoute', handler as EventListener);
    return () =>
      window.removeEventListener('searchRoute', handler as EventListener);
  }, []);

  /* ================= UI ================= */
  return (
    <>
      {!params && (
     // src/components/search/SearchPage.tsx
<HeroSearch
  onSearch={(params) => {
    setParams({
      fromProvince: params.fromProvince,
      toProvince: params.toProvince,
      date: params.date,
    });
  }}
/>
      )}

      {params && (  
        <SearchResults
          fromProvince={params.fromProvince}
          toProvince={params.toProvince}
          date={params.date}
          onBack={() => setParams(null)}
          onTripSelect={(id) => {
            console.log('Trip selected:', id);
          }}
        />
      )}
    </>
  );
}