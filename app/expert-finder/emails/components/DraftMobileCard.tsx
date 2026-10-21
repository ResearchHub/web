'use client';

import { formatTimestamp } from '@/utils/date';
import type { SavedTemplate } from '@/types/expertFinder';
import { ListCard } from '@/components/ui/ListCard';
import { stripHtml } from '@/utils/stringUtils';

export interface DraftMobileCardProps {
  draft: SavedTemplate;
  onClick: () => void;
  className?: string;
}

export function DraftMobileCard({ draft, onClick, className }: DraftMobileCardProps) {
  const displayName = draft.name?.trim() || '—';
  const subject = draft.emailSubject?.trim() || '—';
  const bodySnippet = stripHtml(draft.emailBody ?? '').trim();
  const createdByName = draft.createdBy?.author?.fullName;

  return (
    <ListCard onClick={onClick} className={className}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
      <p className="text-xs font-medium text-gray-700 mt-1 truncate">{subject}</p>
      {bodySnippet ? (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{bodySnippet}</p>
      ) : null}
      {createdByName ? <p className="text-xs text-gray-500 mt-1">by {createdByName}</p> : null}
      <p className="text-xs text-gray-500 mt-2">{formatTimestamp(draft.createdDate, false)}</p>
    </ListCard>
  );
}
