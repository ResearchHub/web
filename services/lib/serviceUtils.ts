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

/** Message from a parsed API error body: `error` (string or array) or DRF `detail`. */
function messageFromApiErrorBody(errors: any): string | null {
  const errorMsg = errors?.error;
  if (Array.isArray(errorMsg) && errorMsg.length > 0) return errorMsg[0];
  if (typeof errorMsg === 'string' && errorMsg) return errorMsg;
  if (typeof errors?.detail === 'string' && errors.detail.trim()) return errors.detail;
  return null;
}

export function extractApiErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof ApiError) {
    const bodyMessage = messageFromApiErrorBody(error.errors);
    if (bodyMessage) return bodyMessage;
    if ((error as any).error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
  }
  if (error instanceof Error) return error.message;
  return defaultMessage;
}

/**
 * Stable machine-readable `code` from an ApiError payload (full JSON is passed
 * as ApiError.errors). Used for mailbox / outreach flows, e.g.
 * `mailbox_not_allowed`, `gmail_not_connected`, `gmail_needs_reauth`.
 */
export function getApiErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.errors == null || typeof error.errors !== 'object') {
    return null;
  }
  const code = (error.errors as Record<string, unknown>).code;
  if (typeof code === 'string' && code.trim()) return code.trim();
  if (Array.isArray(code) && typeof code[0] === 'string' && code[0].trim()) {
    return code[0].trim();
  }
  return null;
}
