'use client';

import { FC } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PhonePreview } from '@/components/modals/NewlyCreatedProposalModal';
import { cn } from '@/utils/styles';

interface PostVideoCalloutProps {
  /** Personalises the in-phone caption with the proposal's title. */
  proposalTitle?: string;
  /** Opens the in-depth video guide modal (step 2 — outline + platforms). */
  onShowGuide: () => void;
  /** Permanently dismisses this callout for the current document. */
  onDismiss: () => void;
  className?: string;
}

const PAYOUT_STEPS = ['Post video', 'Share link', 'Get $50'];

/**
 * Standalone CTA banner shown to proposal authors who haven't posted yet.
 * Lifted out of the AuthorPosts section so the "Author posts" header isn't
 * stacked above the rich pitch.
 *
 * Layout:
 * - Uniform `p-3` on the wrapper so the phone preview never touches the
 *   border on any side.
 * - Phone sits on the left; the right column owns the heading, copy,
 *   payout steps, a divider, and the CTA row.
 * - The right column stretches to the phone's height (`items-stretch`)
 *   and uses `mt-auto` on the divider+CTA group so the buttons land
 *   inline with the phone's bottom edge.
 */
export const PostVideoCallout: FC<PostVideoCalloutProps> = ({
  proposalTitle,
  onShowGuide,
  onDismiss,
  className,
}) => {
  return (
    <div
      className={cn(
        // Uniform padding on the wrapper keeps the phone preview from
        // touching the border on any side.
        'mb-6 overflow-hidden rounded-lg border bg-white p-3 shadow-sm',
        className
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        {/*
         * PhonePreview is fixed at 132×234 to keep the modal hero punchy.
         * Rendered at 75% here via a scaled wrapper with explicit dims so
         * the layout occupies the smaller footprint while the inner play
         * button, caption and notch stay perfectly proportioned. Hidden on
         * mobile; the right column then takes the full card width.
         */}
        <div className="hidden h-[176px] w-[99px] shrink-0 sm:block">
          <div className="origin-top-left scale-75">
            <PhonePreview proposalTitle={proposalTitle} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-2">
            <h3 className="m-0 text-base font-bold leading-snug tracking-[-0.01em] text-gray-900">
              Show funders who you are.
            </h3>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>

          <p className="m-0 mt-1 text-sm leading-snug text-gray-600">
            Post a 1–3 minute pitch video and{' '}
            <span className="font-semibold text-gray-900">earn $50 towards your proposal</span>.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {PAYOUT_STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-2.5 w-2.5 shrink-0 text-gray-400" />}
                <div className="inline-flex items-center gap-1.5">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] font-semibold text-gray-600">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/*
           * Divider + single outlined CTA, scoped to the right column and
           * pinned to its bottom via `mt-auto` so it lines up with the
           * phone's bottom edge. `justify-end` parks the button on the right.
           */}
          <div className="mt-auto pt-3">
            <div className="border-t border-gray-200" />
            <div className="flex justify-end pt-3">
              <Button variant="outlined" size="sm" onClick={onShowGuide} className="gap-1.5">
                Show me how
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
