import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumberOrNull(value: any): number | null {
  const num = Number(value);

  return Number.isFinite(num) ? num : null;
}

/**
 * Common hook state for async operations
 */
export type AsyncState = {
  isLoading: boolean;
  error: Error | null;
};
