'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getOutreachCampaignLabel } from '@/app/expert-finder/lib/outreachCampaignStatus';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/form/Modal';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import {
  useOutreachCampaigns,
  useOutreachMailboxes,
  usePreviewOutreachCampaign,
} from '@/hooks/useExpertFinder';
import { useUser } from '@/contexts/UserContext';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types/api';
import type { OutreachCampaignPreviewResponse, OutreachMailbox } from '@/types/expertFinder';
import { isValidEmail } from '@/utils/validation';
import { cn } from '@/utils/styles';

export interface CampaignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  expertEmail: string;
  expertSearchId: number;
}

export function CampaignPreviewModal({
  isOpen,
  onClose,
  expertEmail,
  expertSearchId,
}: CampaignPreviewModalProps) {
  const { user } = useUser();
  const [{ mailboxes, isLoading: mailboxesLoading, error: mailboxesError }, refetchMailboxes] =
    useOutreachMailboxes(false);
  const [{ campaigns, isLoading: campaignsLoading, error: campaignsError }, refetchCampaigns] =
    useOutreachCampaigns(false);
  const [{ isLoading: isPreviewing }, previewCampaign] = usePreviewOutreachCampaign();

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [fromMailboxId, setFromMailboxId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<OutreachCampaignPreviewResponse | null>(null);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [mailboxOpen, setMailboxOpen] = useState(false);

  const activeMailboxes = useMemo(
    () =>
      mailboxes
        .filter((m) => m.status === 'active')
        .slice()
        .sort((a, b) => a.email.localeCompare(b.email)),
    [mailboxes]
  );

  const selectedCampaign =
    selectedCampaignId != null
      ? (campaigns.find((c) => c.id === selectedCampaignId) ?? null)
      : null;

  const selectedMailbox: OutreachMailbox | null =
    fromMailboxId != null ? (activeMailboxes.find((m) => m.id === fromMailboxId) ?? null) : null;

  const toEmail = user?.email?.trim() || '';
  const toValid = toEmail.length > 0 && isValidEmail(toEmail);
  const expertValid = expertEmail.trim().length > 0 && isValidEmail(expertEmail.trim());

  useEffect(() => {
    if (!isOpen) return;
    setSubmitError(null);
    setResult(null);
    setSelectedCampaignId(null);
    setFromMailboxId(null);
    setCampaignOpen(false);
    setMailboxOpen(false);
    void refetchMailboxes();
    void refetchCampaigns();
  }, [isOpen, refetchMailboxes, refetchCampaigns]);

  useEffect(() => {
    if (!isOpen || selectedCampaignId != null || campaigns.length === 0) return;
    setSelectedCampaignId(campaigns[0].id);
  }, [isOpen, campaigns, selectedCampaignId]);

  useEffect(() => {
    if (!isOpen || fromMailboxId != null || activeMailboxes.length === 0) return;
    setFromMailboxId(activeMailboxes[0].id);
  }, [isOpen, activeMailboxes, fromMailboxId]);

  const canSubmit =
    selectedCampaign != null &&
    fromMailboxId != null &&
    expertValid &&
    toValid &&
    !isPreviewing &&
    !mailboxesLoading &&
    !campaignsLoading;

  const handleSubmit = async () => {
    if (!selectedCampaign || fromMailboxId == null || !canSubmit) return;
    setSubmitError(null);
    try {
      const preview = await previewCampaign(selectedCampaign.id, {
        expert_email: expertEmail.trim(),
        to_email: toEmail,
        expert_search_id: expertSearchId,
        from_mailbox_id: fromMailboxId,
      });
      setResult(preview);
      toast.success('Test email sent — check your inbox');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 502) {
        setSubmitError(extractApiErrorMessage(err, 'Send failed. Try again shortly.'));
        return;
      }
      setSubmitError(extractApiErrorMessage(err, 'Failed to send test email'));
    }
  };

  const handleClose = () => {
    if (isPreviewing) return;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={result ? 'Preview sent' : 'Preview'}>
      <div className="space-y-4">
        {mailboxesError ? <Alert variant="error">{mailboxesError}</Alert> : null}
        {campaignsError ? <Alert variant="error">{campaignsError}</Alert> : null}
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}
        {!toValid ? (
          <Alert variant="warning">Your account needs a valid email to receive the test.</Alert>
        ) : null}

        {result ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium text-gray-900">To:</span> {result.toEmail || toEmail}
              </p>
              <p>
                <span className="font-medium text-gray-900">From:</span> {result.fromEmail || '—'}
              </p>
              <p>
                <span className="font-medium text-gray-900">Subject:</span> {result.subject || '—'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <iframe
                title="Preview message"
                sandbox=""
                srcDoc={result.html || '<p></p>'}
                className="w-full h-72 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {(mailboxesLoading || campaignsLoading) &&
            (activeMailboxes.length === 0 || campaigns.length === 0) ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading…
              </div>
            ) : null}

            {!mailboxesLoading && activeMailboxes.length === 0 ? (
              <Alert variant="warning">
                Connect a mailbox before sending a preview.{' '}
                <Link
                  href="/expert-finder/settings"
                  className="font-medium text-primary-700 underline-offset-2 hover:underline"
                >
                  Open settings
                </Link>
              </Alert>
            ) : null}

            {!campaignsLoading && campaigns.length === 0 ? (
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
                trigger={
                  <Button
                    type="button"
                    variant="outlined"
                    size="md"
                    className="w-full justify-between text-left text-gray-900 font-normal"
                    disabled={isPreviewing || campaignsLoading || campaigns.length === 0}
                  >
                    <span className="truncate">
                      {selectedCampaign
                        ? getOutreachCampaignLabel(selectedCampaign)
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
                      {getOutreachCampaignLabel(campaign)}
                    </DropdownItem>
                  ))}
                </div>
              </Dropdown>
            )}

            {activeMailboxes.length > 0 ? (
              <Dropdown
                label="Send from"
                trigger={
                  <Button
                    type="button"
                    variant="outlined"
                    size="md"
                    className="w-full justify-between text-left text-gray-900 font-normal"
                    disabled={isPreviewing}
                  >
                    <span className="truncate">{selectedMailbox?.email ?? 'Select a mailbox'}</span>
                    <ChevronDown
                      className={cn(
                        'ml-2 h-4 w-4 shrink-0 transition-transform',
                        mailboxOpen && 'rotate-180'
                      )}
                    />
                  </Button>
                }
                className="max-h-60 overflow-y-auto py-1"
                onOpenChange={setMailboxOpen}
              >
                <div className="py-1 max-h-60 overflow-y-auto">
                  {activeMailboxes.map((mailbox) => (
                    <DropdownItem
                      key={mailbox.id}
                      onClick={() => setFromMailboxId(mailbox.id)}
                      className={
                        fromMailboxId === mailbox.id ? 'bg-primary-50 text-primary-900' : ''
                      }
                    >
                      {mailbox.email}
                    </DropdownItem>
                  ))}
                </div>
              </Dropdown>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outlined" size="sm" onClick={handleClose} disabled={isPreviewing}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
              >
                {isPreviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden />
                )}
                Send test email
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
