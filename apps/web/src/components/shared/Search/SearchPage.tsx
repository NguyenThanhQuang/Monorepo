// src/components/search/SearchPage.tsx
import { useEffect, useState } from 'react';
import { HeroSearch } from './HeroSearch';
import { SearchResults } from './SearchResults';

interface SearchParams {
  fromProvince: string;
  toProvince: string;
  date?: string;
}

export function SearchPage() {
  const [params, setParams] = useState<SearchParams | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { fromProvince, toProvince } = e.detail;
      setParams({
        fromProvince,
        toProvince,
        date: undefined,
      });
    };

    window.addEventListener('searchRoute', handler as EventListener);
    return () => window.removeEventListener('searchRoute', handler as EventListener);
  }, []);

  return (
    <>
      {!params && (
        <HeroSearch
          onSearch={(searchParams) => {
            setParams({
              fromProvince: searchParams.fromProvince,
              toProvince: searchParams.toProvince,
              date: searchParams.date,
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
            // TODO: Navigate to trip detail
          }}
        />
      )}
    </>
  );
} 