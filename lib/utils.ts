import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumberOrNull(value: any): number | null {
  const num = Number(value);

  return Number.isFinite(num) ? num : null;
}

// ================== HOOK UTILS ==================

/**
 * Common hook state for async functions.
 */
export type AsyncState = {
  isLoading: boolean;
  error: Error | null;
};

/**
 * Common hook state for paginated functions.
 */
export type PaginatedState = {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
};

// ================= SERVICE UTILS =================

/**
 * Default shape for paginated results.
 * Extend this as needed (handling of the `results`, etc.).
 */
export interface PaginatedResult {
  count: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Default pagination params for paginated endpoints.
 */
export type PaginatedParams = {
  page?: number;
  pageSize?: number;
};

/**
 * Default pagination query params for paginated endpoints.
 */
export function getPaginatedQueryParams(
  params: PaginatedParams,
  as_string: boolean = false
): URLSearchParams | string {
  const queryParams = new URLSearchParams();

  if (params.page) {
    queryParams.append('page', params.page.toString());
  }

  if (params.pageSize) {
    queryParams.append('page_size', params.pageSize.toString());
  }

  return as_string ? queryParams.toString() : queryParams;
}
