'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/utils/date';
import type { GeneratedEmail } from '@/types/expertFinder';

const OUTREACH_DETAIL_PATH = '/expert-finder/outreach';
const SUBJECT_TRUNCATE_LENGTH = 50;

function truncate(s: string, max: number): string {
  if (!s?.trim()) return '—';
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

const COLUMNS: SortableColumn[] = [
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
}

export function OutreachTable({ emails, onRowClick }: OutreachTableProps) {
  const data = emails.map((email) => ({
    id: email.id,
    expertName: email.expertName || '—',
    subject: truncate(email.emailSubject, SUBJECT_TRUNCATE_LENGTH),
    template: email.template || '—',
    status: (
      <Badge variant={email.status === 'sent' ? 'success' : 'primary'}>
        {email.status === 'sent' ? 'Sent' : 'Draft'}
      </Badge>
    ),
    createdAt: formatTimestamp(email.createdAt, false),
    view: (
      <Link
        href={`${OUTREACH_DETAIL_PATH}/${email.id}`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </Link>
    ),
  }));

  return (
    <TableContainer
      columns={COLUMNS}
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

export { COLUMNS as OUTREACH_TABLE_COLUMNS };
