// src/utils/formatters.ts
export const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (compact && amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}tr`;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'HH:mm DD/MM/YYYY':
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phone;
};

export const formatSeatNumbers = (seats: string[]): string => {
  if (seats.length <= 3) {
    return seats.join(', ');
  }
  return `${seats.slice(0, 3).join(', ')} và ${seats.length - 3} ghế khác`;
};