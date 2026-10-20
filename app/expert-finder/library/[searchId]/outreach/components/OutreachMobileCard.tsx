'use client';

import type { MouseEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/utils/date';
import { ListCard } from '@/components/ui/ListCard';
import type { GeneratedEmail } from '@/types/expertFinder';
import { getGeneratedEmailStatusPresentation } from '@/app/expert-finder/lib/generatedEmailStatus';
import { getOutreachChannelLabels } from '@/app/expert-finder/lib/outreachChannels';

export interface OutreachMobileCardProps {
  email: GeneratedEmail;
  className?: string;
  selected?: boolean;
  selectable?: boolean;
  onToggleSelect?: (emailId: number, e: MouseEvent) => void;
}

export function OutreachMobileCard({
  email,
  className,
  selected = false,
  selectable = true,
  onToggleSelect,
}: OutreachMobileCardProps) {
  const expertName = email.expertName?.trim() || '—';
  const expertEmail = email.expertEmail?.trim() || '';
  const statusPresentation = getGeneratedEmailStatusPresentation(email);
  const showChannels = email.status === 'sent' || Boolean(email.sentAt);
  const channelLabels = showChannels ? getOutreachChannelLabels(email.channels) : [];
  const createdByName = email.createdBy?.author?.fullName?.trim() || '—';

  const selectTrailing =
    onToggleSelect != null ? (
      <input
        type="checkbox"
        checked={selected}
        disabled={!selectable}
        onChange={() => {}}
        onClick={(e) => {
          e.stopPropagation();
          if (!selectable) return;
          onToggleSelect(email.id, e);
        }}
        className={
          selectable
            ? 'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer mt-0.5'
            : 'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-not-allowed opacity-40 mt-0.5'
        }
        aria-label={
          selectable ? `Select ${expertName}` : `${expertName} cannot be removed from queue`
        }
      />
    ) : undefined;

  return (
    <ListCard className={className} trailing={selectTrailing}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{expertName}</h3>
      {expertEmail ? (
        <p className="text-xs text-gray-500 mt-0.5 break-all" title={expertEmail}>
          {expertEmail}
        </p>
      ) : null}
      <p className="text-xs text-gray-500 mt-0.5">by {createdByName}</p>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Badge variant={statusPresentation.variant} size="sm">
          {statusPresentation.label}
        </Badge>
        {channelLabels.map((channelLabel) => (
          <Badge key={channelLabel} variant="default" size="sm">
            via {channelLabel}
          </Badge>
        ))}
        <p className="text-xs text-gray-500">{formatTimestamp(email.createdAt, false)}</p>
      </div>
    </ListCard>
  );
}
