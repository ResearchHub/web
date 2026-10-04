import { extractApiErrorMessage, getApiErrorCode } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types/api';

const GMAIL_CONNECT_CODES = new Set(['gmail_not_connected', 'gmail_needs_reauth']);

/** True when send/preview failed because Gmail is missing or needs reauth (HTTP 409). */
export function isGmailConnectRequiredError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  const code = getApiErrorCode(error);
  return code != null && GMAIL_CONNECT_CODES.has(code);
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function readRateLimitFields(error: ApiError): {
  remainingToday: number | null;
  dailyCap: number | null;
  usedToday: number | null;
  requested: number | null;
} {
  const payload = error.errors;
  if (payload == null || typeof payload !== 'object') {
    return { remainingToday: null, dailyCap: null, usedToday: null, requested: null };
  }
  const record = payload as Record<string, unknown>;
  return {
    remainingToday: asFiniteNumber(
      record.remaining_today ?? record.remaining ?? record.remaining_quota ?? record.quota_remaining
    ),
    dailyCap: asFiniteNumber(record.daily_cap),
    usedToday: asFiniteNumber(record.used_today),
    requested: asFiniteNumber(record.requested),
  };
}

/**
 * User-facing toast/alert copy for send/preview failures.
 * Prefer payload quota fields on 429; map mailbox 409 codes to connect guidance.
 */
export function getOutreachSendErrorMessage(
  error: unknown,
  fallback = 'Failed to send emails'
): string {
  if (error instanceof ApiError && error.status === 429) {
    const { remainingToday, dailyCap, usedToday, requested } = readRateLimitFields(error);
    if (remainingToday != null && dailyCap != null) {
      return `Daily send limit reached (${usedToday ?? dailyCap - remainingToday}/${dailyCap} used). ${remainingToday} left today.`;
    }
    if (remainingToday != null) {
      return `Daily send limit reached. Remaining today: ${remainingToday}.`;
    }
    if (requested != null && remainingToday === 0) {
      return `Daily send limit reached. Cannot send ${requested} more today.`;
    }
    return extractApiErrorMessage(error, 'Daily send limit reached. Please try again later.');
  }

  if (error instanceof ApiError && error.status === 409) {
    if (getApiErrorCode(error) === 'outreach_bulk_in_progress') {
      return extractApiErrorMessage(
        error,
        'A bulk send is already in progress. Wait for it to finish, or send a single email.'
      );
    }
  }

  if (isGmailConnectRequiredError(error)) {
    if (getApiErrorCode(error) === 'gmail_needs_reauth') {
      return 'Gmail needs to be reconnected before you can send.';
    }
    return 'Connect Gmail in Settings before you can send.';
  }

  return extractApiErrorMessage(error, fallback);
}
