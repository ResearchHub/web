'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/styles';

interface WorkCoverProps {
  title: string;
  /** The small line over the title: who funds an RFP, who proposes a proposal. */
  eyebrow?: string;
  imageUrl?: string;
  /** Badges pinned to the cover's top-left corner (pending review, closed). */
  badges?: ReactNode;
  /** Save, share and the menu, pinned to the top-right corner. */
  actions?: ReactNode;
  /** Above the cover, e.g. the registered-report stage tracker. */
  preTitle?: ReactNode;
}

// Edge to edge on phones. From tablet, the same box as the narrow page row
// below (PageLayout's contentWidth="narrow"): its 1012px container, the main
// column's left padding, and from lg, where the sidebar shows, no right padding
// so the cover ends on the sidebar's edge. Between tablet and lg there is no
// sidebar and the main column stops at 860px, so the cover does too.
const COVER_ROW_CLASS = 'mx-auto w-full max-w-[1012px] tablet:!px-8 tablet:!pt-6 lg:!pr-0';
const COVER_BOX_CLASS =
  'tablet:!min-h-[280px] tablet:!max-w-[860px] tablet:!rounded-lg lg:!min-h-[300px] lg:!max-w-none';

/**
 * A work's large cover, for the RFP and proposal pages: its image with the
 * title on a frosted bar along the bottom. Without an image the bar sits on a
 * plain navy ground. A long title is never cut short: the bar grows up over
 * the image, and past the cover's height the cover grows with it.
 *
 * On phones a fixed-height box would crop most of a wide banner (a 3:1 image
 * in a square), so there the image keeps its own shape, uncut, and the title
 * sits on a navy band under it instead of over it.
 */
export function WorkCover({ title, eyebrow, imageUrl, badges, actions, preTitle }: WorkCoverProps) {
  return (
    <div className={COVER_ROW_CLASS}>
      {/* The tracker renders nothing for most works; empty:hidden drops its spacing then. */}
      {preTitle && (
        <div className="mb-3 px-4 pt-4 empty:hidden tablet:!px-0 tablet:!pt-0">{preTitle}</div>
      )}
      <div
        className={cn(
          'relative isolate overflow-hidden bg-[#0b1530]',
          // The bar sits at the bottom; the top keeps clear of the actions.
          'tablet:flex tablet:flex-col tablet:justify-end tablet:pt-16',
          COVER_BOX_CLASS
        )}
      >
        {imageUrl && (
          // Sized by its own width and height: full width at its natural shape
          // on phones, stretched over the whole box from tablet up. The
          // width and height here only reserve room until it loads.
          <Image
            src={imageUrl}
            alt=""
            width={1200}
            height={630}
            priority
            className="block h-auto w-full tablet:absolute tablet:inset-0 tablet:!h-full tablet:object-cover"
            sizes="(min-width: 1012px) 980px, 100vw"
          />
        )}

        {badges && <div className="absolute left-3 top-3 flex gap-1.5">{badges}</div>}
        {actions && (
          <div className="absolute right-3 top-3 rounded-xl bg-white/90 p-1 shadow-sm backdrop-blur">
            {actions}
          </div>
        )}

        <div
          className={cn(
            'relative px-4 pb-3.5 pt-3 sm:px-6 sm:pb-[18px] sm:pt-4',
            'tablet:border-t tablet:border-white/5 tablet:bg-black/50',
            'tablet:backdrop-blur-xl tablet:backdrop-saturate-150'
          )}
        >
          {eyebrow && (
            <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/80 sm:text-xs">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}

/** The cover's place while the page loads; on phones, about a wide image's height. */
export function WorkCoverSkeleton() {
  return (
    <div className={COVER_ROW_CLASS}>
      <div className={cn('h-[280px] animate-pulse bg-gray-100', COVER_BOX_CLASS)} />
    </div>
  );
}
