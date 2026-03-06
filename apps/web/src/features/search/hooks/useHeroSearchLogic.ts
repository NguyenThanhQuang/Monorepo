import { useLanguage } from "@/contexts/LanguageContext";
import { locationsApi } from "@obtp/api-client";
import type { Location } from "@obtp/shared-types";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface UseHeroSearchLogicProps {
  onSearch?: (params: {
    fromProvince: string;
    toProvince: string;
    date?: string;
  }) => void;
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
    initialFrom ? `${initialFrom.name}, ${initialFrom.province}` : "",
  );
  const [toText, setToText] = useState(
    initialTo ? `${initialTo.name}, ${initialTo.province}` : "",
  );

  const [fromLocation, setFromLocation] = useState<Location | null>(
    initialFrom,
  );
  const [toLocation, setToLocation] = useState<Location | null>(initialTo);

  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const loadAllFromLocations = async () => {
    try {
      const res = await locationsApi.search("");
      setFromSuggestions(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error loading from locations:", error);
      setFromSuggestions([]);
      toast.error(
        t("errorLoadingLocations") || "Không thể tải danh sách địa điểm",
      );
    }
  };

  const loadAllToLocations = async () => {
    try {
      const res = await locationsApi.search("");
      setToSuggestions(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error loading to locations:", error);
      setToSuggestions([]);
      toast.error(
        t("errorLoadingLocations") || "Không thể tải danh sách địa điểm",
      );
    }
  };

  useEffect(() => {
    if (!fromText) {
      setFromSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await locationsApi.search(fromText);
        setFromSuggestions(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Error searching from locations:", error);
        setFromSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fromText]);

  useEffect(() => {
    if (!toText) {
      setToSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await locationsApi.search(toText);
        setToSuggestions(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Error searching to locations:", error);
        setToSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [toText]);

  const handleSearch = () => {
    if (!fromLocation) {
      toast.error(t("selectDepartureFirst") || "Vui lòng chọn điểm đi");
      return;
    }
    if (!toLocation) {
      toast.error(t("selectDestinationFirst") || "Vui lòng chọn điểm đến");
      return;
    }

    const fromId = fromLocation.id || (fromLocation as any)._id;
    const toId = toLocation.id || (toLocation as any)._id;

    if (fromId && toId && fromId === toId) {
      toast.error(
        t("sameLocation") || "Điểm đi và điểm đến không thể giống nhau",
        { duration: 3000, position: "top-center", icon: "🔄" },
      );
      return;
    }

    const finalDate = date || new Date().toISOString().split("T")[0];

    const loadingToast = toast.loading(t("searching") || "Đang tìm kiếm...", {
      position: "top-center",
    });

    try {
      onSearch?.({
        fromProvince: fromLocation.province,
        toProvince: toLocation.province,
        date: finalDate,
      });

      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(t("searchError") || "Có lỗi xảy ra khi tìm kiếm", {
        duration: 3000,
        position: "top-center",
        icon: "❌",
      });
    }
  };

  const handleSwap = () => {
    if (!fromLocation && !toLocation) return;

    const tempLoc = fromLocation;
    setFromLocation(toLocation);
    setToLocation(tempLoc);

    setFromText(toLocation ? `${toLocation.name}, ${toLocation.province}` : "");
    setToText(
      fromLocation ? `${fromLocation.name}, ${fromLocation.province}` : "",
    );

    toast.success(t("swapSuccess") || "Đã hoán đổi điểm đi và điểm đến");
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
