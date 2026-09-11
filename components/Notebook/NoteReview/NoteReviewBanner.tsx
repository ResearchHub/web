'use client';

import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import type { UseNoteAgentReviewResult } from './useNoteAgentReview';

interface NoteReviewBannerProps {
  readonly review: UseNoteAgentReviewResult;
  readonly className?: string;
}

/**
 * The failure banner for an assistant-version review: the assistant's
 * update couldn't be loaded (retry the review, or apply it without one), or
 * the save behind the user's choice failed (retry the save). Renders nothing
 * while a review is open or nothing has failed.
 */
export function NoteReviewBanner({ review, className }: NoteReviewBannerProps) {
  const { reloadFailed, persistFailed, isReloading, isPersisting } = review;
  if ((!reloadFailed && !persistFailed) || review.review != null) return null;
  const busy = isReloading || isPersisting;

  return (
    <div className={cn('rounded-lg border border-amber-200 bg-amber-50 px-3 py-2', className)}>
      <p className="text-xs text-amber-800">
        {persistFailed ? 'Couldn’t save the note.' : 'Couldn’t load the assistant’s update.'}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {persistFailed ? (
          <Button variant="outlined" size="sm" onClick={review.persistCurrentDoc} disabled={busy}>
            {isPersisting ? <Loader size="sm" /> : 'Try again'}
          </Button>
        ) : (
          <>
            <Button variant="outlined" size="sm" onClick={review.retryReview} disabled={busy}>
              {isReloading ? <Loader size="sm" /> : 'Try again'}
            </Button>
            <Button variant="ghost" size="sm" onClick={review.reloadWithoutReview} disabled={busy}>
              Reload without review
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
