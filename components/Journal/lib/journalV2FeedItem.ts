import { FeedEntry, FeedPostContent, JournalPostIds, Review } from '@/types/feed';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';
import { buildWorkUrl } from '@/utils/url';

export type JournalV2Stage = 'funding_opportunity' | 'proposal' | 'registered_report';

export interface JournalV2StageLink {
  stage: JournalV2Stage;
  label: string;
  href?: string;
}

export interface JournalV2ReviewSummary {
  average: number;
  reviews: Review[];
}

export interface JournalV2FeedItemViewModel {
  title: string;
  href: string;
  imageUrl?: string;
  currentStageLabel: string;
  reviewSummary?: JournalV2ReviewSummary;
  trackerSteps: JournalV2StageLink[];
}

function isJournalContent(content: FeedEntry['content']): content is FeedPostContent {
  return (
    content.contentType === 'PREREGISTRATION' ||
    (content.contentType === 'POST' && content.postType === 'REGISTERED_REPORT')
  );
}

function isRegisteredReport(content: FeedPostContent): boolean {
  return content.postType === 'REGISTERED_REPORT';
}

function buildPrimaryHref(content: FeedPostContent): string {
  if (isRegisteredReport(content)) {
    return buildRegisteredReportUrl(content.id, content.slug);
  }

  return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'preregistration' });
}

function buildFundingOpportunityHref(postIds?: JournalPostIds): string | undefined {
  if (!postIds?.grantPostId) return undefined;

  return buildWorkUrl({
    id: postIds.grantPostId,
    contentType: 'funding_request',
  });
}

function buildProposalHref(
  content: FeedPostContent,
  postIds: JournalPostIds | undefined,
  primaryHref: string
): string | undefined {
  if (!isRegisteredReport(content)) return primaryHref;
  if (!postIds?.proposalPostId) return undefined;

  return buildWorkUrl({
    id: postIds.proposalPostId,
    contentType: 'preregistration',
  });
}

function buildRegisteredReportHref(
  content: FeedPostContent,
  primaryHref: string
): string | undefined {
  return isRegisteredReport(content) ? primaryHref : undefined;
}

function buildCurrentStageLabel(content: FeedPostContent): string {
  return isRegisteredReport(content) ? 'Registered Report' : 'Funded Proposal';
}

function calculateReviewSummary(content: FeedPostContent): JournalV2ReviewSummary | undefined {
  const reviews = Array.isArray(content.reviews)
    ? content.reviews
        .filter((review) => review.isAssessed && Number.isFinite(review.score))
        .map((review) => ({
          ...review,
          score: review.score > 5 ? review.score / 2 : review.score,
        }))
    : [];
  if (reviews.length === 0) return undefined;

  const average = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
  return {
    average: Math.round(average * 10) / 10,
    reviews,
  };
}

export function buildJournalV2FeedItemViewModel(
  entry: FeedEntry
): JournalV2FeedItemViewModel | undefined {
  const content = entry.content;
  if (!isJournalContent(content)) return undefined;

  const primaryHref = buildPrimaryHref(content);
  const fundingOpportunityHref = buildFundingOpportunityHref(entry.journalPostIds);
  const proposalHref = buildProposalHref(content, entry.journalPostIds, primaryHref);
  const registeredReportHref = buildRegisteredReportHref(content, primaryHref);
  const imageUrl = content.previewImage || content.fundraise?.postImage || undefined;

  return {
    title: content.title,
    href: primaryHref,
    imageUrl,
    currentStageLabel: buildCurrentStageLabel(content),
    reviewSummary: calculateReviewSummary(content),
    trackerSteps: [
      {
        stage: 'funding_opportunity',
        label: 'Funding Opportunity',
        href: fundingOpportunityHref,
      },
      {
        stage: 'proposal',
        label: 'Proposal',
        href: proposalHref,
      },
      {
        stage: 'registered_report',
        label: 'Registered Report',
        href: registeredReportHref,
      },
    ],
  };
}
