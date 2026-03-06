import { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, Bus, Coffee, X, Check } from "lucide-react";
import { LocationType, type LocationResponse } from "@obtp/shared-types";
import { cn } from "@/lib/utils";

interface Props {
  locations: LocationResponse[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  error?: string;
  excludeIds?: string[];
}

export function LocationAutocomplete({
  locations,
  value,
  onChange,
  placeholder,
  error,
  excludeIds = [],
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLocation = useMemo(
    () => locations.find((loc) => (loc.id || loc._id) === value),
    [locations, value],
  );

  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return locations.filter((loc) => {
      const id = loc.id || loc._id;

      if (excludeIds.includes(id) && id !== value) return false;

      if (!term) return true;

      return (
        loc.name.toLowerCase().includes(term) ||
        loc.province.toLowerCase().includes(term)
      );
    });
  }, [locations, searchTerm, excludeIds, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTypeIcon = (type: LocationType) => {
    switch (type) {
      case LocationType.BUS_STATION:
        return <Bus size={14} className="text-blue-500" />;
      case LocationType.REST_STOP:
        return <Coffee size={14} className="text-orange-500" />;
      default:
        return <MapPin size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* KHU VỰC INPUT CHÍNH */}
      <div
        className={cn(
          "obtp-input flex items-center gap-3 cursor-pointer transition-all duration-200 min-h-[46px]",
          isOpen && "ring-2 ring-blue-500/20 border-blue-500 shadow-sm",
          error && "border-red-500 bg-red-50/10",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search
          size={18}
          className={cn(
            "shrink-0",
            isOpen ? "text-blue-500" : "text-slate-400",
          )}
        />

        {selectedLocation && !isOpen ? (
          <div className="flex-1 truncate flex items-center">
            <span className="font-bold text-slate-900 dark:text-white mr-2">
              {selectedLocation.name}
            </span>
            <span className="text-xs text-slate-500 italic">
              ({selectedLocation.province})
            </span>
          </div>
        ) : (
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400 p-0"
            placeholder={placeholder}
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Nút xóa nhanh giá trị */}
        {(value || searchTerm) && (
          <button
            type="button"
            className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-full text-slate-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setSearchTerm("");
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* DANH SÁCH GỢI Ý (DROPDOWN) */}
      {isOpen && (
        <div className="absolute z-100 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <MapPin size={24} className="text-slate-200" />
                <p className="text-sm text-slate-500 italic">
                  {searchTerm
                    ? "Không tìm thấy địa điểm phù hợp"
                    : "Tất cả địa điểm khả dụng đã được chọn"}
                </p>
              </div>
            ) : (
              filteredList.map((loc) => {
                const id = loc.id || loc._id;
                const isSelected = value === id;

                return (
                  <div
                    key={id}
                    className={cn(
                      "px-4 py-3 flex items-center justify-between cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-none transition-all",
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800",
                    )}
                    onClick={() => {
                      onChange(id);
                      setSearchTerm("");
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon loại địa điểm */}
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                          isSelected
                            ? "bg-white dark:bg-slate-700"
                            : "bg-slate-100 dark:bg-slate-800",
                        )}
                      >
                        {getTypeIcon(loc.type)}
                      </div>

                      {/* Thông tin Text */}
                      <div>
                        <div
                          className={cn(
                            "text-sm font-bold leading-tight",
                            isSelected
                              ? "text-blue-600"
                              : "text-slate-900 dark:text-white",
                          )}
                        >
                          {loc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                          {loc.province} •{" "}
                          {loc.type === LocationType.BUS_STATION
                            ? "Bến xe"
                            : loc.type === LocationType.REST_STOP
                              ? "Trạm dừng chân"
                              : "Địa điểm"}
                        </div>
                      </div>
                    </div>

                    {/* Dấu check cho item đang chọn */}
                    {isSelected && (
                      <div className="bg-blue-600 rounded-full p-1 shadow-blue-500/40 shadow-lg">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* THÔNG BÁO LỖI */}
      {error && (
        <p className="text-red-500 text-[11px] mt-1.5 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
}
