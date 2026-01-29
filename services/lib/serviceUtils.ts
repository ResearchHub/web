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
    const errors = error.errors as any;
    if (errors?.error) {
      const errorMsg = errors.error;
      if (Array.isArray(errorMsg) && errorMsg.length > 0) return errorMsg[0];
      if (typeof errorMsg === 'string') return errorMsg;
    }
    if ((error as any).error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
  }
  if (error instanceof Error) return error.message;
  return defaultMessage;
}
