'use client';

import { useSearchParams } from 'next/navigation';

import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';

/**
 * Client-side counterpart to `getShareToken()`, read straight from the URL.
 *
 * Used to keep the token on links and history entries so a visitor holding one
 * does not lose access by navigating within the proposal.
 */
export function useShareToken(): string | null {
  return useSearchParams().get(SHARE_TOKEN_PARAM);
}
