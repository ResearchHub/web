'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { formatTimestamp } from '@/utils/date';
import { stripHtml } from '@/utils/stringUtils';
import type { SavedTemplate } from '@/types/expertFinder';

const TEMPLATE_DETAIL_PATH = '/expert-finder/templates';
const DETAIL_MAX_CHARS = 80;

function TemplateDetailsCell({ template }: { template: SavedTemplate }) {
  const textClassName = 'text-[10px] text-gray-600 truncate block max-w-[200px]';
  const subject = template.emailSubject?.trim();
  const bodySnippet = stripHtml(template.emailBody ?? '');
  const primary = subject || bodySnippet;
  const display =
    primary.length > DETAIL_MAX_CHARS ? `${primary.slice(0, DETAIL_MAX_CHARS)}…` : primary || '—';
  const title = subject
    ? `${subject}${bodySnippet ? ` — ${bodySnippet}` : ''}`
    : bodySnippet || undefined;

  return (
    <span className={textClassName} title={title}>
      {display}
    </span>
  );
}

const COLUMNS: SortableColumn[] = [
  { key: 'name', label: 'Name', sortable: false },
  { key: 'details', label: 'Preview', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: false },
  { key: 'createdDate', label: 'Created Date', sortable: false },
  { key: 'view', label: '', sortable: false },
];

interface TemplatesTableProps {
  templates: SavedTemplate[];
  onRowClick?: (template: SavedTemplate) => void;
}

export function TemplatesTable({ templates, onRowClick }: TemplatesTableProps) {
  const data = templates.map((template) => ({
    id: template.id,
    name: template.name || '—',
    details: <TemplateDetailsCell template={template} />,
    createdBy: template.createdBy?.author?.fullName ?? '—',
    createdDate: formatTimestamp(template.createdDate, false),
    view: (
      <Link
        href={`${TEMPLATE_DETAIL_PATH}/${template.id}`}
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
        const template = templates.find((t) => t.id === row.id);
        if (template) onRowClick?.(template);
      }}
    />
  );
}

export { COLUMNS as TEMPLATES_TABLE_COLUMNS };
