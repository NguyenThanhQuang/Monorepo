import { useEffect, useState } from "react";
import { locationApi } from "../../api/service/location/apiLocation";
import type { Location as AppLocation } from '@obtp/shared-types'; // Thêm alias

export function useHeroLocationSlider() {
  // Sửa: thay Location bằng AppLocation
  const [locations, setLocations] = useState<AppLocation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<AppLocation | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<{ from: string; to: string } | null>(null);

  /* =====================
     LOAD POPULAR LOCATIONS
  ===================== */
  useEffect(() => {
    locationApi
      .getPopular()
      .then(res => {
        // res.data có type ApiResponse<Location[]>
        const locationsData = res || [];
        console.log('Locations loaded:', locationsData);
        setLocations(locationsData);
      })
      .catch(error => {
        console.error('Failed to fetch locations:', error);
        setLocations([]);
      });
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

  // Bảo vệ: đảm bảo locations là mảng
  const displayLocations = Array.isArray(locations) && locations.length > 0
    ? [...locations, ...locations, ...locations]
    : [];

  return {
    locations: Array.isArray(locations) ? locations : [],
    displayLocations,
    currentIndex,
    setCurrentIndex,
    selectedLocation,
    setSelectedLocation,
    setSelectedRoute,
  };
}