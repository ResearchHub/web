'use client';

import { FC, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Coins, FileInput, Landmark, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { useNavigation } from '@/contexts/NavigationContext';
import { getUnifiedDocumentId } from '@/types/analytics';
import {
  buildJournalV2FeedItemViewModel,
  JournalV2Stage,
  JournalV2StageLink,
} from '@/components/Journal/lib/journalV2FeedItem';

interface JournalV2FeedEntryItemProps {
  entry: FeedEntry;
  index: number;
  feedOrdering?: string;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
}

const STAGE_ICONS: Record<JournalV2Stage, typeof Landmark> = {
  funding_opportunity: Landmark,
  proposal: Coins,
  registered_report: FileInput,
};

export const JournalV2FeedEntryItem: FC<JournalV2FeedEntryItemProps> = ({
  entry,
  index,
  feedOrdering,
  registerVisibleItem,
  unregisterVisibleItem,
  getVisibleItems,
}) => {
  const { updateLastClickedEntryId } = useNavigation();
  const unifiedDocumentId = getUnifiedDocumentId(entry);
  const viewModel = buildJournalV2FeedItemViewModel(entry);

  const { ref } = useInView({
    threshold: 0,
    rootMargin: '50px',
    onChange: (inView) => {
      if (!unifiedDocumentId) return;
      if (inView) {
        registerVisibleItem(index, unifiedDocumentId);
      } else {
        unregisterVisibleItem(index, unifiedDocumentId);
      }
    },
  });

  const getImpressions = useCallback(() => {
    if (!unifiedDocumentId) return undefined;
    const visibleItems = getVisibleItems(unifiedDocumentId);
    return visibleItems.length > 0 ? visibleItems : undefined;
  }, [unifiedDocumentId, getVisibleItems]);

  const { handleFeedItemClick } = useFeedItemAnalyticsTracking({
    entry,
    feedPosition: index + 1,
    feedOrdering,
    impression: getImpressions(),
  });

  if (!viewModel) {
    return null;
  }

  const entryIdKey = `JOURNAL:${entry.id}`;

  const handleCardClick = () => {
    handleFeedItemClick();
    updateLastClickedEntryId(entryIdKey);
  };

  const reviewSummary = viewModel.reviewSummary;
  const proposalHref = viewModel.trackerSteps.find((step) => step.stage === 'proposal')?.href;
  const availableTrackerSteps = viewModel.trackerSteps.filter(
    (step): step is JournalV2StageLink & { href: string } => Boolean(step.href)
  );

  return (
    <div ref={ref} className={index === 0 ? undefined : 'mt-8'}>
      <article className="overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="group relative h-[200px] overflow-hidden bg-gray-900 sm:h-[165px]">
          {viewModel.imageUrl ? (
            <Image
              src={viewModel.imageUrl}
              alt={viewModel.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 660px"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 25% 35%, rgba(96,165,250,0.55) 0%, transparent 50%), ' +
                  'radial-gradient(ellipse at 58% 58%, rgba(16,185,129,0.35) 0%, transparent 45%), ' +
                  'radial-gradient(ellipse at 82% 20%, rgba(244,114,182,0.35) 0%, transparent 40%), ' +
                  'linear-gradient(135deg, #111827 0%, #0f172a 48%, #172554 100%)',
              }}
            />
          )}

          <Link
            href={viewModel.href}
            onClick={handleCardClick}
            className="absolute inset-0"
            aria-label={`View ${viewModel.title}`}
          />

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 border-t border-white/[0.08] px-5 py-3 sm:flex-row sm:items-end sm:justify-between"
            style={{
              backdropFilter: 'blur(16px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
              background: 'rgba(0,0,0,0.52)',
            }}
          >
            <div className="min-w-0">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-white/45 mb-0.5">
                {viewModel.currentStageLabel}
              </div>
              <h2 className="truncate text-base font-extrabold tracking-tight text-white">
                {viewModel.title}
              </h2>
            </div>

            <div className="flex w-full flex-shrink-0 items-end justify-between gap-5 sm:w-auto sm:justify-end">
              <div className="pointer-events-auto text-left sm:text-right">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
                  Average Review
                </div>
                {reviewSummary ? (
                  <Tooltip
                    content={
                      <PeerReviewTooltip
                        reviews={reviewSummary.reviews}
                        averageScore={reviewSummary.average}
                        href={proposalHref ?? viewModel.href}
                      />
                    }
                    position="top"
                    width="w-[320px]"
                  >
                    <span className="inline-flex items-center gap-1 font-extrabold font-mono text-base text-emerald-300 cursor-help">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {reviewSummary.average.toFixed(1)}/5
                    </span>
                  </Tooltip>
                ) : (
                  <div className="font-extrabold font-mono text-base text-white/70">--/5</div>
                )}
              </div>

              <div className="pointer-events-auto">
                <BaseMenu
                  trigger={
                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-white/15 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
                    >
                      View
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                  }
                  align="end"
                  className="min-w-[12rem]"
                >
                  {availableTrackerSteps.map((step) => {
                    const StepIcon = STAGE_ICONS[step.stage];

                    return (
                      <BaseMenuItem key={step.stage} asChild>
                        <Link
                          href={step.href}
                          onClick={handleCardClick}
                          className="flex items-center gap-2 px-2 py-1.5"
                        >
                          <StepIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          {step.label}
                        </Link>
                      </BaseMenuItem>
                    );
                  })}
                </BaseMenu>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
