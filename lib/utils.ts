import { clsx, type ClassValue } from 'clsx';
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
