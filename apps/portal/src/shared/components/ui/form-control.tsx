import React from "react";
import { cn } from "../../utils/cn";

interface FormControlProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormControl = ({
  label,
  error,
  children,
  className,
}: FormControlProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
