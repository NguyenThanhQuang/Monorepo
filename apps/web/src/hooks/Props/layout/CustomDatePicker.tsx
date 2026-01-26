export interface CustomDatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  min?: string;
  required?: boolean;
}
