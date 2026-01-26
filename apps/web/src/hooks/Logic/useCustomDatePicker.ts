import { useRef } from 'react';

interface UseCustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export function useCustomDatePicker({
  value,
  onChange,
}: UseCustomDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return 'dd/mm/yyyy';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleContainerClick = () => {
    if (!inputRef.current) return;

    try {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Không thể mở lịch:', error);
    }
  };

  const handleChange = (value: string) => {
    onChange(value);
  };

  return {
    inputRef,
    formatDisplayDate,
    handleContainerClick,
    handleChange,
  };
}
