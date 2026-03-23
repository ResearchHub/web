'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { formatTimestamp } from '@/utils/date';
import { stripHtml } from '@/utils/stringUtils';
import type { SavedTemplate } from '@/types/expertFinder';

const TEMPLATE_DETAIL_PATH = '/expert-finder/templates';
const DETAIL_MAX_CHARS = 80;

function TemplateDetailsCell({ template }: { template: SavedTemplate }) {
  const isPromptContext = template.templateType === 'prompt-context';
  const textClassName = 'text-[10px] text-gray-600 truncate block max-w-[200px]';

  if (isPromptContext) {
    const name = template.contactName?.trim();
    const title = template.contactTitle?.trim();
    const institution = template.contactInstitution?.trim();
    const email = template.contactEmail?.trim();
    const parts = [name, title, institution, email].filter(Boolean);
    const summary = parts.length > 0 ? parts.join(' · ') : '—';
    const display =
      summary.length > DETAIL_MAX_CHARS ? `${summary.slice(0, DETAIL_MAX_CHARS)}…` : summary;
    return (
      <span className={textClassName} title={summary}>
        {display}
      </span>
    );
  }

  const bodySnippet = stripHtml(template.emailBody ?? '');
  const display =
    bodySnippet.length > DETAIL_MAX_CHARS
      ? `${bodySnippet.slice(0, DETAIL_MAX_CHARS)}…`
      : bodySnippet || '—';
  return (
    <span className={textClassName} title={bodySnippet || undefined}>
      {display}
    </span>
  );
}

const COLUMNS: SortableColumn[] = [
  { key: 'name', label: 'Name', sortable: false },
  { key: 'details', label: 'Details', sortable: false },
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
