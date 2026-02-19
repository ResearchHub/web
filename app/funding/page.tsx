'use client';

import { useMemo } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { GrantCarousel } from '@/components/Funding/GrantCarousel';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';

function formatCompactUSD(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export default function FundingPage() {
  const { grants, isLoading } = useGrants();

  const stats = useMemo(() => {
    let totalUSD = 0;
    let openCount = 0;

    for (const grant of grants) {
      const c = grant.content as FeedGrantContent;
      if (c.grant?.amount?.usd) totalUSD += c.grant.amount.usd;
      if (c.grant?.isActive) openCount++;
    }

    return { totalUSD, openCount };
  }, [grants]);

  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      {isLoading ? (
        <div className="space-y-10 py-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-4">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="flex-shrink-0 w-[320px] h-[280px] bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formatCompactUSD(stats.totalUSD)} in funding available
            </h1>
            <p className="text-gray-500 mt-1">
              {stats.openCount} open funding{' '}
              {stats.openCount === 1 ? 'opportunity' : 'opportunities'}
            </p>
          </div>

          {grants.map((grant) => (
            <GrantCarousel key={grant.id} grant={grant} />
          ))}

          {grants.length === 0 && (
            <p className="text-center text-gray-400 py-16">
              No funding opportunities available right now.
            </p>
          )}
        </div>
      )}
    </PageLayout>
  );
}
