'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

export { isClassicHomeFeedPath } from '@/constants/navigation';

export function useHomeHref() {
  const { status } = useSession();

  return useMemo(() => {
    if (status === 'authenticated') return '/for-you';
    if (status === 'unauthenticated') return '/popular';

    return '/';
  }, [status]);
}
