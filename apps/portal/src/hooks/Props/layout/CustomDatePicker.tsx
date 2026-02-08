export interface CustomDatePickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
}
