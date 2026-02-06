'use client';

import { ReactNode, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const PAGE_SIZE = 20;

interface Props<T> {
  readonly items: T[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  readonly renderItem: (item: T) => ReactNode;
  readonly renderSkeleton: () => ReactNode;
  readonly emptyState: ReactNode;
  readonly keyExtractor: (item: T) => string;
  readonly gap?: 'sm' | 'md';
}

export function InfiniteList<T>({
  items,
  isLoading,
  hasMore,
  loadMore,
  renderItem,
  renderSkeleton,
  emptyState,
  keyExtractor,
  gap = 'sm',
}: Props<T>) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' });
  const canLoadMore = hasMore && items.length >= PAGE_SIZE;
  const gapClass = gap === 'sm' ? 'space-y-3' : 'space-y-4';

  useEffect(() => {
    if (inView && canLoadMore && !isLoading) loadMore();
  }, [inView, canLoadMore, isLoading, loadMore]);

  if (isLoading && !items.length) {
    return (
      <div className={gapClass}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  if (!isLoading && !items.length) return emptyState;

  return (
    <div className={gapClass}>
      {items.map((item) => (
        <div key={keyExtractor(item)}>{renderItem(item)}</div>
      ))}
      {!isLoading && canLoadMore && <div ref={ref} className="h-10" />}
      {isLoading &&
        items.length > 0 &&
        Array.from({ length: 2 }, (_, i) => <div key={`loading-${i}`}>{renderSkeleton()}</div>)}
    </div>
  );
}
