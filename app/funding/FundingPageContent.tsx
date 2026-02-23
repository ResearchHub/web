'use client';

import { GrantProvider, useGrants } from '@/contexts/GrantContext';
import { GrantList } from '@/components/Funding/GrantList';
import { FundingPageTabs } from '@/components/Funding/FundingPageTabs';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';
import { FeedEntry } from '@/types/feed';

interface FundingPageContentProps {
  initialGrants?: FeedEntry[];
  error?: string | null;
}

function FundingPageInner({ error }: { error?: string | null }) {
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
        <GrantList grants={grants} emptyMessage="No funding opportunities available right now." />
      )}
    </>
  );
}

export function FundingPageContent({ initialGrants, error }: FundingPageContentProps) {
  return (
    <GrantProvider initialGrants={initialGrants}>
      <FundingPageInner error={error} />
    </GrantProvider>
  );
}
