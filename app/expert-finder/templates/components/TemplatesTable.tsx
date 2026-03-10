'use client';

import Link from 'next/link';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';
import { formatTimestamp } from '@/utils/date';
import type { SavedTemplate } from '@/types/expertFinder';

const TEMPLATE_DETAIL_PATH = '/expert-finder/templates';

function TemplateContactDetails({ template }: { template: SavedTemplate }) {
  const name = template.contactName?.trim();
  const title = template.contactTitle?.trim();
  const institution = template.contactInstitution?.trim();
  const email = template.contactEmail?.trim();

  const nameTitleLine = [name, title].filter(Boolean).join(', ') || '—';
  const institutionLine = institution || '—';

  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <span className="font-medium text-gray-900">{nameTitleLine}</span>
      <span className="text-gray-600">{institutionLine}</span>
      {email ? (
        <span className="text-gray-600 truncate max-w-full">{email}</span>
      ) : (
        <span className="text-gray-500">—</span>
      )}
    </div>
  );
}

const COLUMNS: SortableColumn[] = [
  { key: 'name', label: 'Name', sortable: false },
  { key: 'contact', label: 'Contact', sortable: false },
  { key: 'createdDate', label: 'Created', sortable: false },
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
    contact: <TemplateContactDetails template={template} />,
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
