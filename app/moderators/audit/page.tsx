'use client';

import { useState } from 'react';
import { useAudit, AuditStatus } from '@/hooks/useAudit';
import { AuditFeedContent } from '@/components/Moderators/AuditFeedContent';
import { AuditStatusFilter } from '@/components/Moderators/AuditStatusFilter';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { ID } from '@/types/root';

export default function AuditPage() {
  const [activeStatus, setActiveStatus] = useState<AuditStatus>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    entries,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    removeFlaggedContent,
    dismissFlaggedContent,
  } = useAudit({
    status: activeStatus,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = async (flagIds: ID[]) => {
    return await dismissFlaggedContent(flagIds);
  };

  const handleRemove = async (flagIds: ID[]) => {
    return await removeFlaggedContent(flagIds);
  };

  const handleStatusChange = (status: AuditStatus) => {
    setActiveStatus(status);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Content Audit</h1>
              <p className="text-sm text-gray-600 mt-1">
                Review and moderate flagged content from the community
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center justify-between">
            <AuditStatusFilter activeStatus={activeStatus} onStatusChange={handleStatusChange} />
          </div>
        </div>
      </div>

      {/* Main content area with audit feed */}
      <div className="flex-1 overflow-auto">
        <AuditFeedContent
          entries={entries}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          error={error}
          loadMore={loadMore}
          onDismiss={handleDismiss}
          onRemove={handleRemove}
          view={
            activeStatus === 'pending'
              ? 'pending'
              : activeStatus === 'dismissed'
                ? 'dismissed'
                : 'removed'
          }
        />
      </div>
    </div>
  );
}
