'use client';

import { FC, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { useGrants } from '@/contexts/GrantContext';

interface GrantsPageContentProps {
  initialGrants?: FeedEntry[];
}

export const GrantsPageContent: FC<GrantsPageContentProps> = ({ initialGrants }) => {
  const { grants, isLoading, fetchGrants, setInitialGrants } = useGrants();

  useEffect(() => {
    if (initialGrants && initialGrants.length > 0) {
      setInitialGrants(initialGrants);
    } else {
      fetchGrants();
    }
  }, [fetchGrants, setInitialGrants, initialGrants]);

  const entries = grants.length > 0 ? grants : (initialGrants ?? []);

  const header = (
    <div className="-mb-8">
      <PageHeader title="Awards" className="mb-2" />
    </div>
  );

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={false}
      loadMore={() => {}}
      header={header}
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No awards found</p>
        </div>
      }
    />
  );
};
