import {
  FeedEntry,
  FeedPaperContent,
  FeedPostContent,
  JournalV2FeedMetadata,
  JournalV2LinkedWork,
  Review,
} from '@/types/feed';
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

type JournalFeedContent = FeedPostContent | FeedPaperContent;

function readScore(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const score = Number(value);
  return Number.isFinite(score) ? score : undefined;
}

function readLinkedWorkId(work?: JournalV2LinkedWork): number | undefined {
  return work?.postId ?? work?.id;
}

function buildHrefFromLinkedWork(
  work: JournalV2LinkedWork | undefined,
  contentType: 'funding_request' | 'paper' | 'post' | 'preregistration'
): string | undefined {
  const id = readLinkedWorkId(work);
  if (!id) return undefined;

  return buildWorkUrl({
    id,
    slug: work?.slug,
    contentType,
  });
}

function buildReportHref(id: number, slug?: string): string {
  return slug ? `/report/${id}/${slug}` : `/report/${id}`;
}

function isPaperContent(content: FeedEntry['content']): content is FeedPaperContent {
  return content.contentType === 'PAPER';
}

function isPostContent(content: FeedEntry['content']): content is FeedPostContent {
  return content.contentType === 'POST' || content.contentType === 'PREREGISTRATION';
}

function isRegisteredReportContent(
  content: JournalFeedContent,
  journalV2?: JournalV2FeedMetadata
): boolean {
  return (
    (isPostContent(content) && content.postType === 'REGISTERED_REPORT') ||
    journalV2?.documentType === 'REGISTERED_REPORT' ||
    journalV2?.journalState === 'registered_report'
  );
}

function buildPrimaryHref(content: JournalFeedContent, journalV2?: JournalV2FeedMetadata): string {
  if (isPaperContent(content)) {
    return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'paper' });
  }

  if (isRegisteredReportContent(content, journalV2)) {
    return buildReportHref(content.id, content.slug);
  }

  if (content.contentType === 'PREREGISTRATION' || content.postType === 'PREREGISTRATION') {
    return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'preregistration' });
  }

  return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'post' });
}

function buildFundingOpportunityHref(journalV2?: JournalV2FeedMetadata): string | undefined {
  if (journalV2?.postIds) {
    const grantPostId = journalV2.postIds.grantPostId;
    if (!grantPostId) return undefined;

    return buildWorkUrl({
      id: grantPostId,
      slug: journalV2.fundingOpportunity?.slug,
      contentType: 'funding_request',
    });
  }

  return buildHrefFromLinkedWork(journalV2?.fundingOpportunity, 'funding_request');
}

function buildProposalHref(
  journalV2: JournalV2FeedMetadata | undefined,
  content: JournalFeedContent,
  primaryHref: string
): string | undefined {
  if (journalV2?.postIds) {
    const proposalPostId = journalV2.postIds.proposalPostId;
    if (!proposalPostId) return undefined;

    return buildWorkUrl({
      id: proposalPostId,
      slug: journalV2.proposal?.slug,
      contentType: 'preregistration',
    });
  }

  if (isPostContent(content) && content.contentType === 'PREREGISTRATION') {
    return primaryHref;
  }

  return buildHrefFromLinkedWork(journalV2?.proposal, 'preregistration');
}

function buildRegisteredReportHref(
  content: JournalFeedContent,
  journalV2: JournalV2FeedMetadata | undefined,
  primaryHref: string
): string | undefined {
  if (isRegisteredReportContent(content, journalV2)) {
    return primaryHref;
  }

  const registeredReport = journalV2?.registeredReport;
  const registeredReportId = readLinkedWorkId(registeredReport);
  if (registeredReportId) return buildReportHref(registeredReportId, registeredReport?.slug);

  const registeredReportPostId = journalV2?.registeredReportPostId;
  if (!registeredReportPostId) return undefined;

  return buildReportHref(registeredReportPostId, journalV2?.registeredReport?.slug);
}

function resolveCurrentStageLabel(
  content: JournalFeedContent,
  journalV2?: JournalV2FeedMetadata
): string {
  if (
    isPaperContent(content) ||
    journalV2?.journalState === 'preprint' ||
    journalV2?.journalState === 'result'
  ) {
    return 'Preprint';
  }

  if (isRegisteredReportContent(content, journalV2)) {
    return 'Registered Report';
  }

  return 'Funded Proposal';
}

function normalizeScoreToFive(score: number): number {
  return score > 5 ? score / 2 : score;
}

function buildReviewFromTransformed(review: Review): Review | undefined {
  const score = readScore(review.score);
  if (score === undefined) return undefined;

  return {
    ...review,
    score: normalizeScoreToFive(score),
  };
}

function calculateReviewSummary(content: JournalFeedContent): JournalV2ReviewSummary | undefined {
  const reviews = Array.isArray(content.reviews)
    ? content.reviews
        .map(buildReviewFromTransformed)
        .filter((review): review is Review => review !== undefined)
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
  if (!isPostContent(content) && !isPaperContent(content)) {
    return undefined;
  }

  const { journalV2 } = entry;
  const primaryHref = buildPrimaryHref(content, journalV2);
  const fundingOpportunityHref = buildFundingOpportunityHref(journalV2);
  const proposalHref = buildProposalHref(journalV2, content, primaryHref);
  const registeredReportHref = buildRegisteredReportHref(content, journalV2, primaryHref);
  const imageUrl = isPaperContent(content)
    ? content.previewImage || content.previewThumbnail || undefined
    : content.previewImage || content.fundraise?.postImage || undefined;

  return {
    title: content.title,
    href: primaryHref,
    imageUrl,
    currentStageLabel: resolveCurrentStageLabel(content, journalV2),
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
