import { Calendar } from 'lucide-react';
import { useCustomDatePicker } from '../../../hooks/Logic/useCustomDatePicker';
import type { CustomDatePickerProps } from '../../../hooks/Props/layout/CustomDatePicker';


export const CustomDatePicker = ({
  label,
  value,
  onChange,
  min,
  required,
}: CustomDatePickerProps) => {
  const {
    inputRef,
    formatDisplayDate,
    handleContainerClick,
    handleChange,
  } = useCustomDatePicker({ value, onChange });

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
              value
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400'
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
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      </div>
    </div>
  );
};
