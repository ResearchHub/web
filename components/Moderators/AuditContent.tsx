'use client';

import { FC, ReactNode } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { Button } from '@/components/ui/Button';
import { ChevronDown, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AuditItemCard } from './AuditItemCard';
import { AuditItemSkeleton } from './AuditItemSkeleton';
import { ID } from '@/types/root';

interface AuditContentProps {
  entries: FlaggedContent[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onDismiss: (flagIds: ID[]) => Promise<boolean>;
  onRemove: (flagIds: ID[]) => Promise<boolean>;
  header?: ReactNode;
  filters?: ReactNode;
  noEntriesElement?: ReactNode;
  error?: Error | null;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditContent: FC<AuditContentProps> = ({
  entries,
  isLoading,
  isLoadingMore = false,
  hasMore,
  loadMore,
  onDismiss,
  onRemove,
  header,
  filters,
  noEntriesElement,
  error,
  view,
}) => {
  const handleAction = async (action: 'dismiss' | 'remove', flagId: ID) => {
    switch (action) {
      case 'dismiss':
        await onDismiss([flagId]);
        break;
      case 'remove':
        await onRemove([flagId]);
        break;
    }
  };

  const renderAuditEntry = (entry: FlaggedContent, index: number) => {
    const spacingClass = index !== 0 ? 'mt-6' : '';

    return (
      <div key={entry.id} className={spacingClass}>
        <AuditItemCard
          entry={entry}
          onAction={(action) => handleAction(action, entry.id)}
          view={view}
        />
      </div>
    );
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading content</h3>
          <p className="text-gray-600 text-center max-w-md">
            {error.message ?? 'An error occurred while loading flagged content.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      {header && <div className="mb-6">{header}</div>}

      {/* Filters */}
      {filters && <div className="mb-6">{filters}</div>}

      {/* Content */}
      <div className="space-y-6">
        {/* Show empty state if no entries and not loading */}
        {entries.length === 0 && !isLoading && (
          <div className="text-center py-12">
            {noEntriesElement ?? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600 text-center max-w-md">
                  No flagged content requires your attention at the moment. Great job keeping the
                  community safe!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Render entries */}
        {entries.map(renderAuditEntry)}

        {/* Loading skeleton */}
        {isLoading && entries.length === 0 && (
          <div className="space-y-6">
            <AuditItemSkeleton key="skeleton-1" view={view} />
            <AuditItemSkeleton key="skeleton-2" view={view} />
            <AuditItemSkeleton key="skeleton-3" view={view} />
          </div>
        )}
      </div>

      {/* Load more button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outlined"
            className="flex items-center space-x-2"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Load More</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
