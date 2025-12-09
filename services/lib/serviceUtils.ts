import { ApiError } from '@/services/types/api';

export const isJsonParseError = (err: unknown): boolean =>
  err instanceof SyntaxError || (err instanceof Error && err.name === 'SyntaxError');

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
