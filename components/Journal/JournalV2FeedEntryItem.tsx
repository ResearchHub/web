'use client';

import { FC, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ClipboardList, FileText, Landmark, Newspaper, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { useNavigation } from '@/contexts/NavigationContext';
import { getUnifiedDocumentId } from '@/types/analytics';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';

interface JournalV2FeedEntryItemProps {
  entry: FeedEntry;
  index: number;
  feedOrdering?: string;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
}

const getJournalStateLabel = (state?: string) =>
  state === 'registered_report' ? 'Registered Report' : 'Funded Proposal';

const asObject = (value: unknown): Record<string, any> | undefined =>
  value && typeof value === 'object' ? (value as Record<string, any>) : undefined;

const getReviewAverage = (reviews: unknown): { average: number; count: number } | null => {
  if (!Array.isArray(reviews)) return null;

  const scores = reviews
    .map((review) => Number(asObject(review)?.score))
    .filter((score) => Number.isFinite(score));

  if (scores.length === 0) return null;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return {
    average: Math.round(average * 10) / 10,
    count: scores.length,
  };
};

const getWorkHref = (
  item: Record<string, any> | undefined,
  contentType: 'funding_request' | 'paper' | 'post' | 'preregistration'
): string | undefined => {
  if (!item?.id) return undefined;
  return buildWorkUrl({
    id: item.id,
    slug: item.slug,
    contentType,
  });
};

function getJournalHref(entry: FeedEntry, post: FeedPostContent): string {
  const rawType = entry.raw?.content_object?.type;

  if (rawType === 'REGISTERED_REPORT') {
    return buildWorkUrl({
      id: post.id,
      slug: post.slug,
      contentType: 'post',
    });
  }

  return buildWorkUrl({
    id: post.id,
    slug: post.slug,
    contentType: 'preregistration',
  });
}

function getProposalHref(entry: FeedEntry, rawContent: Record<string, any>): string | undefined {
  if (entry.raw?.post_ids) {
    const proposalPostId = entry.raw.post_ids.proposal_post_id;
    if (!proposalPostId) return undefined;

    const proposal = asObject(rawContent.proposal);
    return buildWorkUrl({
      id: proposalPostId,
      slug: proposal?.slug,
      contentType: 'preregistration',
    });
  }

  const proposal = entry.raw?.content_object?.proposal;
  if (!proposal?.id) return undefined;

  return buildWorkUrl({
    id: proposal.id,
    slug: proposal.slug,
    contentType: 'preregistration',
  });
}

function getFundingOpportunityHref(
  entry: FeedEntry,
  rawContent: Record<string, any>
): string | undefined {
  const grantPostId = entry.raw?.post_ids?.grant_post_id;
  if (!grantPostId) return undefined;

  const fundingOpportunity =
    asObject(rawContent.funding_opportunity) ??
    asObject(rawContent.fundingOpportunity) ??
    asObject(rawContent.grant) ??
    asObject(rawContent.fundraise?.grant);

  return buildWorkUrl({
    id: grantPostId,
    slug: fundingOpportunity?.slug,
    contentType: 'funding_request',
  });
}

function getPreprintHref(rawContent: Record<string, any>): string | undefined {
  const preprint =
    asObject(rawContent.preprint) ??
    asObject(rawContent.paper) ??
    asObject(rawContent.result) ??
    asObject(rawContent.results);

  return getWorkHref(preprint, 'paper');
}

export const JournalV2FeedEntryItem: FC<JournalV2FeedEntryItemProps> = ({
  entry,
  index,
  feedOrdering,
  registerVisibleItem,
  unregisterVisibleItem,
  getVisibleItems,
}) => {
  const post = entry.content as FeedPostContent;
  const { updateLastClickedEntryId } = useNavigation();
  const unifiedDocumentId = getUnifiedDocumentId(entry);

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

  const rawContent = entry.raw?.content_object ?? {};
  const journalState = rawContent.journal_state;
  const journalLabel = getJournalStateLabel(journalState);
  const href = getJournalHref(entry, post);
  const proposalHref = getProposalHref(entry, rawContent);
  const fundingOpportunityHref = getFundingOpportunityHref(entry, rawContent);
  const preprintHref = getPreprintHref(rawContent);
  const imageUrl = post.previewImage || post.fundraise?.postImage || undefined;
  const reviewAverage = getReviewAverage(rawContent.reviews);
  const reviewCount = reviewAverage?.count ?? 0;
  const reviewScore = reviewAverage?.average;
  const hasReviewScore = reviewScore !== undefined && reviewCount > 0;
  const entryIdKey = `JOURNAL:${entry.id}`;

  const handleCardClick = () => {
    handleFeedItemClick();
    updateLastClickedEntryId(entryIdKey);
  };

  const reviewScoreOutOfFive = hasReviewScore
    ? reviewScore > 5
      ? reviewScore / 2
      : reviewScore
    : undefined;

  const trackerSteps = [
    {
      label: 'Funding Opportunity',
      href: fundingOpportunityHref,
      icon: Landmark,
    },
    {
      label: 'Proposal',
      href: proposalHref,
      icon: ClipboardList,
    },
    {
      label: 'Registered Report',
      href: journalState === 'registered_report' ? href : undefined,
      icon: FileText,
    },
    {
      label: 'Preprint',
      href: preprintHref,
      icon: Newspaper,
    },
  ];
  const currentStageLabel = preprintHref
    ? 'Preprint'
    : journalState === 'registered_report'
      ? 'Registered Report'
      : 'Funded Proposal';

  const renderTrackerStep = (step: (typeof trackerSteps)[number], stepIndex: number) => {
    const StepIcon = step.icon;
    const className = cn(
      'relative flex min-h-[54px] items-center justify-center gap-2 border px-3 py-2 text-xs font-semibold transition-colors',
      step.href
        ? 'border-primary-500 bg-primary-500 text-white hover:bg-primary-600'
        : 'border-gray-200 bg-white text-gray-400',
      stepIndex === 0 && 'rounded-l-lg',
      stepIndex === trackerSteps.length - 1 && 'rounded-r-lg'
    );
    const style = {
      clipPath:
        stepIndex === 0
          ? 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
          : stepIndex === trackerSteps.length - 1
            ? 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)'
            : 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
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
    <div ref={ref} className={index !== 0 ? 'mt-8' : undefined}>
      <article className="overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <Link
          href={href}
          onClick={handleCardClick}
          className="group block relative h-[200px] overflow-hidden bg-gray-900 sm:h-[165px]"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title || journalLabel}
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
                {currentStageLabel}
              </div>
              <h2 className="truncate text-base font-extrabold tracking-tight text-white">
                {post.title}
              </h2>
            </div>

            <div className="flex flex-shrink-0 items-end gap-5 sm:justify-end">
              <div className="text-left sm:text-right">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-white/60 whitespace-nowrap">
                  Average Review
                </div>
                {hasReviewScore && reviewScoreOutOfFive !== undefined ? (
                  <Tooltip
                    content={
                      <PeerReviewTooltip
                        reviews={post.reviews ?? []}
                        averageScore={reviewScore}
                        href={proposalHref ?? href}
                      />
                    }
                    position="top"
                    width="w-[320px]"
                  >
                    <span
                      className="inline-flex items-center gap-1 font-extrabold font-mono text-base text-emerald-300 cursor-help"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {reviewScoreOutOfFive.toFixed(1)}/5
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

        <div className="grid grid-cols-4 gap-0.5 bg-gray-50 px-3 py-3 sm:px-4">
          {trackerSteps.map(renderTrackerStep)}
        </div>
      </article>
    </div>
  );
};
