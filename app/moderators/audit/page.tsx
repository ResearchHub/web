'use client';

import { useState, useEffect } from 'react';
import { useAudit, AuditStatus } from '@/hooks/useAudit';
import { AuditContent } from '@/components/Moderators/AuditContent';
import { AuditTabs } from '@/components/Moderators/AuditTabs';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { ID } from '@/types/root';

const getViewFromStatus = (status: AuditStatus): 'pending' | 'dismissed' | 'removed' => {
  if (status === 'pending') return 'pending';
  if (status === 'dismissed') return 'dismissed';
  return 'removed';
};

export default function AuditPage() {
  const [activeStatus, setActiveStatus] = useState<AuditStatus>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Temporarily redirect away from 'removed' status due to backend issues
  useEffect(() => {
    if (activeStatus === 'removed') {
      setActiveStatus('pending');
    }
  }, [activeStatus]);

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
    <div className="h-full flex flex-col  p-4">
      {/* Header */}
      <div className="bg-white">
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
              <span className="hidden tablet:!block">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6">
          <AuditTabs
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
            loading={isLoading || isRefreshing || isLoadingMore}
          />
        </div>
      </div>

      {/* Main content area with audit feed */}
      <div className="flex-1 overflow-auto">
        <AuditContent
          entries={entries}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          error={error}
          loadMore={loadMore}
          onDismiss={handleDismiss}
          onRemove={handleRemove}
          view={getViewFromStatus(activeStatus)}
        />
      </div>
    </div>
  );
}
