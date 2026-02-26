import React from "react";
import { cn } from "../../utils/cn";

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  error?: string;
  label?: string;
}

export const SearchSelect = React.forwardRef<
  HTMLSelectElement,
  SearchSelectProps
>(({ className, options, error, label, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            error && "border-red-500",
            className,
          )}
          ref={ref}
          {...props}
        >
          <option value="" disabled selected>
            Chọn một tùy chọn...
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.subLabel ? `(${opt.subLabel})` : ""}
            </option>
          ))}
        </select>
        {/* Mũi tên Custom */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
SearchSelect.displayName = "SearchSelect";
