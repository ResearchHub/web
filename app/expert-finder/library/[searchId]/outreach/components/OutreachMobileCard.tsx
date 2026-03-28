'use client';

import type { MouseEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatTimestamp } from '@/utils/date';
import { ListCard } from '@/components/ui/ListCard';
import {
  getTemplateDisplayLabel,
  getTemplateDescription,
} from '@/app/expert-finder/library/[searchId]/components/GenerateEmailModal';
import type { GeneratedEmail } from '@/types/expertFinder';
import { getGeneratedEmailStatusPresentation } from '@/app/expert-finder/lib/generatedEmailStatus';

const SUBJECT_TRUNCATE_LENGTH = 50;

function truncateSubject(s: string): string {
  if (!s?.trim()) return '—';
  const t = s.trim();
  return t.length <= SUBJECT_TRUNCATE_LENGTH ? t : `${t.slice(0, SUBJECT_TRUNCATE_LENGTH)}…`;
}

export interface OutreachMobileCardProps {
  email: GeneratedEmail;
  onClick: () => void;
  className?: string;
  /** When set, shows a checkbox that does not trigger `onClick` on the card. */
  selected?: boolean;
  onToggleSelect?: (emailId: number, e: MouseEvent) => void;
}

export function OutreachMobileCard({
  email,
  onClick,
  className,
  selected = false,
  onToggleSelect,
}: OutreachMobileCardProps) {
  const expertName = email.expertName?.trim() || '—';
  const subject = truncateSubject(email.emailSubject);
  const templateLabel = getTemplateDisplayLabel(email.template);
  const templateDescription = getTemplateDescription(email.template);
  const statusPresentation = getGeneratedEmailStatusPresentation(email.status);
  const createdByName = email.createdBy?.author?.fullName;

  const selectTrailing =
    onToggleSelect != null ? (
      <input
        type="checkbox"
        checked={selected}
        onChange={() => {}}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(email.id, e);
        }}
        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer mt-0.5"
        aria-label={`Select ${expertName}`}
      />
    ) : undefined;

  return (
    <ListCard onClick={onClick} className={className} trailing={selectTrailing}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{expertName}</h3>
      <p className="text-xs text-gray-600 mt-1 truncate" title={email.emailSubject}>
        {subject}
      </p>
      {createdByName && <p className="text-xs text-gray-500 mt-0.5">by {createdByName}</p>}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Badge variant={statusPresentation.variant} size="sm">
          {statusPresentation.label}
        </Badge>
        {templateDescription ? (
          <Tooltip content={templateDescription} width="w-72" position="top">
            <span className="text-xs text-gray-500 truncate max-w-[140px] cursor-help underline decoration-dotted decoration-gray-400 underline-offset-1">
              {templateLabel}
            </span>
          </Tooltip>
        ) : (
          <span className="text-xs text-gray-500 truncate max-w-[140px]">{templateLabel}</span>
        )}
        <p className="text-xs text-gray-500">{formatTimestamp(email.createdAt, false)}</p>
      </div>
    </ListCard>
  );
}
