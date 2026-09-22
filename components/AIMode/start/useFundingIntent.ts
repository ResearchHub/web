'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FundingIntent } from '@/components/Funding/fundingDirection';

const STORAGE_KEY = 'ai-mode:funding-intent';
/** Most people who open the workspace are researchers. */
const DEFAULT_INTENT: FundingIntent = 'need_funding';

const isIntent = (value: unknown): value is FundingIntent =>
  value === 'fund' || value === 'need_funding';

/**
 * The side of the fund / need-funding toggle a new conversation starts on:
 * whichever the user picked last, remembered per browser. Read after mount,
 * so the server and the first client render agree.
 */
export function useFundingIntent(): [FundingIntent, (intent: FundingIntent) => void] {
  const [intent, setIntentState] = useState<FundingIntent>(DEFAULT_INTENT);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isIntent(stored)) setIntentState(stored);
    } catch {
      // Storage may be unavailable; the default stands.
    }
  }, []);

  const setIntent = useCallback((next: FundingIntent) => {
    setIntentState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered this time; the choice still applies to this session.
    }
  }, []);

  return [intent, setIntent];
}
