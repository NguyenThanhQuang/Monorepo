import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  className = "",
  size = 20,
}) => {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
};
