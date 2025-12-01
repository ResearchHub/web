'use client';

import { useSearchParams } from 'next/navigation';

export function useUserListsEnabled(): boolean {
  //TODO: Enable it by hardcoding it to true for now
  return true;
  // const searchParams = useSearchParams();
  // return searchParams?.get('exp_list') === 'true';
}
