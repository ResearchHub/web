import { FeedEntry, FeedPostContent, Review } from '@/types/feed';
import type { RegisteredReportStage, RegisteredReportTrackerStep } from '@/types/registeredReport';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';
import { buildWorkUrl, generateSlug } from '@/utils/url';

export type JournalV2Stage = RegisteredReportStage;

export interface JournalV2StageLink {
  stage: JournalV2Stage;
  label: RegisteredReportTrackerStep['label'];
  postId?: number;
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
  registeredReportId?: number;
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
  const slug = content.slug || generateSlug(content.title);

  if (isRegisteredReport(content)) {
    return buildRegisteredReportUrl(content.id, slug);
  }

  return buildWorkUrl({ id: content.id, slug, contentType: 'preregistration' });
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
  const isReport = isRegisteredReport(content);
  const fundingOpportunityPostId = entry.journalPostIds?.grantPostId ?? undefined;
  const proposalPostId = isReport
    ? (entry.journalPostIds?.proposalPostId ?? undefined)
    : content.id;
  const imageUrl = content.previewImage || content.fundraise?.postImage || undefined;

  return {
    title: content.title,
    href: primaryHref,
    imageUrl,
    currentStageLabel: buildCurrentStageLabel(content),
    registeredReportId: isReport ? content.id : undefined,
    reviewSummary: calculateReviewSummary(content),
    trackerSteps: [
      {
        stage: 'grant',
        label: 'Funding Opportunity',
        postId: fundingOpportunityPostId,
      },
      {
        stage: 'proposal',
        label: 'Proposal',
        postId: proposalPostId,
        href: isReport ? undefined : primaryHref,
      },
      {
        stage: 'registered_report',
        label: 'Registered Report',
        postId: isReport ? content.id : undefined,
        href: isReport ? primaryHref : undefined,
      },
    ],
  };
}
