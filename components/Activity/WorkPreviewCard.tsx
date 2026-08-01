'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { WorkCardAuthor, WorkCardStat } from './lib/activityWorkContext';

interface WorkPreviewCardProps {
  title: string;
  href?: string;
  imageSrc?: string;
  /** Render a gradient placeholder when no image is available. */
  showPlaceholder?: boolean;
  authors?: WorkCardAuthor[];
  /** Funding organization; takes precedence over authors on the meta line. */
  organization?: string | null;
  institution?: string | null;
  /** Average peer-review score shown next to the authors. */
  score?: number | null;
  /** Extra stats on the right of the frosted bar (label + value). */
  stats?: WorkCardStat[];
  /** Fundraise progress in the 0–1 range. */
  progress?: number;
  /** Full footer row (typically vote/save/share + CTA). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Full-bleed frosted-image card for activity feed rows.
 * Image fills the card; metadata sits in a translucent bar at the bottom.
 */
export const WorkPreviewCard: FC<WorkPreviewCardProps> = ({
  title,
  href,
  imageSrc,
  showPlaceholder = true,
  authors = [],
  organization,
  institution,
  score,
  stats,
  progress,
  actions,
  className,
}) => {
  const showFooter = !!actions;

  const authorLine =
    organization ||
    (authors.length > 0
      ? authors
          .slice(0, 2)
          .map((a) => a.name)
          .join(', ') + (authors.length > 2 ? ` +${authors.length - 2}` : '')
      : institution || null);

  const imageBlock = (
    <div
      className={cn(
        'group relative h-[190px] sm:h-[180px] overflow-hidden bg-gray-900',
        showFooter
          ? 'rounded-tl-[10px] rounded-tr-[10px] rounded-bl-none rounded-br-none'
          : 'rounded-[10px]'
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={title}
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
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-white tracking-tight line-clamp-2 leading-snug text-[14.5px]">
              {title}
            </div>
            {authorLine && (
              <div className="mt-0.5 truncate text-[11px] text-white/55">{authorLine}</div>
            )}
          </div>

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
        showFooter ? 'bg-white' : 'bg-transparent',
        className
      )}
    >
      {href ? (
        <Link href={href} className="block">
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}

      {showFooter && (
        <div className="flex h-[46px] w-full items-center px-2">
          <div className="w-full min-w-0">{actions}</div>
        </div>
      )}
    </div>
  );
};
