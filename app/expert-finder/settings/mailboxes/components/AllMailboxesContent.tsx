'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert } from '@/components/ui/Alert';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { Input } from '@/components/ui/form/Input';
import { Modal } from '@/components/ui/form/Modal';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { useUser } from '@/contexts/UserContext';
import { useOutreachMailboxes, useUpdateOutreachMailbox } from '@/hooks/useExpertFinder';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { OutreachMailbox } from '@/types/expertFinder';
import { AllMailboxesTable, ALL_MAILBOXES_TABLE_COLUMNS } from './AllMailboxesTable';

const DAILY_LIMIT_MIN = 1;
const DAILY_LIMIT_MAX = 10_000;

type PendingWarmupToggle = {
  mailbox: OutreachMailbox;
  enabled: boolean;
};

export function AllMailboxesContent() {
  const { user, isLoading: userLoading } = useUser();
  const isModerator = !!user?.isModerator;

  const [{ mailboxes, isLoading, error }, refetchMailboxes] = useOutreachMailboxes(isModerator, {
    scope: 'all',
  });
  const [{ isLoading: isUpdatingMailbox }, updateMailbox] = useUpdateOutreachMailbox();

  const [editLimitMailbox, setEditLimitMailbox] = useState<OutreachMailbox | null>(null);
  const [editLimitValue, setEditLimitValue] = useState('');
  const [editLimitError, setEditLimitError] = useState<string | null>(null);
  const [pendingWarmup, setPendingWarmup] = useState<PendingWarmupToggle | null>(null);
  const [isConfirmingWarmup, setIsConfirmingWarmup] = useState(false);
  const [updatingWarmupId, setUpdatingWarmupId] = useState<number | null>(null);

  useEffect(() => {
    if (editLimitMailbox) {
      setEditLimitValue(String(editLimitMailbox.dailyLimit ?? ''));
      setEditLimitError(null);
    }
  }, [editLimitMailbox]);

  if (userLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <Alert variant="error">Only moderators can manage all outreach mailboxes.</Alert>
        <Link
          href="/expert-finder/settings"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Back to Settings
        </Link>
      </div>
    );
  }

  const handleSaveDailyLimit = async () => {
    if (!editLimitMailbox) return;
    const parsed = Number(editLimitValue.trim());
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      setEditLimitError(`Enter a whole number from ${DAILY_LIMIT_MIN} to ${DAILY_LIMIT_MAX}`);
      return;
    }
    if (parsed < DAILY_LIMIT_MIN || parsed > DAILY_LIMIT_MAX) {
      setEditLimitError(`Limit must be between ${DAILY_LIMIT_MIN} and ${DAILY_LIMIT_MAX}`);
      return;
    }
    setEditLimitError(null);
    try {
      await updateMailbox(editLimitMailbox.id, { daily_limit: parsed });
      toast.success(`Daily limit set to ${parsed}`);
      setEditLimitMailbox(null);
      await refetchMailboxes();
    } catch (err: unknown) {
      setEditLimitError(extractApiErrorMessage(err, 'Failed to update daily limit'));
    }
  };

  const handleConfirmWarmup = async () => {
    if (!pendingWarmup) return;
    const { mailbox, enabled } = pendingWarmup;
    setIsConfirmingWarmup(true);
    setUpdatingWarmupId(mailbox.id);
    try {
      await updateMailbox(mailbox.id, { warmup_enabled: enabled });
      toast.success(enabled ? 'Warmup enabled' : 'Warmup disabled');
      setPendingWarmup(null);
      await refetchMailboxes();
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Failed to update warmup'));
    } finally {
      setIsConfirmingWarmup(false);
      setUpdatingWarmupId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Settings', href: '/expert-finder/settings' },
          { label: 'All mailboxes' },
        ]}
        className="mb-2"
      />

      <div>
        <h1 className="text-xl font-semibold text-gray-900">All mailboxes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update daily limits and warmup for any connected mailbox.
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading && mailboxes.length === 0 ? (
        <TableSkeleton columns={ALL_MAILBOXES_TABLE_COLUMNS} rowCount={8} />
      ) : mailboxes.length === 0 ? (
        <p className="text-sm text-gray-600">No mailboxes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <AllMailboxesTable
            mailboxes={mailboxes}
            updatingWarmupId={updatingWarmupId}
            isUpdating={isUpdatingMailbox || isConfirmingWarmup}
            onEditDailyLimit={setEditLimitMailbox}
            onRequestToggleWarmup={(mailbox, enabled) => {
              setPendingWarmup({ mailbox, enabled });
            }}
          />
        </div>
      )}

      <ConfirmationModal
        isOpen={pendingWarmup != null}
        onClose={() => !isConfirmingWarmup && setPendingWarmup(null)}
        title={pendingWarmup?.enabled ? 'Enable warmup?' : 'Disable warmup?'}
        description={
          pendingWarmup
            ? pendingWarmup.enabled
              ? `Enable warmup for ${pendingWarmup.mailbox.email}?`
              : `Disable warmup for ${pendingWarmup.mailbox.email}?`
            : undefined
        }
        confirmLabel={pendingWarmup?.enabled ? 'Enable warmup' : 'Disable warmup'}
        confirmVariant={pendingWarmup?.enabled ? 'default' : 'destructive'}
        isConfirming={isConfirmingWarmup}
        onConfirm={handleConfirmWarmup}
      />

      <Modal
        isOpen={editLimitMailbox != null}
        onClose={() => !isUpdatingMailbox && setEditLimitMailbox(null)}
        title="Edit daily limit"
      >
        {editLimitMailbox?.email ? (
          <p className="text-sm text-gray-600 mb-3">{editLimitMailbox.email}</p>
        ) : null}
        {editLimitError ? <Alert variant="error">{editLimitError}</Alert> : null}
        <Input
          label="Daily send limit"
          type="number"
          min={DAILY_LIMIT_MIN}
          max={DAILY_LIMIT_MAX}
          step={1}
          value={editLimitValue}
          onChange={(e) => setEditLimitValue(e.target.value)}
          placeholder="50"
          disabled={isUpdatingMailbox}
        />
        <p className="mt-1 text-xs text-gray-500">
          Allowed range: {DAILY_LIMIT_MIN}–{DAILY_LIMIT_MAX.toLocaleString()}.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outlined"
            size="sm"
            disabled={isUpdatingMailbox}
            onClick={() => setEditLimitMailbox(null)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isUpdatingMailbox}
            onClick={() => void handleSaveDailyLimit()}
            className="gap-2"
          >
            {isUpdatingMailbox ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}
