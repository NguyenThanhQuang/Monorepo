import { useEffect, useState } from 'react';
import { HeroSearch } from './HeroSearch';
import { SearchResults } from './SearchResults.ui';

interface SearchParams {
  fromId: string;
  toId: string;
  date?: string; // undefined = all days
}

export function SearchPage() {
  const [params, setParams] = useState<SearchParams | null>(null);

  /* ================= SLIDER EVENT ================= */
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { fromId, toId } = e.detail;

      setParams({
        fromId,
        toId,
        date: undefined, // 🔥 slider = all dates
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
        <HeroSearch
          onSearch={(fromId, toId, date) => {
            setParams({
              fromId,
              toId,
              date: date && date.length > 0 ? date : undefined,
            });
          }}
        />
      )}

      {params && (
        <SearchResults
          fromId={params.fromId}
          toId={params.toId}
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
