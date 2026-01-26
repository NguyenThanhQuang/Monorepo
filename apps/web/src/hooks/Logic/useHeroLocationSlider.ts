import { useEffect, useState } from 'react';
import type { Location } from '@obtp/shared-types';
import { locationApi } from '../../api/service/location/apiLocation';

export function useHeroLocationSlider() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<{ from: string; to: string } | null>(null);

  /* =====================
     LOAD POPULAR LOCATIONS
  ===================== */
  useEffect(() => {
    locationApi
      .getPopular()
      .then(res => setLocations(res.data))
      .catch(console.error);
  }, []);

  /* =====================
     AUTO SLIDE
  ===================== */
  useEffect(() => {
    if (!locations.length) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % locations.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [locations]);

  /* =====================
     ROUTE SELECT → TRIGGER SEARCH
  ===================== */
  useEffect(() => {
    if (!selectedRoute) return;

    window.dispatchEvent(
      new CustomEvent('searchRoute', {
        detail: {
          departure: selectedRoute.from,
          destination: selectedRoute.to,
          date: new Date().toISOString().split('T')[0],
        },
      }),
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedLocation(null);
    setSelectedRoute(null);
  }, [selectedRoute]);

  const displayLocations = [...locations, ...locations, ...locations];

  return {
    locations,
    displayLocations,
    currentIndex,
    setCurrentIndex,
    selectedLocation,
    setSelectedLocation,
    setSelectedRoute,
  };
}
