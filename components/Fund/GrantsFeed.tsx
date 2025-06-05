'use client';

import { FC, useMemo } from 'react';
import { GrantWithMetadata } from '@/store/grantStore';
import { FeedItemGrant } from './FeedItemGrant';

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
    <div className="space-y-6">
      {filteredGrants.map((grant) => (
        <FeedItemGrant
          key={grant.work.id}
          grant={grant}
          href={`/grant/${grant.work.id}/${grant.work.slug}`}
          showHeader={false}
        />
      ))}
    </div>
  );
};
