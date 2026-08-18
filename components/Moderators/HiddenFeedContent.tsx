'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { EyeOff, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { WorkPreviewCard } from '@/components/Activity/work/WorkPreviewCard';
import { useExcludedFromFeed } from '@/hooks/useExcludedFromFeed';
import { buildWorkUrl } from '@/utils/url';
import type { ActivityWork } from '@/components/Activity/lib/activityWork.utils';
import type { Work } from '@/types/work';

function toActivityWork(work: Work): ActivityWork | null {
  if (!work.id) {
    return null;
  }

  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    href: buildWorkUrl({
      id: work.id,
      slug: work.slug,
      contentType: work.contentType,
    }),
    imageUrl: work.image,
    documentType: work.contentType,
    unifiedDocumentId: work.unifiedDocumentId,
    fundraise: work.fundraise,
    grant: work.grantSummary,
    authors: work.authors?.map((authorship) => authorship.authorProfile),
  };
}

function HiddenFeedCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[14px] border border-gray-200 bg-white">
      <div className="relative h-[190px] overflow-hidden bg-gray-200 sm:h-[180px]">
        <div className="absolute inset-x-0 bottom-0 bg-black/40 px-4 pb-2 pt-2">
          <div className="h-3.5 w-3/4 rounded bg-white/30" />
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-gray-100 px-3 py-2">
        <div className="h-8 w-28 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function HiddenFeedContent() {
  const {
    items,
    isLoading,
    isLoadingMore,
    isRestoring,
    error,
    hasMore,
    query,
    setQuery,
    loadMore,
    refresh,
    restore,
  } = useExcludedFromFeed();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [workToRestore, setWorkToRestore] = useState<Work | null>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      void loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmRestore = async () => {
    const unifiedDocumentId = workToRestore?.unifiedDocumentId;
    if (unifiedDocumentId == null) {
      return;
    }
    const success = await restore(unifiedDocumentId);
    if (success) {
      setWorkToRestore(null);
    }
  };

  const emptyMessage = query.trim()
    ? 'No hidden documents match this search.'
    : 'No documents are currently hidden from public feeds.';

  return (
    <div className="flex h-full flex-col p-4">
      <div className="bg-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hidden from feed</h1>
            <p className="mt-1 text-sm text-gray-600">
              Restore documents that were hidden from feeds
            </p>
          </div>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden tablet:!block">Refresh</span>
          </Button>
        </div>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <Input
            icon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
            aria-label="Search hidden documents by title"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg text-red-500">{error.message}</p>
            <Button variant="outlined" size="sm" onClick={() => void handleRefresh()}>
              Retry
            </Button>
          </div>
        )}

        {isLoading && items.length === 0 && !error && (
          <div className="space-y-4">
            <HiddenFeedCardSkeleton />
            <HiddenFeedCardSkeleton />
            <HiddenFeedCardSkeleton />
          </div>
        )}

        {!isLoading && items.length === 0 && !error && (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <EyeOff className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No hidden documents</h3>
              <p className="max-w-md text-center text-gray-600">{emptyMessage}</p>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((work) => {
              const activityWork = toActivityWork(work);
              if (!activityWork) {
                return null;
              }

              return (
                <WorkPreviewCard
                  key={String(work.unifiedDocumentId ?? work.id)}
                  work={activityWork}
                >
                  <WorkPreviewCard.Actions>
                    <div className="flex justify-end">
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => setWorkToRestore(work)}
                        disabled={isRestoring}
                      >
                        Restore to feed
                      </Button>
                    </div>
                  </WorkPreviewCard.Actions>
                </WorkPreviewCard>
              );
            })}
          </div>
        )}

        {isLoadingMore && (
          <div className="mt-4 space-y-4">
            <HiddenFeedCardSkeleton />
          </div>
        )}

        {!isLoading && hasMore && <div ref={loadMoreRef} className="h-10" />}
      </div>

      <ConfirmationModal
        isOpen={workToRestore != null}
        onClose={() => {
          if (!isRestoring) {
            setWorkToRestore(null);
          }
        }}
        title="Restore to feed"
        description="This document and related entries will appear in public feeds again."
        confirmLabel="Restore to feed"
        isConfirming={isRestoring}
        onConfirm={handleConfirmRestore}
      />
    </div>
  );
}
