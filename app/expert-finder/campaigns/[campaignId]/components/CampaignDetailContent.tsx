'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';
import { OutreachEmailContentForm } from '@/app/expert-finder/components/OutreachEmailContentForm';
import { getOutreachCampaignStatusPresentation } from '@/app/expert-finder/lib/outreachCampaignStatus';
import { GeneratedEmailsList } from '@/app/expert-finder/library/[searchId]/outreach/components/GeneratedEmailsList';
import {
  useActivateOutreachCampaign,
  useDeleteOutreachCampaign,
  useOutreachCampaigns,
  useOutreachCapacity,
  useUpdateOutreachCampaign,
} from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types/api';
import { formatTimestamp } from '@/utils/date';

function canRestoreCampaign(status: string): boolean {
  return status === 'paused' || status === 'no_active_mailboxes';
}

export interface CampaignDetailContentProps {
  campaignId: string;
}

export function CampaignDetailContent({ campaignId }: CampaignDetailContentProps) {
  const router = useRouter();
  const [{ campaigns, isLoading: campaignsLoading, error: campaignsError }, refetchCampaigns] =
    useOutreachCampaigns({ limit: 100, offset: 0 });
  const [{ capacity }, refetchCapacity] = useOutreachCapacity();
  const [{ isLoading: isActivating }, activateCampaign] = useActivateOutreachCampaign();
  const [{ isLoading: isUpdating }, updateCampaign] = useUpdateOutreachCampaign();
  const [{ isLoading: isDeleting }, deleteCampaign] = useDeleteOutreachCampaign();

  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const campaign = useMemo(() => {
    const id = Number(campaignId);
    return campaigns.find((c) => c.id === id) ?? null;
  }, [campaigns, campaignId]);

  useEffect(() => {
    if (!campaign) return;
    setName(campaign.name ?? '');
    setEmailSubject(campaign.publishedSubject ?? '');
    setEmailBody(campaign.publishedBody ?? '');
  }, [campaign]);

  const dirty = useMemo(() => {
    if (!campaign) return false;
    return (
      name !== (campaign.name ?? '') ||
      emailSubject !== (campaign.publishedSubject ?? '') ||
      emailBody !== (campaign.publishedBody ?? '')
    );
  }, [campaign, name, emailSubject, emailBody]);

  if (campaignsLoading && !campaign) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (campaignsError && !campaign) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">{campaignsError}</Alert>
        <Link
          href="/expert-finder/emails?tab=campaigns"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to Emails
        </Link>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Alert variant="error">Campaign not found.</Alert>
        <Link
          href="/expert-finder/emails?tab=campaigns"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to Emails
        </Link>
      </div>
    );
  }

  const status = getOutreachCampaignStatusPresentation(campaign.status);
  const title = campaign.name?.trim() || `Campaign #${campaign.id}`;
  const showRestore = canRestoreCampaign(campaign.status);
  const hasActiveMailbox = (capacity?.activeMailboxCount ?? 0) > 0;
  const busy = isActivating || isUpdating || isDeleting;
  const canDelete =
    campaign.counts.queued === 0 &&
    campaign.counts.sent === 0 &&
    campaign.counts.opened === 0 &&
    campaign.counts.replied === 0 &&
    campaign.counts.bounced === 0;

  const handleFieldChange = (
    field: 'name' | 'emailSubject' | 'emailBody',
    value: string
  ) => {
    if (field === 'name') setName(value);
    else if (field === 'emailSubject') setEmailSubject(value);
    else setEmailBody(value);
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSaveError('Campaign name is required');
      return;
    }
    try {
      await updateCampaign(campaign.id, {
        name: trimmedName,
        published_subject: emailSubject,
        published_body: emailBody,
      });
      toast.success('Campaign updated');
      await refetchCampaigns();
    } catch (err: unknown) {
      setSaveError(extractApiErrorMessage(err, 'Failed to update campaign'));
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteCampaign(campaign.id);
      toast.success('Campaign deleted');
      router.push('/expert-finder/emails?tab=campaigns');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setDeleteError('This campaign has queued or sent emails and cannot be deleted.');
      } else {
        setDeleteError(extractApiErrorMessage(err, 'Failed to delete campaign'));
      }
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Breadcrumbs
            items={[
              { label: 'Emails', href: '/expert-finder/emails?tab=campaigns' },
              { label: title },
            ]}
            className="mb-2"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {campaign.publishedAt ? (
              <span className="text-sm text-gray-500">
                Published {formatTimestamp(campaign.publishedAt, false)}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Queued {campaign.counts.queued} · Sent {campaign.counts.sent} · Opened{' '}
            {campaign.counts.opened} · Replied {campaign.counts.replied} · Bounced{' '}
            {campaign.counts.bounced}
          </p>
        </div>

        {showRestore ? (
          <Button
            variant="default"
            size="sm"
            className="gap-2 shrink-0"
            disabled={busy || !hasActiveMailbox}
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

      {(restoreError || saveError || deleteError) && (
        <Alert variant="error">{restoreError || saveError || deleteError}</Alert>
      )}

      {showRestore ? (
        !hasActiveMailbox ? (
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
        )
      ) : null}

      <OutreachEmailContentForm
        values={{ name, emailSubject, emailBody }}
        onChange={handleFieldChange}
        onSubmit={(e) => void handleSave(e)}
        disabled={busy}
        nameMaxLength={100}
        deleteLabel="Delete campaign"
        onDelete={() => setShowDeleteConfirm(true)}
        deleteDisabled={!canDelete}
        deleteTitle={
          canDelete ? undefined : 'Campaigns with queued or sent emails cannot be deleted'
        }
        isDeleting={isDeleting}
        submitLabel="Save changes"
        submitDisabled={!dirty}
        isSubmitting={isUpdating}
      />

      <GeneratedEmailsList
        campaignId={campaignId}
        onListChange={() => void refetchCampaigns()}
        emptyMessage={<p className="text-gray-600">No messages in this campaign yet.</p>}
      />

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete campaign?"
      >
        <p className="text-sm text-gray-600">The campaign will be permanently removed.</p>
        <p className="text-sm text-red-600 mb-4 italic">*This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outlined" size="sm" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
