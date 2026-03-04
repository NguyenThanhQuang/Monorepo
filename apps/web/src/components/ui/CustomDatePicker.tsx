import { useRef } from "react";
import { Calendar } from "lucide-react";

export interface CustomDatePickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
}

export const CustomDatePicker = ({
  label,
  value,
  onChange,
  min,
  required,
}: CustomDatePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    const input = inputRef.current as any;

    if (!input) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch (e) {
        input.focus();
      }
    } else {
      input.focus();
    }
  };

  const formatDisplayDate = (date?: string) => {
    if (!date) return "Chọn ngày";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Chọn ngày" : d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
          {label}
        </label>
      )}

      <div
        onClick={handleContainerClick}
        className="relative group w-full cursor-pointer"
      >
        {/* DISPLAY */}
        <div className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl flex items-center font-medium transition-all group-hover:border-blue-500 group-hover:ring-2 group-hover:ring-blue-500/20">
          <Calendar className="absolute left-4 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span
            className={
              value ? "text-gray-900 dark:text-white" : "text-gray-400"
            }
          >
            {formatDisplayDate(value)}
          </span>
        </div>

        {/* REAL INPUT */}
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      </div>
    </div>
  );
};
