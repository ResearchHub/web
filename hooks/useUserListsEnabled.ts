'use client';

import { useSearchParams } from 'next/navigation';

export function useUserListsEnabled(): boolean {
  const searchParams = useSearchParams();
  return searchParams?.get('exp_list') === 'true';
}
