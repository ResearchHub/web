'use client';

import { useMemo } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { buildPioneersFeedEntries } from '@/components/Journal/lib/pioneersFeed';

export function PioneersFeed() {
  const entries = useMemo(() => buildPioneersFeedEntries(), []);

  return (
    <FeedContent
      entries={entries}
      isLoading={false}
      hasMore={false}
      loadMore={() => {}}
      activeTab="pioneers"
      showPostHeaders={false}
      showGrantHeaders={false}
      showFundraiseHeaders={false}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">No publications yet</p>
        </div>
      }
    />
  );
}
