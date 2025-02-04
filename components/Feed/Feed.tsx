'use client';

import { FC, useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedTabs } from './FeedTabs';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedItem } from './FeedItem';
import { Sparkles } from 'lucide-react';
import { FeedService } from '@/services/feed.service';

type FeedTab = 'for-you' | 'following' | 'popular' | 'latest';

export const Feed: FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadFeed = async () => {
      setIsLoading(true);
      try {
        const result = await FeedService.getFeed({
          page: 1,
          pageSize: 20,
          action: activeTab === 'following' ? 'follow' : undefined,
        });
        setEntries(result.entries);
        setHasMore(result.hasMore);
        setPage(1);
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, [activeTab]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    try {
      const nextPage = page + 1;
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        action: activeTab === 'following' ? 'follow' : undefined,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more feed items:', error);
    }
  };

  const sortEntries = (entries: FeedEntry[]) => {
    switch (activeTab) {
      case 'popular':
        return [...entries].sort((a, b) => {
          const getMetricScore = (entry: FeedEntry) => {
            const metrics = entry.metrics || { votes: 0, comments: 0 };
            return (metrics.votes || 0) + (metrics.comments || 0);
          };
          return getMetricScore(b) - getMetricScore(a);
        });
      case 'latest':
        return [...entries].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      default:
        return entries;
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Discover the latest research, earning, and funding opportunities
          </h2>
        </div>

        <div className="border-b border-gray-100">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="mt-8 space-y-6">
          {sortEntries(entries).map((entry, index) => (
            <FeedItem key={entry.id} entry={entry} isFirst={index === 0} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Feed;
