'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function useUserListsEnabled(): boolean {
  const searchParams = useSearchParams();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const urlParam = searchParams?.get('user_list') === 'true';

    const sessionEnabled =
      typeof window !== 'undefined' && sessionStorage.getItem('user_lists_enabled') === 'true';

    if (urlParam) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user_lists_enabled', 'true');
      }
      setIsEnabled(true);
    } else if (sessionEnabled) {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [searchParams]);

  return isEnabled;
}
