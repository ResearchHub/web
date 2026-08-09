'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { getCommentPreview } from './lib/feedEntryAdapters';
import { getWorkCardPresentation, type ActivityWork } from './lib/activityWorkContext';
import type { FeedEntry } from '@/types/feed';

interface ActivityWorkMetadataProps {
  entry: FeedEntry;
  work: ActivityWork;
}

/**
 * Frosted-bar content for an activity work card (title, authors/org, rating, stats, progress).
 */
export const ActivityWorkMetadata: FC<ActivityWorkMetadataProps> = ({ entry, work }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const commentPreview = getCommentPreview(entry);
  const isReviewOfProposal = !!commentPreview?.isReview && work.documentType === 'preregistration';

  const presentation = getWorkCardPresentation(entry, work, {
    showUSD,
    exchangeRate,
    isReview: commentPreview?.isReview,
  });

  const authors = isReviewOfProposal ? [] : presentation.authors;
  const authorNames =
    authors.length > 0
      ? authors
          .slice(0, 2)
          .map((a) => a.name)
          .join(', ') + (authors.length > 2 ? ` +${authors.length - 2}` : '')
      : null;

  const authorLine =
    presentation.organization ||
    (authorNames && presentation.institution
      ? `${authorNames} · ${presentation.institution}`
      : authorNames || presentation.institution || null);

  const { score, stats, progress } = presentation;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-white tracking-tight line-clamp-2 leading-snug text-[14.5px]">
            {work.title}
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
    </>
  );
};
