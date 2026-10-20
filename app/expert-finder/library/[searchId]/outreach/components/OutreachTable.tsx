'use client';

import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/utils/date';
import type { GeneratedEmail } from '@/types/expertFinder';
import { getGeneratedEmailStatusPresentation } from '@/app/expert-finder/lib/generatedEmailStatus';
import { getOutreachChannelLabels } from '@/app/expert-finder/lib/outreachChannels';
import { cn } from '@/utils/styles';

function statusCell(email: GeneratedEmail) {
  const { label, variant } = getGeneratedEmailStatusPresentation(email);
  const showChannels = email.status === 'sent' || Boolean(email.sentAt);
  const channelLabels = showChannels ? getOutreachChannelLabels(email.channels) : [];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={variant}>{label}</Badge>
      {channelLabels.map((channelLabel) => (
        <Badge key={channelLabel} variant="default">
          via {channelLabel}
        </Badge>
      ))}
    </div>
  );
}

const OUTREACH_TABLE_COLUMNS: SortableColumn[] = [
  { key: 'expert', label: 'Expert', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: false },
  { key: 'createdAt', label: 'Created Date', sortable: false },
];

export { OUTREACH_TABLE_COLUMNS };

interface OutreachTableProps {
  emails: GeneratedEmail[];
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
  selectableIds?: Set<number>;
}

export function OutreachTable({
  emails,
  selectedIds,
  onSelectionChange,
  selectableIds,
}: OutreachTableProps) {
  const pageIds = emails.map((e) => e.id);
  const selectablePageIds = selectableIds ? pageIds.filter((id) => selectableIds.has(id)) : pageIds;
  const allSelected =
    selectablePageIds.length > 0 && selectablePageIds.every((id) => selectedIds?.has(id));

  const handleSelectAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    if (allSelected) {
      const next = new Set(selectedIds);
      selectablePageIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      selectablePageIds.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };

  const handleSelectRow = (emailId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange || !selectedIds) return;
    if (selectableIds && !selectableIds.has(emailId)) return;
    const next = new Set(selectedIds);
    if (next.has(emailId)) next.delete(emailId);
    else next.add(emailId);
    onSelectionChange(next);
  };

  const columns: SortableColumn[] =
    selectedIds && onSelectionChange
      ? [
          {
            key: 'select',
            label: (
              <input
                type="checkbox"
                checked={selectablePageIds.length > 0 ? allSelected : false}
                disabled={selectablePageIds.length === 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Select all pending delivery on this page"
              />
            ),
            sortable: false,
          },
          ...OUTREACH_TABLE_COLUMNS,
        ]
      : OUTREACH_TABLE_COLUMNS;

  const data = emails.map((email) => {
    const expertName = email.expertName?.trim() || '—';
    const expertEmail = email.expertEmail?.trim() || '';
    const canSelect = !selectableIds || selectableIds.has(email.id);
    const row: Record<string, unknown> = {
      id: email.id,
      expert: (
        <div className="min-w-0">
          <div
            className="text-sm text-gray-900 truncate"
            title={expertName !== '—' ? expertName : undefined}
          >
            {expertName}
          </div>
          {expertEmail ? (
            <div className="text-xs text-gray-500 break-all" title={expertEmail}>
              {expertEmail}
            </div>
          ) : null}
        </div>
      ),
      status: statusCell(email),
      createdBy: email.createdBy?.author?.fullName ?? '—',
      createdAt: formatTimestamp(email.createdAt, false),
    };
    if (selectedIds && onSelectionChange) {
      row.select = (
        <input
          type="checkbox"
          checked={selectedIds.has(email.id)}
          disabled={!canSelect}
          onChange={() => {}}
          onClick={(e) => handleSelectRow(email.id, e)}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500',
            canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
          )}
          aria-label={
            canSelect
              ? `Select ${email.expertName || 'row'}`
              : `${email.expertName || 'Row'} cannot be removed from queue`
          }
        />
      );
    }
    return row;
  });

  return <TableContainer columns={columns} data={data} rowKey="id" className="w-full" />;
}
