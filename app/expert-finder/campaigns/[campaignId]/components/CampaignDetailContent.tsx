'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { BaseSection } from '@/components/ui/BaseSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { getOutreachCampaignStatusPresentation } from '@/app/expert-finder/lib/outreachCampaignStatus';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import {
  useActivateOutreachCampaign,
  useOutreachCampaigns,
  useOutreachCapacity,
} from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { formatTimestamp } from '@/utils/date';

function canRestoreCampaign(status: string): boolean {
  return status === 'paused' || status === 'no_active_mailboxes';
}

export interface CampaignDetailContentProps {
  campaignId: string;
}

export function CampaignDetailContent({ campaignId }: CampaignDetailContentProps) {
  const [{ campaigns, isLoading: campaignsLoading, error: campaignsError }, refetchCampaigns] =
    useOutreachCampaigns({ limit: 100, offset: 0 });
  const [{ capacity }, refetchCapacity] = useOutreachCapacity();
  const [{ isLoading: isActivating }, activateCampaign] = useActivateOutreachCampaign();
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const campaign = useMemo(() => {
    const id = Number(campaignId);
    return campaigns.find((c) => c.id === id) ?? null;
  }, [campaigns, campaignId]);

  if (campaignsLoading && !campaign) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (campaignsError && !campaign) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <Alert variant="error">{campaignsError}</Alert>
        <Link
          href="/expert-finder/settings"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to Settings
        </Link>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <Alert variant="error">Campaign not found.</Alert>
        <Link
          href="/expert-finder/settings"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to Settings
        </Link>
      </div>
    );
  }

  const status = getOutreachCampaignStatusPresentation(campaign.status);
  const title = campaign.name?.trim() || `Campaign #${campaign.id}`;
  const showRestore = canRestoreCampaign(campaign.status);
  const hasActiveMailbox = (capacity?.activeMailboxCount ?? 0) > 0;

  const handleRestore = async () => {
    setRestoreError(null);
    try {
      await activateCampaign(campaign.id);
      toast.success('Campaign restored');
      await Promise.all([refetchCampaigns(), refetchCapacity()]);
    } catch (err: unknown) {
      setRestoreError(extractApiErrorMessage(err, 'Failed to restore campaign'));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Settings', href: '/expert-finder/settings' }, { label: title }]}
        className="mb-2"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
            {campaign.hasUnpublishedChanges ? (
              <Badge variant="warning">Unpublished changes</Badge>
            ) : null}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Template:{' '}
            <Link
              href={`/expert-finder/templates/${campaign.templateId}`}
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              {campaign.templateName || `#${campaign.templateId}`}
            </Link>
            {campaign.publishedAt
              ? ` · Published ${formatTimestamp(campaign.publishedAt, false)}`
              : ''}
          </p>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {campaign.publishedSubject || '—'}
          </p>
        </div>

        {showRestore ? (
          <Button
            variant="default"
            size="sm"
            className="gap-2 shrink-0"
            disabled={isActivating || !hasActiveMailbox}
            onClick={() => void handleRestore()}
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
            Restore campaign
          </Button>
        ) : null}
      </div>

      {showRestore ? (
        <div className="space-y-2">
          {restoreError ? <Alert variant="error">{restoreError}</Alert> : null}
          {!hasActiveMailbox ? (
            <Alert variant="warning">
              Connect a mailbox, then restore this campaign.{' '}
              <Link
                href="/expert-finder/settings"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                Open settings
              </Link>
            </Alert>
          ) : (
            <Alert variant="warning">This campaign is paused. Restore it to resume sending.</Alert>
          )}
        </div>
      ) : null}

      <BaseSection>
        <p className="text-sm text-gray-700">
          Queued {campaign.counts.queued} · Sent {campaign.counts.sent} · Opened{' '}
          {campaign.counts.opened} · Replied {campaign.counts.replied} · Bounced{' '}
          {campaign.counts.bounced}
        </p>
      </BaseSection>

      <GeneratedEmailsList
        campaignId={campaignId}
        onListChange={() => void refetchCampaigns()}
        emptyMessage={<p className="text-gray-600">No messages in this campaign yet.</p>}
      />
    </div>
  );
}
