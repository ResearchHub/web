'use client';

import { Check, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/styles';
import { getRequiredFields, usePublishingCompletion } from './completion';
import { getWorkPath } from './formMapping';
import { usePublishingController } from './PublishingFormProvider';

/** Stroke length of the ring's circumference, so a share of it can be dashed. */
const RING_CIRCUMFERENCE = 37.7;

interface PublishStatusPillProps {
  /** Opens the full details form, where the missing pieces are. */
  readonly onOpenDetails: () => void;
  readonly className?: string;
}

/**
 * Where the note stands on the way to publishing: how many required details
 * are still missing, that it is ready, or that it is already published (with
 * a way to its page).
 */
export function PublishStatusPill({ onOpenDetails, className }: PublishStatusPillProps) {
  const { note, articleType, workId, isPublished } = usePublishingController();
  const { remaining } = usePublishingCompletion();

  const base =
    'inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors';

  if (isPublished && note?.post && articleType && workId) {
    return (
      <a
        href={getWorkPath(articleType, workId, note.post.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          base,
          'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
          className
        )}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Published
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    );
  }

  if (remaining === 0) {
    return (
      <span className={cn(base, 'border-emerald-300 bg-emerald-50 text-emerald-700', className)}>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
        </span>
        Ready to publish
      </span>
    );
  }

  // The ring fills as the type's required details are completed.
  const total = articleType
    ? Math.max(getRequiredFields(articleType).length, remaining)
    : remaining;
  const done = total - remaining;

  return (
    <button
      type="button"
      onClick={onOpenDetails}
      title="See what is left to fill in"
      className={cn(
        base,
        'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="-rotate-90">
        <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" className="stroke-amber-200" />
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${(done / total) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
          className="stroke-amber-700"
        />
      </svg>
      {remaining} remaining
    </button>
  );
}
