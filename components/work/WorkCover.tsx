'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';

/** The face beside the eyebrow: the funder's, or the lead author's. */
export interface CoverEyebrowFace {
  name: string;
  image?: string | null;
}

interface WorkCoverProps {
  title: string;
  /** The small line over the title: who funds an RFP, who proposes a proposal. */
  eyebrow?: string;
  /** A small face before the eyebrow; without an image, the name's initials. */
  eyebrowFace?: CoverEyebrowFace;
  imageUrl?: string;
  /** Badges pinned to the cover's top-left corner (pending review, closed); on phones, over the eyebrow. */
  badges?: ReactNode;
  /** Save, share and the menu, pinned to the top-right corner. */
  actions?: ReactNode;
  /** Above the cover, e.g. the registered-report stage tracker. */
  preTitle?: ReactNode;
  className?: string;
}

/**
 * What every chip over a cover's image wears (its badges, the actions): a
 * hairline edge and a soft shadow, so a white chip still stands off a white
 * image.
 */
export const COVER_CHIP_CLASS = 'shadow-md ring-1 ring-black/10';

/** A chip for a cover's corner, e.g. "Closed". */
export function CoverBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-gray-700',
        COVER_CHIP_CLASS
      )}
    >
      {children}
    </span>
  );
}

/** The small line over a cover's title: who funds an RFP, who proposes a proposal. */
export function CoverEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('truncate font-bold uppercase tracking-[0.08em] text-white/80', className)}>
      {children}
    </p>
  );
}

// Edge to edge on phones. From tablet, the same box as the narrow page row
// below (PageLayout's contentWidth="narrow"): its 1012px container, the main
// column's left padding, and from lg, where the sidebar shows, no right padding
// so the cover ends on the sidebar's edge. Between tablet and lg there is no
// sidebar and the main column stops at 860px, so the cover does too. The page
// tabs under the cover share these widths.
export const WORK_ROW_CLASS = 'mx-auto w-full max-w-[1012px] tablet:!px-8 lg:!pr-0';
export const WORK_BOX_WIDTH_CLASS = 'tablet:!max-w-[860px] lg:!max-w-none';
const COVER_ROW_CLASS = cn(WORK_ROW_CLASS, 'tablet:!pt-6');
const COVER_BOX_CLASS = cn(
  WORK_BOX_WIDTH_CLASS,
  'tablet:!min-h-[280px] tablet:!rounded-lg lg:!min-h-[300px]'
);

// Under a mouse the image grows a little, as the homepage feed's covers do,
// overshooting a touch before it settles. It eases straight back when the
// mouse leaves, since leaving runs the resting state's transition. Not on
// touch screens, where a tap would leave it grown, nor with reduced motion.
const IMAGE_HOVER_CLASS = cn(
  'transition-transform duration-300 ease-out',
  'motion-safe:[@media(hover:hover)_and_(pointer:fine)]:group-hover/cover:scale-105',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/cover:duration-500',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/cover:ease-[cubic-bezier(0.34,1.56,0.64,1)]'
);

/**
 * A work's large cover, for the RFP and proposal pages: its image with the
 * title on a frosted bar along the bottom. Without an image the bar sits on a
 * plain navy ground. A long title is never cut short: the bar grows up over
 * the image, and past the cover's height the cover grows with it.
 *
 * On phones a fixed-height box would crop most of a wide banner (a 3:1 image
 * in a square), so there the image keeps its own shape, uncut, and the title
 * sits on a navy band under it instead of over it, with the badges at the
 * band's top so that only the actions sit on the image.
 */
export function WorkCover({
  title,
  eyebrow,
  eyebrowFace,
  imageUrl,
  badges,
  actions,
  preTitle,
  className,
}: WorkCoverProps) {
  return (
    <div className={cn(COVER_ROW_CLASS, className)}>
      {/* The tracker renders nothing for most works; empty:hidden drops its spacing then. */}
      {preTitle && (
        <div className="mb-3 px-4 pt-4 empty:hidden tablet:!px-0 tablet:!pt-0">{preTitle}</div>
      )}
      <div
        className={cn(
          'group/cover relative isolate overflow-hidden bg-navy',
          // The bar sits at the bottom; the top keeps clear of the actions.
          'tablet:flex tablet:flex-col tablet:justify-end tablet:pt-16',
          COVER_BOX_CLASS
        )}
      >
        {imageUrl && (
          // Its frame clips it as it grows. On phones it sits above the title
          // band, which it would otherwise spill onto.
          <div className="overflow-hidden tablet:absolute tablet:inset-0">
            {/* Sized by its own width and height: full width at its natural
                shape on phones, stretched over the whole box from tablet up.
                The width and height here only reserve room until it loads.
                On phones a very wide banner is still as tall as the actions
                and their margins, cropped at its sides to get there. */}
            <Image
              src={imageUrl}
              alt=""
              width={1200}
              height={630}
              priority
              className={cn(
                'block h-auto min-h-[68px] w-full object-cover',
                'tablet:absolute tablet:inset-0 tablet:!h-full',
                IMAGE_HOVER_CLASS
              )}
              sizes="(min-width: 1012px) 980px, 100vw"
            />
          </div>
        )}

        {/* Over the image's top: the actions on the right and, from tablet,
            the badges on the left. Where both don't fit across, the actions
            keep the top and the badges wrap under them. On phones they never
            fit across, and a wide banner is too short for two rows, so there
            the badges open the title band instead. Above the band, which
            comes later and would otherwise take their taps. A phone's cover
            without an image has the row in the flow, over the band. */}
        {(badges || actions) && (
          <div
            className={cn(
              'pointer-events-none z-10 flex flex-wrap-reverse items-end gap-2',
              imageUrl
                ? 'absolute inset-x-3 top-3'
                : 'relative px-3 pt-3 tablet:absolute tablet:inset-x-3 tablet:top-3 tablet:p-0'
            )}
          >
            {badges && (
              <div className="pointer-events-auto hidden min-w-0 flex-wrap gap-1.5 tablet:flex">
                {badges}
              </div>
            )}
            {actions && (
              <div
                className={cn(
                  'pointer-events-auto ml-auto rounded-xl bg-white/90 p-1 backdrop-blur',
                  COVER_CHIP_CLASS
                )}
              >
                {actions}
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            'relative px-4 pb-3.5 pt-3 sm:px-6 sm:pb-[18px] sm:pt-4',
            'tablet:border-t tablet:border-white/5 tablet:bg-black/50',
            'tablet:backdrop-blur-xl tablet:backdrop-saturate-150'
          )}
        >
          {/* The phone's place for the badges. A badge that renders nothing
              leaves the row empty, and empty:hidden drops its spacing. */}
          {badges && (
            <div className="mb-2.5 flex flex-wrap gap-1.5 empty:hidden tablet:hidden">{badges}</div>
          )}
          {eyebrow && (
            <div className="flex min-w-0 items-center gap-2">
              {eyebrowFace && (
                <Avatar
                  src={eyebrowFace.image}
                  alt={eyebrowFace.name}
                  size={22}
                  className="ring-1 ring-white/40"
                />
              )}
              <CoverEyebrow className="text-[10.5px] sm:text-xs">{eyebrow}</CoverEyebrow>
            </div>
          )}
          <h1 className="mt-1.5 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
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
