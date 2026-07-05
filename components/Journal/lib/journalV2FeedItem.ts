import { FeedEntry, FeedPaperContent, FeedPostContent, Review } from '@/types/feed';
import { transformAuthorProfile } from '@/types/authorProfile';
import { buildWorkUrl } from '@/utils/url';

export type JournalV2Stage = 'funding_opportunity' | 'proposal' | 'registered_report' | 'preprint';

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
type RawRecord = Record<string, unknown>;

/** Reads a plain object from an unknown API value. */
function readRecord(value: unknown): RawRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as RawRecord)
    : undefined;
}

/** Reads the first plain object from a list of possible API fields. */
function readFirstRecord(...values: unknown[]): RawRecord | undefined {
  for (const value of values) {
    if (Array.isArray(value)) {
      const item = value.map(readRecord).find(Boolean);
      if (item) return item;
    } else {
      const item = readRecord(value);
      if (item) return item;
    }
  }

  return undefined;
}

/** Reads a finite numeric ID from an API value. */
function readNumber(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

/** Reads a string field from an API value. */
function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Reads a finite review score without treating null as zero. */
function readScore(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const score = Number(value);
  return Number.isFinite(score) ? score : undefined;
}

/** Reads a document ID from common API field names. */
function readDocumentId(record?: RawRecord): number | undefined {
  if (!record) return undefined;
  return readNumber(record.id) ?? readNumber(record.post_id) ?? readNumber(record.postId);
}

/** Builds a work URL from a raw API object when it includes an ID. */
function buildHrefFromRecord(
  record: RawRecord | undefined,
  contentType: 'funding_request' | 'paper' | 'post' | 'preregistration'
): string | undefined {
  if (!record) return undefined;

  const id = readDocumentId(record);
  if (!id) return undefined;

  return buildWorkUrl({
    id,
    slug: readString(record.slug),
    contentType,
  });
}

/** Builds the future Registered Report page URL. */
function buildReportHref(id: string | number, slug?: string): string {
  return slug ? `/report/${id}/${slug}` : `/report/${id}`;
}

/** Builds the future Registered Report page URL from a raw API object. */
function buildReportHrefFromRecord(record: RawRecord | undefined): string | undefined {
  const id = readDocumentId(record);
  if (!id) return undefined;

  return buildReportHref(id, readString(record?.slug));
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
function isRegisteredReportContent(content: JournalFeedContent, rawContent: RawRecord): boolean {
  return (
    (isPostContent(content) && content.postType === 'REGISTERED_REPORT') ||
    rawContent.type === 'REGISTERED_REPORT' ||
    rawContent.journal_state === 'registered_report'
  );
}

/** Builds the primary card link for the transformed journal item. */
function buildPrimaryHref(content: JournalFeedContent, rawContent: RawRecord): string {
  if (isPaperContent(content)) {
    return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'paper' });
  }

  if (isRegisteredReportContent(content, rawContent)) {
    return buildReportHref(content.id, content.slug);
  }

  if (content.contentType === 'PREREGISTRATION' || content.postType === 'PREREGISTRATION') {
    return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'preregistration' });
  }

  return buildWorkUrl({ id: content.id, slug: content.slug, contentType: 'post' });
}

/** Builds the Funding Opportunity tracker link from post IDs when present. */
function buildFundingOpportunityHref(entry: FeedEntry, rawContent: RawRecord): string | undefined {
  const fundingOpportunity =
    readFirstRecord(
      rawContent.funding_opportunity,
      rawContent.fundingOpportunity,
      rawContent.grant,
      readRecord(rawContent.fundraise)?.grant
    ) ?? undefined;

  if (entry.raw?.post_ids) {
    const grantPostId = readNumber(entry.raw.post_ids.grant_post_id);
    if (!grantPostId) return undefined;

    return buildWorkUrl({
      id: grantPostId,
      slug: readString(fundingOpportunity?.slug),
      contentType: 'funding_request',
    });
  }

  return buildHrefFromRecord(fundingOpportunity, 'funding_request');
}

/** Builds the Proposal tracker link from post IDs when present. */
function buildProposalHref(
  entry: FeedEntry,
  content: JournalFeedContent,
  rawContent: RawRecord,
  primaryHref: string
): string | undefined {
  const proposal = readFirstRecord(rawContent.proposal);

  if (entry.raw?.post_ids) {
    const proposalPostId = readNumber(entry.raw.post_ids.proposal_post_id);
    if (!proposalPostId) return undefined;

    return buildWorkUrl({
      id: proposalPostId,
      slug: readString(proposal?.slug),
      contentType: 'preregistration',
    });
  }

  if (isPostContent(content) && content.contentType === 'PREREGISTRATION') {
    return primaryHref;
  }

  return buildHrefFromRecord(proposal, 'preregistration');
}

