import { useEffect, useState } from 'react';
import { HeroSearch } from './HeroSearch';
import { SearchResults } from './SearchResults.ui';

export function SearchPage() {
  const [params, setParams] = useState<{
    fromId: string;
    toId: string;
    date: string;
  } | null>(null);

  // 🔥 NHẬN EVENT TỪ SLIDER
  useEffect(() => {
    const handler = (e: any) => {
      setParams({
        fromId: e.detail.departure,
        toId: e.detail.destination,
        date: '', // 👈 KHÔNG NGÀY
      });
    };

    window.addEventListener('searchRoute', handler);
    return () => window.removeEventListener('searchRoute', handler);
  }, []);

  return (
    <>
      {!params && (
        <HeroSearch
          onSearch={(fromId, toId, date) =>
            setParams({ fromId, toId, date })
          }
        />
      )}

      {params && (
        <SearchResults
          fromId={params.fromId}
          toId={params.toId}
          date={params.date}
          onBack={() => setParams(null)}
          onTripSelect={(id) => console.log('Trip:', id)}
        />
      )}
    </>
  );
}
