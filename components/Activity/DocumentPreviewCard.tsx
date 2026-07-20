'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { FeedDocumentAuthor } from './lib/feedEntryAdapters';

interface DocumentPreviewCardProps {
  title: string;
  href?: string;
  /** Thumbnail image URL. Pass `showPlaceholder` to render a fallback when absent. */
  imageSrc?: string;
  /** Render a placeholder thumbnail when no image is available. */
  showPlaceholder?: boolean;
  /** Document authors shown in the frosted bar. */
  authors?: FeedDocumentAuthor[];
  /** Institution or nonprofit line (proposals). */
  institution?: string | null;
  /** Average peer-review score shown next to the authors. */
  score?: number | null;
  /** Document-type badge / eyebrow label pinned to the frosted bar. */
  badge?: string | null;
  /** Small line under the title/authors (e.g. "closes in 6 days"). */
  meta?: ReactNode;
  /** Action rendered inside the frosted bar (e.g. a Review button). */
  action?: ReactNode;
  /** Extra stats shown on the right side of the frosted bar (label + value pairs). */
  stats?: Array<{ label: string; value: string; accent?: boolean }>;
  /** Fundraise progress in the 0–1 range; renders a slim bar in the frosted bar. */
  progress?: number;
  /** Organisation shown as the eyebrow above the title. */
  organization?: string | null;
  /** Height of the card image area. Defaults to 'normal'. */
  size?: 'normal' | 'compact';
  /** Nested content rendered inside the card frame, below the image (e.g. a quoted parent card). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Full-bleed frosted-image card.
 *
 * The image fills the entire card. When no image is available a dark gradient
 * placeholder is rendered. Metadata (title, authors, badge, stats, action) sits
 * in a translucent frosted bar pinned to the bottom of the card.
 */
export const DocumentPreviewCard: FC<DocumentPreviewCardProps> = ({
  title,
  href,
  imageSrc,
  showPlaceholder = false,
  authors = [],
  institution,
  score,
  badge,
  meta,
  action,
  stats,
  progress,
  organization,
  size = 'normal',
  footer,
  className,
}) => {
  const hasImage = !!imageSrc || showPlaceholder;
  const imageHeight = size === 'compact' ? 'h-[110px]' : 'h-[190px] sm:h-[180px]';

  const eyebrow = organization || badge || null;

  const authorLine =
    authors.length > 0
      ? authors
          .slice(0, 2)
          .map((a) => a.name)
          .join(', ') + (authors.length > 2 ? ` +${authors.length - 2}` : '')
      : institution || null;

  const imageBlock = (
    <div
      className={cn(
        'group relative overflow-hidden bg-gray-900',
        action
          ? 'rounded-tl-[10px] rounded-tr-[10px] rounded-bl-none rounded-br-none'
          : 'rounded-[10px]',
        imageHeight
      )}
    >
      {/* Background image or gradient */}
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      ) : (
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
      )}

      {/* Frosted metadata bar */}
      <div
        className="absolute bottom-0 inset-x-0 px-4 pb-2 pt-2 border-t border-white/[0.06]"
        style={{
          backdropFilter: 'blur(16px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
          background: 'rgba(0,0,0,0.52)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left column: eyebrow, title, optional author/meta */}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <div className="truncate text-[9px] font-semibold uppercase tracking-wider text-white/40">
                {eyebrow}
              </div>
            )}
            <div
              className={cn(
                'font-extrabold text-white tracking-tight line-clamp-2 leading-snug',
                size === 'compact' ? 'text-[13px]' : 'text-[14.5px]'
              )}
            >
              {title}
            </div>
            {authorLine && (
              <div className="mt-0.5 truncate text-[11px] text-white/55">{authorLine}</div>
            )}
          </div>

          {/* Right column: horizontally laid-out stacked stat blocks */}
          {(score != null || stats?.length) && (
            <div className="flex flex-shrink-0 items-center gap-4">
              {score != null && (
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-white/50 whitespace-nowrap">
                    Rating
                  </div>
                  <div className="flex items-center justify-end gap-1 font-extrabold font-mono text-sm leading-tight text-white/80">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {score.toFixed(1)}
                  </div>
                </div>
              )}
              {stats?.map((s) => (
                <div key={s.label} className="text-right">
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-white/50 whitespace-nowrap">
                    {s.label}
                  </div>
                  <div
                    className={cn(
                      'font-extrabold font-mono text-sm leading-tight',
                      s.accent ? 'text-emerald-300' : 'text-white/80'
                    )}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {progress != null && (
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${Math.max(10, Math.min(100, progress * 100))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'rounded-[14px] border border-gray-200',
        action ? 'bg-gray-100' : 'bg-transparent',
        className
      )}
    >
      {/* Only the image block is wrapped in the Link so the footer action row
          (its own button/link) is never nested inside the anchor. */}
      {href ? (
        <Link href={href} className="block">
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}

      {/* Footer action strip inside the card frame, below the image. Meta sits
          on the left for balance; the CTA is anchored right. */}
      {action && (
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0 flex-1">
            {meta && <span className="block truncate text-[12px] text-gray-500">{meta}</span>}
          </div>
          <div className="flex-shrink-0">{action}</div>
        </div>
      )}

      {footer && <div className={cn('px-2 pb-2', action ? 'pt-0' : 'pt-2')}>{footer}</div>}
    </div>
  );
};
