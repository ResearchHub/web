'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DeclineModal } from '@/components/Moderators/DeclineModal';
import { FeedItemGrant } from '@/components/Feed/items/FeedItemGrant';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import {
  PendingModerationService,
  PENDING_MODULE_CONFIG,
  type PendingModule,
} from '@/services/pending-moderation.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { FlagReasonKey } from '@/types/work';
import toast from 'react-hot-toast';

interface PendingModerationListProps {
  module: PendingModule;
}

function getContentId(module: PendingModule, entry: FeedEntry): number | undefined {
  if (module === 'funding_opportunities') {
    return (entry.content as FeedGrantContent).grant?.id;
  }
  return entry.content.id;
}

function renderFeedItem(module: PendingModule, entry: FeedEntry, footer: ReactNode): ReactNode {
  const commonProps = { entry, showActions: false, footer };
  switch (module) {
    case 'funding_opportunities':
      return <FeedItemGrant {...commonProps} showHeader={false} />;
    case 'journal_entries':
      return <FeedItemPaper {...commonProps} />;
    case 'proposals':
    case 'posts':
    default:
      return <FeedItemPost {...commonProps} showHeader={false} />;
  }
}

export function PendingModerationList({ module }: PendingModerationListProps) {
  const { itemLabel } = PENDING_MODULE_CONFIG[module];
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [declineTarget, setDeclineTarget] = useState<{ id: number; entryId: string } | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await PendingModerationService.fetchPending(module);
      setEntries(response.entries);
    } catch {
      toast.error('Failed to load pending submissions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [module]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEntries();
  };

  const handleApprove = async (id: number, entryId: string) => {
    setActioningId(id);
    try {
      await PendingModerationService.approve(module, id);
      toast.success(`${itemLabel} approved`);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to approve ${itemLabel}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = async (data: { reasonChoice: FlagReasonKey; reason: string }) => {
    if (!declineTarget) return;
    setActioningId(declineTarget.id);
    try {
      await PendingModerationService.decline(module, declineTarget.id, {
        reason_choice: data.reasonChoice,
        ...(data.reason && { reason: data.reason }),
      });
      toast.success(`${itemLabel} declined`);
      setEntries((prev) => prev.filter((e) => e.id !== declineTarget.entryId));
      setDeclineTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to decline ${itemLabel}`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
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

      <div className="max-w-4xl mx-auto space-y-4">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600 text-center max-w-md">
                No pending submissions require your review at the moment.
              </p>
            </div>
          </div>
        )}

        {!isLoading &&
          entries.map((entry) => {
            const id = getContentId(module, entry);
            const isActioning = actioningId === id;

            const footer = id ? (
              <div className="flex items-center gap-2 px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(id, entry.id)}
                  disabled={isActioning}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {isActioning ? 'Approving...' : 'Approve'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeclineTarget({ id, entryId: entry.id })}
                  disabled={isActioning}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            ) : undefined;

            return <div key={entry.id}>{renderFeedItem(module, entry, footer)}</div>;
          })}
      </div>

      {declineTarget && (
        <DeclineModal
          isOpen={!!declineTarget}
          onClose={() => setDeclineTarget(null)}
          onConfirm={handleDecline}
          isSubmitting={actioningId === declineTarget.id}
          itemLabel={itemLabel}
        />
      )}
    </>
  );
}
