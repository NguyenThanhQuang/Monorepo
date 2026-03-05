import { useRef } from 'react';

interface UseCustomDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export const useCustomDatePicker = ({
  onChange,
}: UseCustomDatePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  const handleChange = (val: string) => {
    onChange(val);
  };

  const formatDisplayDate = (date?: string) => {
    if (!date) return 'Chọn ngày';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return {
    inputRef,
    formatDisplayDate,
    handleContainerClick,
    handleChange,
  };
};
