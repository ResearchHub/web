import { ApiError } from '@/services/types/api';
import { ID } from '@/types/root';

export const isJsonParseError = (err: unknown): boolean =>
  err instanceof SyntaxError || (err instanceof Error && err.name === 'SyntaxError');

// eslint-disable-next-line eqeqeq
export const idMatch = (a: ID, b: ID) => a == b;

/**
 * Rounds an RSC amount to 3 decimal places.
 * Used to ensure API compatibility when sending RSC amounts to the backend.
 *
 * @param amount The RSC amount to round
 * @returns The amount rounded to 3 decimal places
 */
export const roundRscAmount = (amount: number): number => {
  return Math.round(amount * 1000) / 1000;
};

export function extractApiErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof ApiError) {
    const errors = error.errors as Record<string, unknown> | undefined;
    const fields = ['error', 'detail', 'message', 'msg', 'non_field_errors'];

    for (const field of fields) {
      const value = errors?.[field];
      if (typeof value === 'string' && value) return value;
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    }

    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return defaultMessage;
}
