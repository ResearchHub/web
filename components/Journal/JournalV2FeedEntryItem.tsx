'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Coins, FileInput, Landmark, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { useNavigation } from '@/contexts/NavigationContext';
import { PostService } from '@/services/post.service';
import { getUnifiedDocumentId } from '@/types/analytics';
import { buildRegisteredReportTrackerHref } from '@/utils/registeredReportRoute';
import {
  buildJournalV2FeedItemViewModel,
  JournalV2Stage,
  JournalV2StageLink,
} from '@/components/Journal/lib/journalV2FeedItem';

interface JournalV2FeedEntryItemProps {
  entry: FeedEntry;
  index: number;
  feedOrdering?: string;
  isViewMenuOpen: boolean;
  onViewMenuOpenChange: (isOpen: boolean) => void;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
}

const STAGE_ICONS: Record<JournalV2Stage, typeof Landmark> = {
  grant: Landmark,
  proposal: Coins,
  registered_report: FileInput,
};

export const JournalV2FeedEntryItem: FC<JournalV2FeedEntryItemProps> = ({
  entry,
  index,
  feedOrdering,
  isViewMenuOpen,
  onViewMenuOpenChange,
  registerVisibleItem,
  unregisterVisibleItem,
  getVisibleItems,
}) => {
  const router = useRouter();
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

  const visibleItems = unifiedDocumentId ? getVisibleItems(unifiedDocumentId) : [];
  const { handleFeedItemClick } = useFeedItemAnalyticsTracking({
    entry,
    feedPosition: index + 1,
    feedOrdering,
    impression: visibleItems.length > 0 ? visibleItems : undefined,
  });

  if (!viewModel) return null;

  const handleCardClick = () => {
    handleFeedItemClick();
    updateLastClickedEntryId(`JOURNAL:${entry.id}`);
  };

  const handleTrackerStepClick = async (step: JournalV2StageLink & { postId: number }) => {
    handleCardClick();

    if (step.href) {
      router.push(step.href);
      return;
    }

    try {
      const work = await PostService.get(step.postId.toString());
      const href = buildRegisteredReportTrackerHref(
        {
          stage: step.stage,
          label: step.label,
          exists: true,
          postId: work.id,
          title: work.title,
        },
        viewModel.registeredReportId,
        work.slug
      );

      if (!href) {
        toast.error(`Unable to open ${step.label.toLowerCase()}. Please try again.`);
        return;
      }

      router.push(href);
    } catch {
      toast.error(`Unable to open ${step.label.toLowerCase()}. Please try again.`);
    }
  };

  const reviewSummary = viewModel.reviewSummary;
  const proposalHref = viewModel.trackerSteps.find((step) => step.stage === 'proposal')?.href;
  const availableTrackerSteps = viewModel.trackerSteps.filter(
    (step): step is JournalV2StageLink & { postId: number } => step.postId != null
  );

  return (
    <div
      ref={ref}
      data-entry-id={`JOURNAL:${entry.id}`}
      className={index === 0 ? undefined : 'mt-8'}
    >
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
              <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/45">
                {viewModel.currentStageLabel}
              </div>
              <h2 className="truncate text-base font-extrabold tracking-tight text-white">
                {viewModel.title}
              </h2>
            </div>

            <div className="flex w-full flex-shrink-0 items-end justify-between gap-5 sm:w-auto sm:justify-end">
              <div className="pointer-events-auto text-left sm:text-right">
                <div className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-white/60">
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
                    <span className="inline-flex cursor-help items-center gap-1 font-mono text-base font-extrabold text-emerald-300">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {reviewSummary.average.toFixed(1)}/5
                    </span>
                  </Tooltip>
                ) : (
                  <div className="font-mono text-base font-extrabold text-white/70">--/5</div>
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
                  open={isViewMenuOpen}
                  onOpenChange={onViewMenuOpenChange}
                >
                  {availableTrackerSteps.map((step) => {
                    const StepIcon = STAGE_ICONS[step.stage];

                    return (
                      <BaseMenuItem
                        key={step.stage}
                        onSelect={() => void handleTrackerStepClick(step)}
                        className="flex items-center gap-2 px-2 py-1.5"
                      >
                        <StepIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                        {step.label}
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
