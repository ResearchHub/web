import { FeedEntry, FeedPostContent, Review } from '@/types/feed';
import {
  buildRegisteredReportTrackerHref,
  buildRegisteredReportUrl,
} from '@/utils/registeredReportRoute';
import { buildWorkUrl, generateSlug } from '@/utils/url';

export interface JournalV2ReviewSummary {
  average: number;
  reviews: Review[];
}

export interface JournalV2FeedItemViewModel {
  title: string;
  href: string;
  imageUrl?: string;
  currentStageLabel: string;
  /** Proposal page URL; the peer reviews shown on the card belong to the funded proposal. */
  proposalHref?: string;
  reviewSummary?: JournalV2ReviewSummary;
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
  const slug = content.slug || generateSlug(content.title);

  if (isRegisteredReport(content)) {
    return buildRegisteredReportUrl(content.id, slug);
  }

  return buildWorkUrl({ id: content.id, slug, contentType: 'preregistration' });
}

function buildCurrentStageLabel(content: FeedPostContent): string {
  return isRegisteredReport(content) ? 'Registered Report' : 'Funded Proposal';
}

/**
 * The journal feed nests the source proposal on the raw payload only, so the slug is
 * read from there to build a canonical link without an extra post request.
 */
function readProposalSlug(entry: FeedEntry): string | undefined {
  const slug = entry.raw?.content_object?.proposal?.slug;
  return typeof slug === 'string' && slug.length > 0 ? slug : undefined;
}

function buildProposalHref(entry: FeedEntry, content: FeedPostContent): string | undefined {
  if (!isRegisteredReport(content)) return buildPrimaryHref(content);

  const postId = entry.journalPostIds?.proposalPostId;
  if (!postId) return undefined;

  return (
    buildRegisteredReportTrackerHref(
      { stage: 'proposal', label: 'Proposal', exists: true, postId, title: null },
      content.id,
      readProposalSlug(entry)
    ) ?? undefined
  );
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

  return {
    title: content.title,
    href: buildPrimaryHref(content),
    imageUrl: content.previewImage || content.fundraise?.postImage || undefined,
    currentStageLabel: buildCurrentStageLabel(content),
    proposalHref: buildProposalHref(entry, content),
    reviewSummary: calculateReviewSummary(content),
  };
}
