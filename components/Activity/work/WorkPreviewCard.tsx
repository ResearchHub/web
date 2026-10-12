'use client';

import { Children, FC, isValidElement, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { WorkCoverArt } from './WorkCoverArt';

interface WorkPreviewShell {
  title: string;
  href: string;
  imageUrl?: string;
}

interface SlotProps {
  children?: ReactNode;
}

function WorkPreviewCardMetadata({ children }: SlotProps) {
  return <>{children}</>;
}

function WorkPreviewCardActions({ children }: SlotProps) {
  return <>{children}</>;
}

/** Corners available to the overlay. The bottom edge belongs to the metadata bar. */
type OverlayPosition = 'top-left' | 'top-right';

const OVERLAY_POSITION_CLASSES: Record<OverlayPosition, string> = {
  'top-left': 'left-2 top-2',
  'top-right': 'right-2 top-2',
};

interface OverlaySlotProps extends SlotProps {
  position?: OverlayPosition;
}

function WorkPreviewCardOverlay({ children }: OverlaySlotProps) {
  return <>{children}</>;
}

function findSlot<P extends SlotProps>(
  children: ReactNode,
  slot: FC<P>
): ReactElement<P> | undefined {
  return Children.toArray(children).find(
    (child): child is ReactElement<P> => isValidElement(child) && child.type === slot
  );
}

interface WorkPreviewCardProps {
  work: WorkPreviewShell;
  children?: ReactNode;
  /** Render a gradient placeholder when no image is available. */
  showPlaceholder?: boolean;
  /** Stand in for a missing image with the publisher's logo. */
  brand?: 'researchhub';
  /** Fired when the user navigates via the work link (not footer actions). */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Full-bleed frosted-image card for activity feed rows.
 * Image fills the card; metadata sits in a translucent bar at the bottom.
 *
 * Compose with slots:
 * ```tsx
 * <WorkPreviewCard work={work}>
 *   <WorkPreviewCard.Overlay position="top-left">...</WorkPreviewCard.Overlay>
 *   <WorkPreviewCard.Metadata>...</WorkPreviewCard.Metadata>
 *   <WorkPreviewCard.Actions>...</WorkPreviewCard.Actions>
 * </WorkPreviewCard>
 * ```
 */
function WorkPreviewCardRoot({
  work,
  children,
  showPlaceholder = true,
  brand,
  onNavigate,
  className,
}: WorkPreviewCardProps) {
  const metadata = findSlot(children, WorkPreviewCardMetadata)?.props.children;
  const actions = findSlot(children, WorkPreviewCardActions)?.props.children;
  const overlaySlot = findSlot(children, WorkPreviewCardOverlay);
  const overlay = overlaySlot?.props.children;
  const overlayPosition = overlaySlot?.props.position ?? 'top-left';
  const showFooter = !!actions;

  const imageBlock = (
    <div
      className={cn(
        'group relative h-[190px] sm:h-[180px] overflow-hidden bg-gray-900',
        showFooter
          ? 'rounded-tl-[10px] rounded-tr-[10px] rounded-bl-none rounded-br-none'
          : 'rounded-[10px]'
      )}
    >
      <WorkCoverArt
        imageUrl={work.imageUrl}
        title={work.title}
        brand={brand}
        showPlaceholder={showPlaceholder}
      />

      <div
        className="absolute bottom-0 inset-x-0 px-4 pb-2 pt-2 border-t border-white/[0.06]"
        style={{
          backdropFilter: 'blur(16px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
          background: 'rgba(0,0,0,0.52)',
        }}
      >
        {metadata ?? (
          <div className="font-extrabold text-white tracking-tight line-clamp-2 leading-snug text-[14.5px]">
            {work.title}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'relative rounded-[14px] border border-gray-200',
        showFooter ? 'bg-white' : 'bg-transparent',
        className
      )}
    >
      {work.href ? (
        <Link
          href={work.href}
          className="block"
          onClick={() => {
            onNavigate?.();
          }}
        >
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}

      {/* Sits outside the link so badge tooltips don't double as navigation. */}
      {overlay && (
        <div
          className={cn(
            'absolute z-10 flex items-center gap-1.5',
            OVERLAY_POSITION_CLASSES[overlayPosition]
          )}
        >
          {overlay}
        </div>
      )}

      {showFooter && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2">
          <div className="w-full min-w-0">{actions}</div>
        </div>
      )}
    </div>
  );
}

export const WorkPreviewCard = Object.assign(WorkPreviewCardRoot, {
  Metadata: WorkPreviewCardMetadata,
  Actions: WorkPreviewCardActions,
  Overlay: WorkPreviewCardOverlay,
});
