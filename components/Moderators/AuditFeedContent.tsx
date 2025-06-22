'use client';

import { FC, ReactNode } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { Button } from '@/components/ui/Button';
import { ChevronDown, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AuditItemCard } from './AuditItemCard';
import { ID } from '@/types/root';

interface AuditFeedContentProps {
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

export const AuditFeedContent: FC<AuditFeedContentProps> = ({
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
            {error.message || 'An error occurred while loading flagged content.'}
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
            {noEntriesElement || (
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded w-full mt-4"></div>
                      <div className="flex space-x-2 mt-4">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
