'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { formatTimestamp } from '@/utils/date';
import { stripHtml } from '@/utils/stringUtils';
import type { SavedTemplate } from '@/types/expertFinder';

const DRAFT_DETAIL_PATH = '/expert-finder/emails';

function DraftContentCell({ draft }: { draft: SavedTemplate }) {
  const subject = draft.emailSubject?.trim() || '—';
  const bodySnippet = stripHtml(draft.emailBody ?? '').trim();

  return (
    <div className="max-w-[280px] py-0.5">
      <p className="text-xs font-medium text-gray-900 truncate">{subject}</p>
      {bodySnippet ? (
        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">{bodySnippet}</p>
      ) : (
        <p className="text-[11px] text-gray-400 mt-0.5">No body yet</p>
      )}
    </div>
  );
}

const COLUMNS: SortableColumn[] = [
  { key: 'name', label: 'Name', sortable: false },
  { key: 'content', label: 'Content', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: false },
  { key: 'createdDate', label: 'Created', sortable: false },
  { key: 'edit', label: '', sortable: false },
];

interface DraftsTableProps {
  drafts: SavedTemplate[];
  onRowClick?: (draft: SavedTemplate) => void;
}

export function DraftsTable({ drafts, onRowClick }: DraftsTableProps) {
  const data = drafts.map((draft) => ({
    id: draft.id,
    name: draft.name || '—',
    content: <DraftContentCell draft={draft} />,
    createdBy: draft.createdBy?.author?.fullName ?? '—',
    createdDate: formatTimestamp(draft.createdDate, false),
    edit: (
      <Link
        href={`${DRAFT_DETAIL_PATH}/${draft.id}`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        Edit
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
        const draft = drafts.find((t) => t.id === row.id);
        if (draft) onRowClick?.(draft);
      }}
    />
  );
}

export { COLUMNS as DRAFTS_TABLE_COLUMNS };
