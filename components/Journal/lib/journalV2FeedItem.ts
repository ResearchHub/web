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
  count: number;
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

/** Reads a finite review score without treating null as zero. */
function readScore(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const score = Number(value);
  return Number.isFinite(score) ? score : undefined;
}

/** Reads the post-facing ID from transformed journal metadata. */
function readLinkedWorkId(work?: JournalV2LinkedWork): number | undefined {
  return work?.postId ?? work?.id ?? undefined;
}

/** Builds a work URL from transformed journal metadata. */
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

/** Builds the future Registered Report page URL. */
function buildReportHref(id: string | number, slug?: string): string {
  return slug ? `/report/${id}/${slug}` : `/report/${id}`;
}

/** Builds the future Registered Report page URL from transformed journal metadata. */
function buildReportHrefFromLinkedWork(work: JournalV2LinkedWork | undefined): string | undefined {
  const id = readLinkedWorkId(work);
  if (!id) return undefined;

  return buildReportHref(id, work?.slug);
}

/** Returns true when the transformed feed content is a paper/preprint. */
function isPaperContent(content: FeedEntry['content']): content is FeedPaperContent {
  return content.contentType === 'PAPER';
}

/** Returns true when the transformed feed content is a post-like journal item. */
function isPostContent(content: FeedEntry['content']): content is FeedPostContent {
  return content.contentType === 'POST' || content.contentType === 'PREREGISTRATION';
}

/** Returns true when the item represents a Registered Report post. */
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

/** Builds the primary card link for the transformed journal item. */
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

/** Builds the Funding Opportunity tracker link from transformed post IDs when present. */
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

/** Builds the Proposal tracker link from transformed post IDs when present. */
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

/** Builds the Registered Report tracker link when that stage exists. */
function buildRegisteredReportHref(
  content: JournalFeedContent,
  journalV2: JournalV2FeedMetadata | undefined,
  primaryHref: string
): string | undefined {
  if (isRegisteredReportContent(content, journalV2)) {
    return primaryHref;
  }

  const registeredReportHref = buildReportHrefFromLinkedWork(journalV2?.registeredReport);
  if (registeredReportHref) return registeredReportHref;

  const registeredReportPostId = journalV2?.registeredReportPostId;
  if (!registeredReportPostId) return undefined;

  return buildReportHref(registeredReportPostId, journalV2?.registeredReport?.slug);
}

/** Names the current stage represented by this feed entry. */
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

/** Normalizes review scores to the x/5 scale shown in journal cards. */
function normalizeScoreToFive(score: number): number {
  return score > 5 ? score / 2 : score;
}

/** Converts transformed reviews to the x/5 score scale used by the journal feed. */
function buildReviewFromTransformed(review: Review): Review | undefined {
  const score = readScore(review.score);
  if (score === undefined) return undefined;

  return {
    ...review,
    score: normalizeScoreToFive(score),
  };
}

/** Collects reviews from transformed content. */
function collectReviews(content: JournalFeedContent): Review[] {
  return Array.isArray(content.reviews)
    ? content.reviews
        .map((review) => buildReviewFromTransformed(review))
        .filter((review): review is Review => !!review)
    : [];
}

/** Calculates the average review score shown by the journal feed. */
function calculateReviewSummary(reviews: Review[]): JournalV2ReviewSummary | undefined {
  if (reviews.length === 0) return undefined;

  const average = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
  return {
    average: Math.round(average * 10) / 10,
    count: reviews.length,
    reviews,
  };
}

/** Builds the normalized data needed to render one journal v2 feed item. */
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
    reviewSummary: calculateReviewSummary(collectReviews(content)),
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
