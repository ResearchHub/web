'use client';

import { FC, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coins, FileInput, Landmark, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { useNavigation } from '@/contexts/NavigationContext';
import { getUnifiedDocumentId } from '@/types/analytics';
import { cn } from '@/utils/styles';
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

const TRACKER_CLIP_PATHS = {
  first: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
  middle: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
  last: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)',
} as const;

/** Resolves the angled tracker shape for a stage position. */
function resolveTrackerClipPath(stepIndex: number, stepCount: number): string {
  if (stepIndex === 0) return TRACKER_CLIP_PATHS.first;
  if (stepIndex === stepCount - 1) return TRACKER_CLIP_PATHS.last;
  return TRACKER_CLIP_PATHS.middle;
}

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

  const renderTrackerStep = (step: JournalV2StageLink, stepIndex: number) => {
    const StepIcon = STAGE_ICONS[step.stage];
    const className = cn(
      'relative flex min-h-[54px] items-center justify-center gap-2 border px-3 py-2 text-xs font-semibold transition-colors',
      step.href
        ? 'border-primary-500 bg-primary-500 text-white hover:bg-primary-600'
        : 'border-gray-200 bg-white text-gray-400',
      stepIndex === 0 && 'rounded-l-lg',
      stepIndex === viewModel.trackerSteps.length - 1 && 'rounded-r-lg'
    );
    const style = {
      clipPath: resolveTrackerClipPath(stepIndex, viewModel.trackerSteps.length),
    };
    const content = (
      <>
        <StepIcon size={16} />
        <span className="hidden sm:inline">{step.label}</span>
      </>
    );

    if (!step.href) {
      return (
        <div key={step.label} className={className} style={style} aria-disabled="true">
          {content}
        </div>
      );
    }

    return (
      <Link
        key={step.label}
        href={step.href}
        onClick={(e) => e.stopPropagation()}
        className={className}
        style={style}
      >
        {content}
      </Link>
    );
  };

  return (
    <div ref={ref} className={index === 0 ? undefined : 'mt-8'}>
      <article className="overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <Link
          href={viewModel.href}
          onClick={handleCardClick}
          className="group block relative h-[200px] overflow-hidden bg-gray-900 sm:h-[165px]"
        >
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

          <div
            className="absolute bottom-0 inset-x-0 flex flex-col gap-3 px-5 py-3 border-t border-white/[0.08] sm:flex-row sm:items-end sm:justify-between"
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
              <div className="text-left sm:text-right">
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

              <span className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-white/15 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm transition-colors group-hover:bg-gray-100">
                View
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-3 gap-0.5 bg-gray-50 px-3 py-3 sm:px-4">
          {viewModel.trackerSteps.map((step, stepIndex) => renderTrackerStep(step, stepIndex))}
        </div>
      </article>
    </div>
  );
};
