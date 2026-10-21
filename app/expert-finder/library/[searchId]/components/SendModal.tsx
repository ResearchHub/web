'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getOutreachCampaignLabel,
  getOutreachCampaignStatusPresentation,
} from '@/app/expert-finder/lib/outreachCampaignStatus';
import { TemplateVariableEditor } from '@/app/expert-finder/templates/components/TemplateBodyEditor';
import { Alert } from '@/components/ui/Alert';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import {
  useOutreachCampaigns,
  useOutreachCapacity,
  useSendOutreachCampaign,
} from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types/api';
import type { ExpertResult, OutreachCampaign } from '@/types/expertFinder';
import { cn } from '@/utils/styles';

export interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchId: number;
  experts: ExpertResult[];
  onSuccess?: () => void;
}

function campaignOptionLabel(campaign: OutreachCampaign): string {
  const name = getOutreachCampaignLabel(campaign);
  if (campaign.status === 'no_active_mailboxes') return `${name} (no mailbox)`;
  if (campaign.status === 'paused') return `${name} (paused)`;
  return name;
}

export function SendModal({ isOpen, onClose, searchId, experts, onSuccess }: SendModalProps) {
  const [{ capacity, isLoading: capacityLoading, error: capacityError }, refetchCapacity] =
    useOutreachCapacity(false);
  const [{ campaigns, isLoading: campaignsLoading, error: campaignsError }, refetchCampaigns] =
    useOutreachCampaigns(false);
  const [{ isLoading: isSending }, sendCampaign] = useSendOutreachCampaign();

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [campaignOpen, setCampaignOpen] = useState(false);

  const expertIds = useMemo(
    () =>
      experts
        .map((e) => e.expertId)
        .filter((id): id is number => id != null && Number.isFinite(id) && id > 0),
    [experts]
  );
  const skippedWithoutId = experts.length - expertIds.length;

  const selectedCampaign =
    selectedCampaignId != null
      ? (campaigns.find((c) => c.id === selectedCampaignId) ?? null)
      : null;

  useEffect(() => {
    if (!isOpen) return;
    setSubmitError(null);
    setSelectedCampaignId(null);
    setCampaignOpen(false);
    void refetchCapacity();
    void refetchCampaigns();
  }, [isOpen, refetchCapacity, refetchCampaigns]);

  useEffect(() => {
    if (!isOpen || selectedCampaignId != null || campaigns.length === 0) return;
    setSelectedCampaignId(campaigns[0].id);
  }, [isOpen, campaigns, selectedCampaignId]);

  const activeMailboxCount = capacity?.activeMailboxCount ?? 0;
  const remainingToday = capacity?.remainingToday ?? 0;
  const noMailbox = !capacityLoading && capacity != null && activeMailboxCount === 0;
  const noCampaigns = !campaignsLoading && campaigns.length === 0;
  const campaignNotReady =
    selectedCampaign != null &&
    (selectedCampaign.status === 'no_active_mailboxes' ||
      selectedCampaign.status === 'paused' ||
      selectedCampaign.status === 'error');
  const canSubmit =
    !isSending &&
    !campaignsLoading &&
    !noMailbox &&
    !campaignNotReady &&
    selectedCampaign != null &&
    expertIds.length > 0;

  const handleConfirm = async () => {
    if (!selectedCampaign || !canSubmit) return;
    setSubmitError(null);
    try {
      const result = await sendCampaign(selectedCampaign.id, {
        expert_search_id: searchId,
        expert_ids: expertIds,
      });
      toast.success(result.queued === 1 ? '1 expert queued' : `${result.queued} experts queued`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 502) {
        setSubmitError(extractApiErrorMessage(err, 'Send failed. Try again shortly.'));
        return;
      }
      setSubmitError(extractApiErrorMessage(err, 'Failed to send'));
    }
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="outlined" onClick={onClose} disabled={isSending}>
        Cancel
      </Button>
      <Button variant="default" onClick={handleConfirm} disabled={!canSubmit} className="gap-2">
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        Send
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => !isSending && onClose()}
      title="Send"
      size="lg"
      footer={footer}
    >
      <div className="space-y-4">
        {skippedWithoutId > 0 ? (
          <Alert variant="warning">
            {skippedWithoutId} selected expert{skippedWithoutId === 1 ? '' : 's'} can’t be sent and
            will be skipped.
          </Alert>
        ) : null}

        {capacityError ? <Alert variant="error">{capacityError}</Alert> : null}
        {campaignsError ? <Alert variant="error">{campaignsError}</Alert> : null}
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}

        {capacityLoading && !capacity ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : capacity ? (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{remainingToday}</span> of{' '}
            <span className="font-semibold">{capacity.dailyLimitTotal}</span> remaining today
          </p>
        ) : null}

        {noMailbox ? (
          <Alert variant="warning">
            Connect a mailbox before sending.{' '}
            <Link
              href="/expert-finder/settings"
              className="font-medium text-primary-700 underline-offset-2 hover:underline"
            >
              Open settings
            </Link>
          </Alert>
        ) : null}

        {campaignNotReady && selectedCampaign ? (
          <Alert variant="warning">
            This campaign is{' '}
            {getOutreachCampaignStatusPresentation(selectedCampaign.status).label.toLowerCase()}.
            Restore it or check your mailbox in settings.
          </Alert>
        ) : null}

        {noCampaigns ? (
          <Alert variant="warning">
            Publish a draft first.{' '}
            <Link
              href="/expert-finder/emails"
              className="font-medium text-primary-700 underline-offset-2 hover:underline"
            >
              Open emails
            </Link>
          </Alert>
        ) : (
          <Dropdown
            label="Campaign"
            disabled={campaignsLoading || isSending}
            trigger={
              <Button
                type="button"
                variant="outlined"
                size="md"
                className="w-full justify-between text-left text-gray-900 font-normal"
                disabled={campaignsLoading || isSending}
              >
                <span className="truncate">
                  {selectedCampaign
                    ? campaignOptionLabel(selectedCampaign)
                    : campaignsLoading
                      ? 'Loading…'
                      : 'Select a campaign'}
                </span>
                <ChevronDown
                  className={cn(
                    'ml-2 h-4 w-4 shrink-0 transition-transform',
                    campaignOpen && 'rotate-180'
                  )}
                />
              </Button>
            }
            className="max-h-60 overflow-y-auto py-1"
            onOpenChange={setCampaignOpen}
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {campaigns.map((campaign) => (
                <DropdownItem
                  key={campaign.id}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                  className={
                    selectedCampaignId === campaign.id ? 'bg-primary-50 text-primary-900' : ''
                  }
                >
                  {campaignOptionLabel(campaign)}
                </DropdownItem>
              ))}
            </div>
          </Dropdown>
        )}

        {selectedCampaign ? (
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-900">
              {selectedCampaign.publishedSubject || '—'}
            </p>
            {selectedCampaign.publishedBody?.trim() ? (
              <TemplateVariableEditor
                value={selectedCampaign.publishedBody}
                onChange={() => {}}
                valueAsHtml
                disabled
                showVariablePanel={false}
              />
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        ) : null}
      </div>
    </BaseModal>
  );
}
