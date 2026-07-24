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

const apiErrorMessageFields = ['error', 'detail', 'message', 'msg', 'non_field_errors'] as const;

function extractFirstMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;

  if (Array.isArray(value)) {
    return (
      value.find((item): item is string => typeof item === 'string' && Boolean(item.trim())) ?? null
    );
  }

  return null;
}

function extractMessageFromApiErrorBody(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null;

  const fields = errors as Record<string, unknown>;
  for (const field of apiErrorMessageFields) {
    const message = extractFirstMessage(fields[field]);
    if (message) return message;
  }

  return null;
}

export function extractApiErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof ApiError) {
    const bodyMessage = extractMessageFromApiErrorBody(error.errors);
    if (bodyMessage) return bodyMessage;

    const directMessage = extractFirstMessage((error as ApiError & { error?: unknown }).error);
    if (directMessage) return directMessage;

    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return defaultMessage;
}