/** Builds the Registered Report tracker link when that stage exists. */
function buildRegisteredReportHref(
  content: JournalFeedContent,
  rawContent: RawRecord,
  primaryHref: string
): string | undefined {
  if (isRegisteredReportContent(content, rawContent)) {
    return primaryHref;
  }

  const registeredReport = readFirstRecord(
    rawContent.registered_report,
    rawContent.registeredReport,
    rawContent.registered_report_post,
    rawContent.registeredReportPost,
    readRecord(rawContent.registered_report)?.post,
    readRecord(rawContent.registeredReport)?.post
  );
  const registeredReportHref = buildReportHrefFromRecord(registeredReport);
  if (registeredReportHref) return registeredReportHref;

  const registeredReportPostId =
    readNumber(rawContent.registered_report_post_id) ??
    readNumber(rawContent.registeredReportPostId);
  if (!registeredReportPostId) return undefined;

  return buildReportHref(registeredReportPostId, readString(registeredReport?.slug));
}

/** Builds the Preprint tracker link when that stage exists. */
function buildPreprintHref(
  content: JournalFeedContent,
  rawContent: RawRecord,
  primaryHref: string
): string | undefined {
  if (isPaperContent(content)) {
    return primaryHref;
  }

  const preprint = readFirstRecord(
    rawContent.preprint,
    rawContent.paper,
    rawContent.result,
    rawContent.results
  );

  return buildHrefFromRecord(preprint, 'paper');
}

/** Names the current stage represented by this feed entry. */
function resolveCurrentStageLabel(content: JournalFeedContent, rawContent: RawRecord): string {
  if (
    isPaperContent(content) ||
    rawContent.journal_state === 'preprint' ||
    rawContent.journal_state === 'result'
  ) {
    return 'Preprint';
  }

  if (isRegisteredReportContent(content, rawContent)) {
    return 'Registered Report';
  }

  return 'Funded Proposal';
}

/** Normalizes review scores to the x/5 scale shown in journal cards. */
function normalizeScoreToFive(score: number): number {
  return score > 5 ? score / 2 : score;
}

/** Converts a raw API review into the transformed review shape used by tooltips. */
function buildReviewFromRaw(value: unknown, index: number): Review | undefined {
  const review = readRecord(value);
  if (!review) return undefined;

  const score = readScore(review.score);
  if (score === undefined) return undefined;

  return {
    id: readNumber(review.id) ?? index,
    score: normalizeScoreToFive(score),
    author: transformAuthorProfile(review.author),
    isAssessed: Boolean(review.is_assessed ?? review.isAssessed),
  };
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

/** Collects reviews from transformed content first, then falls back to raw API reviews. */
function collectReviews(content: JournalFeedContent, rawContent: RawRecord): Review[] {
  const transformedReviews = Array.isArray(content.reviews)
    ? content.reviews
        .map((review) => buildReviewFromTransformed(review))
        .filter((review): review is Review => !!review)
    : [];

  if (transformedReviews.length > 0) {
    return transformedReviews;
  }

  return Array.isArray(rawContent.reviews)
    ? rawContent.reviews
        .map((review, index) => buildReviewFromRaw(review, index))
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

  const rawContent = readRecord(entry.raw?.content_object) ?? {};
  const primaryHref = buildPrimaryHref(content, rawContent);
  const fundingOpportunityHref = buildFundingOpportunityHref(entry, rawContent);
  const proposalHref = buildProposalHref(entry, content, rawContent, primaryHref);
  const registeredReportHref = buildRegisteredReportHref(content, rawContent, primaryHref);
  const preprintHref = buildPreprintHref(content, rawContent, primaryHref);
  const imageUrl = isPaperContent(content)
    ? content.previewImage || content.previewThumbnail || undefined
    : content.previewImage || content.fundraise?.postImage || undefined;

  return {
    title: content.title,
    href: primaryHref,
    imageUrl,
    currentStageLabel: resolveCurrentStageLabel(content, rawContent),
    reviewSummary: calculateReviewSummary(collectReviews(content, rawContent)),
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
      {
        stage: 'preprint',
        label: 'Preprint',
        href: preprintHref,
      },
    ],
  };
}
