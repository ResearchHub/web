'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { EyeOff, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { FeedEntryItem } from '@/components/Feed/FeedEntryItem';
import { useExcludedFromFeed } from '@/hooks/useExcludedFromFeed';
import type { FeedEntry } from '@/types/feed';

const noopRegisterVisibleItem = (_index: number, _unifiedDocumentId: string) => {};
const noopGetVisibleItems = (_clickedUnifiedDocumentId: string) => [] as string[];

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
  const [entryToRestore, setEntryToRestore] = useState<FeedEntry | null>(null);
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
    if (entryToRestore == null) {
      return;
    }
    const success = await restore(entryToRestore.id);
    if (success) {
      setEntryToRestore(null);
    }
  };

  const emptyMessage = query.trim()
    ? 'No hidden feed entries match this search.'
    : 'No feed entries are currently hidden from public feeds.';

  return (
    <div className="flex h-full flex-col p-4">
      <div className="bg-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hidden from feed</h1>
            <p className="mt-1 text-sm text-gray-600">
              Restore feed entries that were hidden from public feeds
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
            aria-label="Search hidden feed entries by title"
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
              <h3 className="mb-2 text-lg font-medium text-gray-900">No hidden feed entries</h3>
              <p className="max-w-md text-center text-gray-600">{emptyMessage}</p>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((entry, index) => (
              <div
                key={entry.id}
                className="overflow-hidden rounded-[14px] border border-gray-200 bg-white"
              >
                <FeedEntryItem
                  entry={entry}
                  index={index}
                  hideActions
                  registerVisibleItem={noopRegisterVisibleItem}
                  unregisterVisibleItem={noopRegisterVisibleItem}
                  getVisibleItems={noopGetVisibleItems}
                />
                <div className="flex justify-end border-t border-gray-100 px-3 py-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setEntryToRestore(entry)}
                    disabled={isRestoring}
                  >
                    Restore to feed
                  </Button>
                </div>
              </div>
            ))}
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
        isOpen={entryToRestore != null}
        onClose={() => {
          if (!isRestoring) {
            setEntryToRestore(null);
          }
        }}
        title="Restore to feed"
        description="This feed entry will appear in public feeds again."
        confirmLabel="Restore to feed"
        isConfirming={isRestoring}
        onConfirm={handleConfirmRestore}
      />
    </div>
  );
}
