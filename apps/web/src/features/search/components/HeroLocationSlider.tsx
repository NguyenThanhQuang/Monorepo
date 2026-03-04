import { useEffect, useState } from "react";
import { MapPin, TrendingUp, Bus, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Location as AppLocation } from "@obtp/shared-types";
import { locationsApi } from "@obtp/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroLocationSlider() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [locations, setLocations] = useState<AppLocation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<AppLocation | null>(
    null,
  );

  useEffect(() => {
    locationsApi
      .getPopular()
      .then((data) => {
        setLocations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load popular locations", err);
        setLocations([]);
      });
  }, []);

  // Auto slide
  useEffect(() => {
    if (!locations.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % locations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [locations]);

  const handleRouteSelect = (from: string, to: string) => {
    const date = new Date().toISOString().split("T")[0];
    setSelectedLocation(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    navigate("/search", {
      state: { fromProvince: from, toProvince: to, date },
    });
  };

  if (!locations.length) return null;

  const displayLocations = [...locations, ...locations, ...locations];

  return (
    <>
      {/* SLIDER */}
      <div className="mt-12 overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-sm text-white">
              {t("popularDestinations")}
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="flex transition-transform duration-1000"
            style={{ transform: `translateX(-${currentIndex * 280}px)` }}
          >
            {displayLocations.map((location, index) => (
              <div
                key={`${location.id || (location as any)._id}-${index}`}
                className="w-64 mx-2 shrink-0"
              >
                <div
                  onClick={() => setSelectedLocation(location)}
                  className="bg-white/10 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={
                        location.image ||
                        "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&auto=format&fit=crop&q=60"
                      }
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white">
                      {language === "vi"
                        ? location.nameVi || location.name
                        : location.nameEn || location.name}
                    </h3>
                    <div className="flex items-center gap-1 text-blue-100 text-sm">
                      <MapPin className="w-3 h-3" />
                      {location.routes || 10}+ {t("routes")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INDICATORS */}
        <div className="flex justify-center gap-2 mt-6">
          {locations.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full ${
                i === currentIndex % locations.length
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedLocation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedLocation(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full">
              <div className="p-6">
                <h3 className="mb-4 text-xl font-bold">
                  {language === "vi" ? "Tuyến phổ biến" : "Popular Routes"}
                </h3>

                {selectedLocation.popularRoutes?.map((route, i) => (
                  <div
                    key={i}
                    onClick={() => handleRouteSelect(route.from, route.to)}
                    className="p-4 rounded-xl bg-gray-100 hover:bg-blue-50 transition-colors cursor-pointer mb-3"
                  >
                    <div className="flex justify-between font-medium">
                      <span>
                        <Bus className="inline w-4 h-4 mr-1 text-blue-600" />
                        {route.from} → {route.to}
                      </span>
                      <span className="text-blue-600">{route.trips} trips</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2 text-gray-600">
                      <span>
                        <Clock className="inline w-4 h-4 mr-1" />
                        {route.duration}
                      </span>
                      <span className="font-bold text-teal-600">
                        <DollarSign className="inline w-4 h-4 mr-1" />
                        {route.price}
                      </span>
                    </div>
                  </div>
                ))}

                {(!selectedLocation.popularRoutes ||
                  selectedLocation.popularRoutes.length === 0) && (
                  <p className="text-gray-500 italic">
                    Đang cập nhật tuyến đường...
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
