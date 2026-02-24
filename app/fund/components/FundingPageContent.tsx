'use client';

import { useEffect } from 'react';
import { useGrants } from '@/contexts/GrantContext';
import { GrantList } from '@/components/Funding/GrantList';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';
import { FeedEntry } from '@/types/feed';

interface FundingPageContentProps {
  initialGrants?: FeedEntry[];
  closedGrants?: FeedEntry[];
  error?: string | null;
}

export function FundingPageContent({
  initialGrants,
  closedGrants,
  error,
}: FundingPageContentProps) {
  const { grants, isLoading, setInitialGrants } = useGrants();

  useEffect(() => {
    if (initialGrants && initialGrants.length > 0) {
      setInitialGrants(initialGrants);
    }
  }, [initialGrants, setInitialGrants]);

  if (error) {
    return <div className="py-16 text-center text-red-500">{error}</div>;
  }

  const displayGrants = grants.length > 0 ? grants : initialGrants || [];

  return isLoading && displayGrants.length === 0 ? (
    <GrantCarouselSkeleton />
  ) : (
    <GrantList
      grants={displayGrants}
      closedGrants={closedGrants}
      emptyMessage="No funding opportunities available right now."
    />
  );
}
