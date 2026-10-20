'use client';

import { Loader2, Pencil } from 'lucide-react';
import { getOutreachMailboxProviderLabel } from '@/app/expert-finder/lib/outreachMailboxProviders';
import { Switch } from '@/components/ui/Switch';
import { TableContainer, type SortableColumn } from '@/components/ui/Table/TableContainer';
import type { OutreachMailbox } from '@/types/expertFinder';

const COLUMNS: SortableColumn[] = [
  { key: 'email', label: 'Mailbox', sortable: false },
  { key: 'editor', label: 'Editor', sortable: false },
  { key: 'provider', label: 'Provider', sortable: false },
  { key: 'dailyLimit', label: 'Daily limit', sortable: false },
  { key: 'totalSent', label: 'Total sent', sortable: false },
  { key: 'warmup', label: 'Warmup', sortable: false },
];

export { COLUMNS as ALL_MAILBOXES_TABLE_COLUMNS };

interface AllMailboxesTableProps {
  mailboxes: OutreachMailbox[];
  updatingWarmupId: number | null;
  isUpdating: boolean;
  onEditDailyLimit: (mailbox: OutreachMailbox) => void;
  onRequestToggleWarmup: (mailbox: OutreachMailbox, enabled: boolean) => void;
}

export function AllMailboxesTable({
  mailboxes,
  updatingWarmupId,
  isUpdating,
  onEditDailyLimit,
  onRequestToggleWarmup,
}: AllMailboxesTableProps) {
  const data = mailboxes.map((mailbox) => {
    const providerLabel = getOutreachMailboxProviderLabel(mailbox.providerCode) || '—';
    const warmupChecked = mailbox.warmupEnabled === true;
    const warmupBusy = updatingWarmupId === mailbox.id;
    const rowDisabled = isUpdating || mailbox.status === 'disconnecting';

    return {
      id: mailbox.id,
      email: (
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate block">{mailbox.email}</span>
          <span className="text-xs text-gray-500 capitalize">{mailbox.status}</span>
        </div>
      ),
      editor: (
        <span className="text-sm text-gray-700 truncate block max-w-[180px]">
          {mailbox.editorEmail?.trim() || '—'}
        </span>
      ),
      provider: <span className="text-sm text-gray-700">{providerLabel}</span>,
      dailyLimit: (
        <div className="inline-flex items-center gap-1.5">
          <span className="text-sm tabular-nums text-gray-900">{mailbox.dailyLimit}</span>
          <button
            type="button"
            className="inline-flex rounded p-0.5 text-gray-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:opacity-50"
            aria-label={`Edit daily limit for ${mailbox.email}`}
            title="Edit daily limit"
            disabled={rowDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onEditDailyLimit(mailbox);
            }}
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </button>
        </div>
      ),
      totalSent: (
        <span className="text-sm tabular-nums text-gray-900">
          {mailbox.totalSent != null ? mailbox.totalSent.toLocaleString() : '—'}
        </span>
      ),
      warmup: (
        <div className="inline-flex items-center gap-2">
          <Switch
            checked={warmupChecked}
            disabled={warmupBusy || rowDisabled}
            onCheckedChange={(checked) => onRequestToggleWarmup(mailbox, checked)}
          />
          {warmupBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" aria-hidden />
          ) : null}
        </div>
      ),
    };
  });

  return <TableContainer columns={COLUMNS} data={data} rowKey="id" className="w-full" />;
}
