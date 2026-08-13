'use client';

import { Children, FC, isValidElement, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/styles';

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

function findSlot(children: ReactNode, slot: FC<SlotProps>): ReactElement<SlotProps> | undefined {
  return Children.toArray(children).find(
    (child): child is ReactElement<SlotProps> => isValidElement(child) && child.type === slot
  );
}

interface WorkPreviewCardProps {
  work: WorkPreviewShell;
  children?: ReactNode;
  /** Render a gradient placeholder when no image is available. */
  showPlaceholder?: boolean;
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
 *   <WorkPreviewCard.Metadata>...</WorkPreviewCard.Metadata>
 *   <WorkPreviewCard.Actions>...</WorkPreviewCard.Actions>
 * </WorkPreviewCard>
 * ```
 */
function WorkPreviewCardRoot({
  work,
  children,
  showPlaceholder = true,
  onNavigate,
  className,
}: WorkPreviewCardProps) {
  const metadata = findSlot(children, WorkPreviewCardMetadata)?.props.children;
  const actions = findSlot(children, WorkPreviewCardActions)?.props.children;
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
      {work.imageUrl ? (
        <Image
          src={work.imageUrl}
          alt={work.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      ) : showPlaceholder ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 25% 35%, rgba(251,146,60,0.55) 0%, transparent 50%), ' +
              'radial-gradient(ellipse at 55% 55%, rgba(59,130,246,0.45) 0%, transparent 45%), ' +
              'radial-gradient(ellipse at 80% 20%, rgba(244,63,94,0.35) 0%, transparent 40%), ' +
              'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gray-800" />
      )}

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
        'rounded-[14px] border border-gray-200',
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

      {showFooter && (
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="w-full min-w-0">{actions}</div>
        </div>
      )}
    </div>
  );
}

export const WorkPreviewCard = Object.assign(WorkPreviewCardRoot, {
  Metadata: WorkPreviewCardMetadata,
  Actions: WorkPreviewCardActions,
});
