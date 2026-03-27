'use client';

import { formatTimestamp } from '@/utils/date';
import type { SavedTemplate } from '@/types/expertFinder';
import { ListCard } from '@/components/ui/ListCard';
import { stripHtml } from '@/utils/stringUtils';

export interface TemplateMobileCardProps {
  template: SavedTemplate;
  onClick: () => void;
  className?: string;
}

function PreviewSummary({ template }: { template: SavedTemplate }) {
  const subject = template.emailSubject?.trim();
  const bodySnippet = stripHtml(template.emailBody ?? '').trim();
  const line =
    subject ||
    (bodySnippet.length > 120 ? `${bodySnippet.slice(0, 120)}…` : bodySnippet) ||
    'No subject or body yet';

  return (
    <p
      className="text-xs text-gray-600 mt-1 line-clamp-2"
      title={subject || bodySnippet || undefined}
    >
      {line}
    </p>
  );
}

export function TemplateMobileCard({ template, onClick, className }: TemplateMobileCardProps) {
  const displayName = template.name?.trim() || '—';
  const createdByName = template.createdBy?.author?.fullName;

  return (
    <ListCard onClick={onClick} className={className}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
      <PreviewSummary template={template} />
      {createdByName && <p className="text-xs text-gray-500 mt-1">by {createdByName}</p>}
      <p className="text-xs text-gray-500 mt-2">{formatTimestamp(template.createdDate, false)}</p>
    </ListCard>
  );
}
