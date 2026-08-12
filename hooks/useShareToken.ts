'use client';

import { useSearchParams } from 'next/navigation';

import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';

export function useShareToken(): string | null {
  return useSearchParams().get(SHARE_TOKEN_PARAM);
}
