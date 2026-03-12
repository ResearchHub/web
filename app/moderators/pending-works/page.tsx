'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { GrantModerationService } from '@/services/grant-moderation.service';
import { DeclineGrantModal } from '@/components/Moderators/DeclineGrantModal';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { buildWorkUrl } from '@/utils/url';

type WorkTypeFilter = 'all' | 'rfp' | 'proposal';

const TABS = [
  { id: 'all' as const, label: 'All' },
  { id: 'rfp' as const, label: 'RFP' },
  { id: 'proposal' as const, label: 'Proposal' },
];

export default function PendingWorksPage() {
  const [activeTab, setActiveTab] = useState<WorkTypeFilter>('all');
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [declineTarget, setDeclineTarget] = useState<{ grantId: number; entryId: string } | null>(
    null
  );

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'rfp') {
        const response = await GrantModerationService.fetchPendingGrants();
        setEntries(response.entries);
      } else if (activeTab === 'proposal') {
        const response = await GrantModerationService.fetchPendingProposals();
        setEntries(response.entries);
      } else {
        const [grants, proposals] = await Promise.all([
          GrantModerationService.fetchPendingGrants(),
          GrantModerationService.fetchPendingProposals(),
        ]);
        setEntries([...grants.entries, ...proposals.entries]);
      }
    } catch {
      toast.error('Failed to load pending works');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEntries();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as WorkTypeFilter);
  };

  const TAB_LABELS: Record<WorkTypeFilter, string> = {
    rfp: 'RFPs',
    proposal: 'proposals',
    all: 'works',
  };

  const handleApprove = async (grantId: number, entryId: string) => {
    setActioningId(grantId);
    try {
      await GrantModerationService.approveGrant(grantId);
      toast.success('RFP approved successfully');
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve RFP');
    } finally {
      setActioningId(null);
    }
  };

  const handleDecline = async (reason: string) => {
    if (!declineTarget) return;
    setActioningId(declineTarget.grantId);
    try {
      await GrantModerationService.declineGrant(declineTarget.grantId, reason);
      toast.success('RFP declined');
      setEntries((prev) => prev.filter((e) => e.id !== declineTarget.entryId));
      setDeclineTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to decline RFP');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Pending Works</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve or decline pending submissions
            </p>
          </div>

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

        <div className="border-b border-gray-200 mb-6">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="primary"
            disabled={isLoading || isRefreshing}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                >
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
                  No pending {TAB_LABELS[activeTab]} require your review at the moment.
                </p>
              </div>
            </div>
          )}

          {entries.map((entry) => {
            const grant = entry.content as FeedGrantContent;
            const grantId = grant.grant?.id;
            const isActioning = actioningId === grantId;

            const createdBy = grant.grant?.createdBy;
            const creatorName = createdBy
              ? `${createdBy.firstName ?? ''} ${createdBy.lastName ?? ''}`.trim()
              : '';
            const creatorAuthorId = createdBy?.id;

            const grantUrl = buildWorkUrl({
              id: grant.id,
              slug: grant.slug,
              contentType: 'funding_request',
            });

            return (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {grant.title || grant.grant?.organization || 'Untitled RFP'}
                      </h3>

                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {creatorName && (
                          <span>
                            by{' '}
                            {creatorAuthorId ? (
                              <Link
                                href={`/author/${creatorAuthorId}`}
                                className="text-primary-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {creatorName}
                              </Link>
                            ) : (
                              creatorName
                            )}
                          </span>
                        )}
                        {grant.createdDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDistanceToNow(new Date(grant.createdDate), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={grantUrl}
                      target="_blank"
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  {(grant.grant?.description || grant.textPreview) && (
                    <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                      {grant.grant?.description || grant.textPreview}
                    </p>
                  )}

                  {grant.grant?.amount && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Amount:</span> {grant.grant.amount.formatted}
                    </div>
                  )}

                  {!!grantId && (
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(grantId, entry.id)}
                        disabled={isActioning}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {isActioning ? 'Approving...' : 'Approve'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeclineTarget({ grantId, entryId: entry.id })}
                        disabled={isActioning}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {declineTarget && (
        <DeclineGrantModal
          isOpen={!!declineTarget}
          onClose={() => setDeclineTarget(null)}
          onConfirm={handleDecline}
          isSubmitting={actioningId === declineTarget.grantId}
        />
      )}
    </div>
  );
}
