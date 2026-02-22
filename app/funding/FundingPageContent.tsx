'use client';

import { useGrants } from '@/contexts/GrantContext';
import { GrantList } from '@/components/Funding/GrantList';
import { FundingPageTabs } from '@/components/Funding/FundingPageTabs';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';

export function FundingPageContent() {
  const { grants, isLoading } = useGrants();

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
