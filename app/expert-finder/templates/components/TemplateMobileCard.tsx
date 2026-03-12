'use client';

import { formatTimestamp } from '@/utils/date';
import type { SavedTemplate } from '@/types/expertFinder';
import { ListCard } from '@/components/ui/ListCard';

export interface TemplateMobileCardProps {
  template: SavedTemplate;
  onClick: () => void;
  className?: string;
}

function ContactSummary({ template }: { template: SavedTemplate }) {
  const name = template.contactName?.trim();
  const title = template.contactTitle?.trim();
  const institution = template.contactInstitution?.trim();
  const email = template.contactEmail?.trim();

  const nameTitleLine = [name, title].filter(Boolean).join(', ') || '—';
  const institutionLine = institution || '—';

  return (
    <div className="flex flex-col gap-0.5 text-xs text-gray-600 mt-1">
      <span className="font-medium text-gray-900">{nameTitleLine}</span>
      {institutionLine !== '—' && <span>{institutionLine}</span>}
      <span className="truncate">{email || '—'}</span>
    </div>
  );
}

export function TemplateMobileCard({ template, onClick, className }: TemplateMobileCardProps) {
  const displayName = template.name?.trim() || '—';

  return (
    <ListCard onClick={onClick} className={className}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
      <ContactSummary template={template} />
      <p className="text-xs text-gray-500 mt-2">{formatTimestamp(template.createdDate, false)}</p>
    </ListCard>
  );
}
