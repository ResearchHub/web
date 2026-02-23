'use client';

import { GrantProvider, useGrants } from '@/contexts/GrantContext';
import { GrantList } from '@/components/Funding/GrantList';
import { FundingPageTabs } from '@/components/Funding/FundingPageTabs';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';
import { FeedEntry } from '@/types/feed';

interface FundingPageContentProps {
  initialGrants?: FeedEntry[];
  closedGrants?: FeedEntry[];
  error?: string | null;
}

function FundingPageInner({
  closedGrants,
  error,
}: {
  closedGrants?: FeedEntry[];
  error?: string | null;
}) {
  const { grants, isLoading } = useGrants();

  if (error) {
    return (
      <>
        <FundingPageTabs />
        <div className="py-16 text-center text-red-500">{error}</div>
      </>
    );
  }

  return (
    <>
      <FundingPageTabs />
      {isLoading ? (
        <GrantCarouselSkeleton />
      ) : (
        <GrantList
          grants={grants}
          closedGrants={closedGrants}
          emptyMessage="No funding opportunities available right now."
        />
      )}
    </>
  );
}

export function FundingPageContent({
  initialGrants,
  closedGrants,
  error,
}: FundingPageContentProps) {
  return (
    <GrantProvider initialGrants={initialGrants}>
      <FundingPageInner closedGrants={closedGrants} error={error} />
    </GrantProvider>
  );
}
