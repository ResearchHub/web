'use client';

import { FC, useMemo } from 'react';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { FeedEntry } from '@/types/feed';
import { GrantWithMetadata } from '@/store/grantStore';

export type GrantTab = 'open' | 'closed' | 'all';

interface GrantsFeedProps {
  grants: GrantWithMetadata[];
  activeTab: GrantTab;
  isLoading?: boolean;
}

export const GrantsFeed: FC<GrantsFeedProps> = ({ grants, activeTab, isLoading }) => {
  // Filter grants based on active tab
  const filteredGrants = useMemo(() => {
    switch (activeTab) {
      case 'open':
        return grants.filter((grant) => grant.metadata.fundraising?.status === 'OPEN');
      case 'closed':
        return grants.filter((grant) => grant.metadata.fundraising?.status === 'CLOSED');
      case 'all':
      default:
        return grants;
    }
  }, [grants, activeTab]);

  // Convert grants to FeedEntry format for compatibility with FeedItemFundraise
  const grantFeedEntries: FeedEntry[] = useMemo(() => {
    return filteredGrants.map((grant) => ({
      id: grant.work.id.toString(),
      timestamp: grant.work.createdDate,
      action: 'publish',
      contentType: 'PREREGISTRATION',
      content: {
        id: grant.work.id,
        contentType: 'PREREGISTRATION',
        createdDate: grant.work.createdDate,
        textPreview: grant.work.abstract || '',
        slug: grant.work.slug || '',
        title: grant.work.title,
        authors: grant.work.authors?.map((author) => author.authorProfile) || [],
        topics: grant.work.topics || [],
        createdBy: grant.work.authors?.[0]?.authorProfile || {
          id: 0,
          fullName: 'Unknown',
          profileImage: '',
          headline: '',
          profileUrl: '#',
          isClaimed: false,
        },
        fundraise: grant.metadata.fundraising,
        reviews: [],
        bounties: [],
      },
      metrics: grant.metadata.metrics,
      userVote: undefined,
      raw: undefined,
    }));
  }, [filteredGrants]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredGrants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          {activeTab === 'open' && 'No open grants available'}
          {activeTab === 'closed' && 'No closed grants found'}
          {activeTab === 'all' && 'No grants available'}
        </div>
        <p className="text-gray-400 text-sm">
          {activeTab === 'open' && 'Check back later for new funding opportunities.'}
          {activeTab === 'closed' && 'All grants are currently open for applications.'}
          {activeTab === 'all' && 'Grant opportunities will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grantFeedEntries.map((entry) => (
        <FeedItemFundraise
          key={entry.id}
          entry={entry}
          href={`/grant/${entry.content.id}/${(entry.content as any).slug}`}
          showTooltips={true}
          badgeVariant="default"
          showActions={true}
          customActionText="is offering funding"
        />
      ))}
    </div>
  );
};
