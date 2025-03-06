'use client';

import { FundingRequestCard } from '@/components/Feed/FundingRequestCard';
import { FeedPreregistrationSkeleton } from '@/components/skeletons/FeedPreregistrationSkeleton';
import { FundingRequest, FeedEntry } from '@/types/feed';
import { ContentMetrics } from '@/types/metrics';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ArrowUpFromLine, Sparkles } from 'lucide-react';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { useFundingFeed } from '@/hooks/useFundingFeed';

export default function FundingPage() {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const router = useRouter();
  const { entries, isLoading, hasMore, loadMore } = useFundingFeed();

  const handleNavigate = useCallback(() => {
    router.push('/notebook');
  }, [router]);

  const handleLabNotebookClick = useCallback(() => {
    executeAuthenticatedAction(handleNavigate);
  }, [executeAuthenticatedAction, handleNavigate]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="space-y-8">
        {/* Header */}
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Request funding for research experiments
          </h2>
        </div>

        {/* Header with button */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 text-indigo-600">
                <ArrowUpFromLine className="w-4 h-4" />
                <span className="font-medium">Research Grants</span>
                <Badge variant="default" size="sm" className="ml-1 bg-gray-100 text-gray-700">
                  {entries.length}
                </Badge>
              </div>
            </div>
            <Button
              variant="outlined"
              size="default"
              className="text-indigo-500 border-indigo-500 hover:text-indigo-600 hover:bg-indigo-100 font-medium min-w-[160px] justify-center"
              onClick={handleLabNotebookClick}
            >
              Request Funding
            </Button>
          </div>
        </div>

        {/* Feed Content */}
        <div className="max-w-4xl mx-auto">
          {isLoading && entries.length === 0 ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <FeedPreregistrationSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry: FeedEntry) => (
                <FundingRequestCard
                  key={entry.id}
                  content={entry.content as FundingRequest}
                  metrics={entry.metrics || { votes: 0, comments: 0, reposts: 0, saves: 0 }}
                />
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outlined"
                    size="default"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="min-w-[160px] justify-center"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}

              {!isLoading && entries.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No funding requests available at this time.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
