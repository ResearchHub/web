'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import { WorkCoverArt } from './WorkCoverArt';
import type { ActivityWork, WorkCoverPresentation } from '../lib/activityWork.utils';

interface ActivityWorkCoverProps {
  work: ActivityWork;
  cover: WorkCoverPresentation;
  /** Fired when the reader follows the cover to the work. */
  onNavigate?: () => void;
  className?: string;
}

/**
 * The work an activity card is about: its cover, rounded on every corner and edged
 * in light gray so it reads apart from the words above it, with a frosted bar
 * along the bottom carrying the kind of work, its title and up to two figures, and
 * for a proposal, how far its fundraise has come.
 */
export const ActivityWorkCover: FC<ActivityWorkCoverProps> = ({
  work,
  cover,
  onNavigate,
  className,
}) => {
  const { eyebrow, brand, stats, progress } = cover;

  return (
    <Link
      href={work.href}
      onClick={onNavigate}
      className={cn(
        // `isolate` keeps the image's hover zoom inside the rounded corners in Safari.
        'group relative isolate block aspect-[3/2] overflow-hidden rounded-xl border border-gray-200 bg-gray-900 tablet:aspect-[2/1]',
        className
      )}
    >
      <WorkCoverArt
        imageUrl={work.imageUrl}
        title={work.title}
        brand={brand}
        sizes="(max-width: 768px) 80vw, 560px"
      />

      {/* Rounded itself, to the corners inside the border: a backdrop filter ignores
          the corners its parent clips to. */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-[11px] border-t border-white/[0.06] px-3.5 pb-2.5 pt-2 tablet:px-4"
        style={{
          backdropFilter: 'blur(16px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
          background: 'rgba(0,0,0,0.52)',
        }}
      >
        <div className="flex items-end gap-3 tablet:gap-5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[10px] font-bold uppercase leading-3 tracking-[0.08em] text-white/70">
              {eyebrow}
            </div>
            <div className="mt-0.5 line-clamp-2 text-[14.5px] font-bold leading-[19px] tracking-tight text-white tablet:text-[15px] tablet:leading-5">
              {work.title}
            </div>
          </div>

          {stats.length > 0 && (
            <div className="flex flex-shrink-0 gap-4 text-right">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="whitespace-nowrap text-[10px] font-semibold uppercase leading-3 tracking-[0.07em] text-white/60">
                    {stat.shortLabel ? (
                      <>
                        <span className="tablet:hidden">{stat.shortLabel}</span>
                        <span className="hidden tablet:inline">{stat.label}</span>
                      </>
                    ) : (
                      stat.label
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap font-mono text-sm font-semibold leading-5 tablet:text-[15px]">
                    {stat.tone === 'rating' ? (
                      <>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                        <span className="text-white/90">{stat.value}</span>
                      </>
                    ) : (
                      <span className="text-emerald-300">{stat.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {progress != null && (
          <div
            role="progressbar"
            aria-label="Funding progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
};
