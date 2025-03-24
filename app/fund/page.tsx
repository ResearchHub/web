'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { HandCoins } from 'lucide-react';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useState } from 'react';

export default function FundingPage() {
  const [activeTab] = useState<'latest'>('latest');
  const { entries, isLoading, hasMore, loadMore } = useFeed(activeTab, {
    contentType: 'PREREGISTRATION',
  });

  const header = (
    <h2 className="text-xl text-gray-600 flex items-center gap-2">
      <HandCoins className="w-5 h-5 text-indigo-500" />
      Fund breakthrough research shaping tomorrow
    </h2>
  );

  return (
    <PageLayout>
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
      />
    </PageLayout>
  );
}
