'use client';

import { FC, ReactNode, useState } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { Button } from '@/components/ui/Button';
import { ChevronDown, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { AuditItemCard } from './AuditItemCard';
import { AuditItemSkeleton } from './AuditItemSkeleton';
import { SelectionCheckbox } from './SelectionCheckbox';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ID } from '@/types/root';

interface AuditContentProps {
  entries: FlaggedContent[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onDismiss: (flagIds: ID[]) => Promise<boolean>;
  onRemove: (flagIds: ID[]) => Promise<boolean>;
  onRefresh?: () => void;
  header?: ReactNode;
  filters?: ReactNode;
  noEntriesElement?: ReactNode;
  error?: Error | null;
  view?: 'pending' | 'dismissed' | 'removed';
  selectedIds?: ID[];
  onItemSelect?: (itemId: ID) => void;
  onToggleSelectAll?: () => void;
  onClearSelection?: () => void;
  onBulkAction?: (
    action: 'dismiss' | 'remove' | 'removePdf',
    flagIds?: ID[],
    options?: { verdictChoice?: string; sendEmail?: boolean }
  ) => Promise<boolean>;
}

export const AuditContent: FC<AuditContentProps> = ({
  entries,
  isLoading,
  isLoadingMore = false,
  hasMore,
  loadMore,
  onDismiss,
  onRemove,
  onRefresh,
  header,
  filters,
  noEntriesElement,
  error,
  view,
  selectedIds = [],
  onItemSelect,
  onToggleSelectAll,
  onClearSelection,
  onBulkAction,
}) => {
  const [showBulkRemoveConfirm, setShowBulkRemoveConfirm] = useState(false);

  const isPending = view === 'pending';
  const selectionCount = selectedIds.length;
  const totalCount = entries.length;
  const isAllSelected = totalCount > 0 && selectionCount === totalCount;
  const isSomeSelected = selectionCount > 0 && selectionCount < totalCount;

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

  const handleBulkDismiss = async () => {
    await onBulkAction?.('dismiss');
  };

  const handleBulkRemoveConfirmed = async () => {
    await onBulkAction?.('remove');
  };

  const renderAuditEntry = (entry: FlaggedContent, index: number) => {
    const spacingClass = index !== 0 ? 'mt-6' : '';
    const isSelected = selectedIds.includes(entry.id);

    return (
      <div key={entry.id} className={spacingClass}>
        <AuditItemCard
          entry={entry}
          onAction={(action) => handleAction(action, entry.id)}
          onRefresh={onRefresh}
          view={view}
          isSelected={isPending ? isSelected : undefined}
          onSelect={isPending && onItemSelect ? () => onItemSelect(entry.id) : undefined}
        />
      </div>
    );
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      {header && <div className="mb-6">{header}</div>}

      {/* Filters */}
      {filters && <div className="mb-6">{filters}</div>}

      {/* Bulk action bar — shown when in pending view and entries exist */}
      {isPending && entries.length > 0 && !isLoading && (
        <div className="mb-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            {onToggleSelectAll && (
              <SelectionCheckbox
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onChange={onToggleSelectAll}
                ariaLabel={isAllSelected ? 'Deselect all' : 'Select all'}
              />
            )}
            <span className="text-sm text-gray-700">
              {selectionCount === 0
                ? `Select all (${totalCount})`
                : `${selectionCount} of ${totalCount} selected`}
            </span>
          </div>

          {selectionCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDismiss}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Dismiss ({selectionCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkRemoveConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Remove ({selectionCount})
              </Button>
            </div>
          )}
        </div>
      )}

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

      {/* Bulk remove confirmation modal */}
      <ConfirmModal
        isOpen={showBulkRemoveConfirm}
        onClose={() => setShowBulkRemoveConfirm(false)}
        onConfirm={handleBulkRemoveConfirmed}
        title="Remove Selected Content"
        message={`Are you sure you want to remove ${selectionCount} flagged item${selectionCount !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText={`Remove ${selectionCount} item${selectionCount !== 1 ? 's' : ''}`}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};
