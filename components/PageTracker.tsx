'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';
import AnalyticsService from '@/services/analytics.service';

export function PageTracker() {
  const pathname = usePathname();
  const { status } = useSession();
  const { user, isLoading } = useUser();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    // Only track page view if pathname has actually changed
    if (previousPathname.current !== pathname && status !== 'loading' && !isLoading) {
      const pageName = document.title;
      AnalyticsService.page(pageName, {
        page_path: pathname,
        user_status: status,
        user_id: user?.id,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, status, isLoading]);

  return null;
}
