'use client'

import { FC, useState } from 'react';
import { feedEntries } from '@/store/feedStore';
import { FeedEntry } from '@/types/feed';
import { FeedTabs } from './FeedTabs';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedItem } from './FeedItem';
import { Sparkles } from 'lucide-react';

type FeedTab = 'for-you' | 'following' | 'popular' | 'latest';

export const Feed: FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');

  const getFeedContent = () => {
    switch (activeTab) {
      case 'for-you':
        return feedEntries; // Original order
      case 'following':
        return [...feedEntries].sort((a, b) => 
          a.content.actor.fullName.localeCompare(b.content.actor.fullName)
        );
      case 'popular':
        return [...feedEntries].sort((a, b) => {
          const getMetricScore = (entry: FeedEntry) => {
            const metrics = entry.metrics || { votes: 0, comments: 0 };
            return (metrics.votes || 0) + (metrics.comments || 0);
          };
          return getMetricScore(b) - getMetricScore(a);
        });
      case 'latest':
        return [...feedEntries].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      default:
        return feedEntries;
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="pt-4 pb-7">
          <h2 className="text-lg text-gray-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Discover the latest research, earning, and funding opportunities
          </h2>
        </div>

        <div className="border-b border-gray-100">
          <FeedTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="mt-8 space-y-6">
          {getFeedContent().map((entry, index) => (
            <FeedItem 
              key={entry.id} 
              entry={entry} 
              isFirst={index === 0}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Feed; 