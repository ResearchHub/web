'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';
import AnalyticsService from '@/services/analytics.service';

export function PageTracker() {
  const pathname = usePathname();
  const { status } = useSession();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (status !== 'loading' && !isLoading) {
      const pageName = document.title;
      AnalyticsService.page(pageName, {
        page_path: pathname,
        user_status: status,
        user_id: user?.id,
      });
    }
  }, [pathname, status, isLoading]);

  return null;
}
