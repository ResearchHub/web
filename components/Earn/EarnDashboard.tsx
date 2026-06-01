'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { EarnEarningsSummary } from './EarnEarningsSummary';
import { EarnOpportunities } from './EarnOpportunities';

export const EARN_BOUNTIES_ANCHOR = 'earn-bounties';

export function EarnDashboard() {
  const { status } = useSession();

  const scrollToBounties = useCallback(() => {
    const target = document.getElementById(EARN_BOUNTIES_ANCHOR);
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, []);

  if (status === 'loading') {
    return (
      <div className="mb-6 space-y-6">
        <div className="h-40 w-full bg-gray-100 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-6">
      {status === 'authenticated' && <EarnEarningsSummary />}
      <EarnOpportunities onBrowse={scrollToBounties} />
    </div>
  );
}
