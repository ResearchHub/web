'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useGrants } from '@/contexts/GrantContext';
import { GrantCarousel } from '@/components/Funding/GrantCarousel';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';

export default function FundingPage() {
  const { grants, isLoading } = useGrants();

  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      {isLoading ? (
        <div className="py-4">
          <div className="space-y-2 mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-5 border-b border-gray-200 last:border-b-0">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="flex gap-3">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="flex-shrink-0 w-[280px] h-[220px] bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4">
          <div className="">
            {grants.map((grant) => (
              <GrantCarousel key={grant.id} grant={grant} />
            ))}
          </div>

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
