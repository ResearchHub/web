'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatTimestamp } from '@/utils/date';
import {
  getTemplateDisplayLabel,
  getTemplateDescription,
} from '@/app/expert-finder/library/[searchId]/components/GenerateEmailModal';
import type { GeneratedEmail } from '@/types/expertFinder';

const SUBJECT_TRUNCATE_LENGTH = 50;

function truncate(s: string, max: number): string {
  if (!s?.trim()) return '—';
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

const BASE_COLUMNS: SortableColumn[] = [
  { key: 'expertName', label: 'Expert', sortable: false },
  { key: 'subject', label: 'Subject', sortable: false },
  { key: 'template', label: 'Template', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'createdAt', label: 'Created', sortable: false },
  { key: 'view', label: '', sortable: false },
];

interface OutreachTableProps {
  emails: GeneratedEmail[];
  onRowClick?: (email: GeneratedEmail) => void;
  getDetailHref: (email: GeneratedEmail) => string;
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
}

function TemplateCell({ email }: { email: GeneratedEmail }) {
  const label = getTemplateDisplayLabel(email.template);
  const description = getTemplateDescription(email.template);
  if (description) {
    return (
      <Tooltip content={description} width="w-72" position="top">
        <span className="cursor-help underline decoration-dotted decoration-gray-400 underline-offset-1">
          {label}
        </span>
      </Tooltip>
    );
  }
  return <span>{label}</span>;
}

export function OutreachTable({
  emails,
  onRowClick,
  getDetailHref,
  selectedIds,
  onSelectionChange,
}: OutreachTableProps) {
  const pageIds = emails.map((e) => e.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds?.has(id));

  const handleSelectAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    if (allSelected) {
      const next = new Set(selectedIds);
      pageIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      pageIds.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };

  const handleSelectRow = (emailId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange || !selectedIds) return;
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
                checked={pageIds.length > 0 ? allSelected : false}
                onChange={handleSelectAll}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                aria-label="Select all on page"
              />
            ),
            sortable: false,
          },
          ...BASE_COLUMNS,
        ]
      : BASE_COLUMNS;

  const data = emails.map((email) => {
    const row: Record<string, unknown> = {
      id: email.id,
      expertName: email.expertName || '—',
      subject: truncate(email.emailSubject, SUBJECT_TRUNCATE_LENGTH),
      template: <TemplateCell email={email} />,
      status: (
        <Badge variant={email.status === 'sent' ? 'success' : 'primary'}>
          {email.status === 'sent' ? 'Sent' : 'Draft'}
        </Badge>
      ),
      createdAt: formatTimestamp(email.createdAt, false),
      view: (
        <Link
          href={getDetailHref(email)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Link>
      ),
    };
    if (selectedIds && onSelectionChange) {
      row.select = (
        <input
          type="checkbox"
          checked={selectedIds.has(email.id)}
          onChange={() => {}}
          onClick={(e) => handleSelectRow(email.id, e)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          aria-label={`Select ${email.expertName || 'row'}`}
        />
      );
    }
    return row;
  });

  return (
    <TableContainer
      columns={columns}
      data={data}
      rowKey="id"
      className="w-full cursor-pointer"
      onRowClick={(row) => {
        const email = emails.find((e) => e.id === row.id);
        if (email) onRowClick?.(email);
      }}
    />
  );
}

export const OUTREACH_TABLE_COLUMNS = [
  { key: 'select', label: '', sortable: false },
  ...BASE_COLUMNS,
];
