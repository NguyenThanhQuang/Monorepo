import type dayjs from "dayjs";

// utils/typeGuards.ts
export function isNotNullOrEmpty<T>(value: T | null | undefined): value is T {
  if (typeof value === 'string') {
    return value !== null && value !== undefined && value.trim() !== '';
  }
  return value !== null && value !== undefined;
}

export function assertIsString(value: any, message?: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(value: any, message?: string): asserts value is number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(message || `Expected number, got ${typeof value}`);
  }
}

export function assertIsDayjs(value: any, message?: string): asserts value is dayjs.Dayjs {
  if (!value || !value.isValid || !value.isValid()) {
    throw new Error(message || `Expected valid Dayjs object`);
  }
}

// Helper để chuyển đổi string | null thành string
export function toStringOrEmpty(value: string | null | undefined): string {
  return value || '';
}

// Helper để chuyển đổi string | null thành string với fallback
export function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value !== null && value !== undefined ? value : defaultValue;
}