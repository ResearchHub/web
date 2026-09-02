import { buildWorkUrl } from '@/utils/url';
import { getBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import {
  isGrantOpened,
  isProposalSubmission,
  shouldLinkToUpdatesTab,
} from './activityDisplay.utils';
import { formatCurrency } from '@/utils/currency';
import { toOptionalNumber } from '@/utils/number';
import type {
  ActivityAction,
  FeedBountyContent,
  FeedEntry,
  FeedGrantContent,
  FeedPaperContent,
  FeedPostContent,
} from '@/types/feed';
import type { Bounty } from '@/types/bounty';
import type { Fundraise } from '@/types/funding';
import type { AuthorProfile } from '@/types/authorProfile';
import type { ContentType, Work, WorkGrantSummary } from '@/types/work';

type ActivityBodySlot = 'fundraise' | 'bounty' | 'grant' | 'default';

export interface ActivityWork {
  id: number;
  slug: string;
  title: string;
  href: string;
  imageUrl?: string;
  documentType: ContentType;
  unifiedDocumentId?: number | null;
  fundraise?: Fundraise;
  grant?: WorkGrantSummary;
  bounty?: Bounty;
  authors?: AuthorProfile[];
  tab?: 'reviews' | 'bounties' | 'conversation' | 'updates';
}

export interface WorkCardAuthor {
  name: string;
  verified?: boolean;
  authorUrl?: string;
  profileImage?: string;
}

export interface WorkCardStat {
  label: string;
  value: string;
  accent?: boolean;
  accentColor?: 'emerald' | 'orange';
}

export interface WorkCardPresentation {
  authors: WorkCardAuthor[];
  /** Set when the work is published by ResearchHub itself, shown in place of authors. */
  brand?: 'researchhub';
  /** Funding organization, shown in place of authors when present. */
  organization?: string | null;
  institution?: string | null;
  score?: number | null;
  stats?: WorkCardStat[];
  progress?: number;
  showComment: boolean;
}

export function getActivityBounty(entry: FeedEntry): Bounty | undefined {
  // A BOUNTY entry is the only shape that carries its bounty singularly; every
  // other content type (comments, and the PAPER/POST entries the peer review
  // feed builds) hangs them off `bounties`.
  if (entry.contentType === 'BOUNTY') {
    return (entry.content as FeedBountyContent).bounty;
  }
  const bounties = entry.content.bounties;
  return bounties?.find((bounty) => bounty.status === 'OPEN') ?? bounties?.[0];
}

/**
 * `workContentType` is the type of the work being linked to, not of the entry —
 * author updates are `comment_published` like any other comment and only the
 * target tells them apart from a conversation comment.
 */
function resolveWorkTab(entry: FeedEntry, workContentType?: ContentType): ActivityWork['tab'] {
  switch (entry.activityAction) {
    case 'tip_review':
    case 'peer_review_published':
      return 'reviews';
    case 'bounty_opened':
    case 'bounty_contributed':
    case 'bounty_payout':
      return 'bounties';
    case 'comment_published':
      if (
        entry.content.contentType === 'COMMENT' &&
        entry.content.comment.commentType === 'REVIEW'
      ) {
        return 'reviews';
      }
      return shouldLinkToUpdatesTab(entry, workContentType) ? 'updates' : 'conversation';
    default:
      return undefined;
  }
}

function resolveActivityBodySlot(
  activityAction?: ActivityAction,
  work?: Pick<ActivityWork, 'fundraise' | 'grant' | 'bounty'>,
  options?: { isReview?: boolean }
): ActivityBodySlot {
  if (activityAction === 'bounty_opened' || activityAction === 'bounty_contributed') {
    return work?.bounty ? 'bounty' : 'default';
  }
  if (activityAction === 'grant_opened') {
    return work?.grant ? 'grant' : 'default';
  }
  if (
    activityAction === 'tip_review' ||
    activityAction === 'bounty_payout' ||
    activityAction === 'fundraise_contribution' ||
    activityAction === 'proposal_submitted' ||
    activityAction === 'peer_review_published' ||
    activityAction === 'comment_published' ||
    options?.isReview
  ) {
    return work?.fundraise ? 'fundraise' : 'default';
  }
  return 'default';
}

function toCardAuthors(authors?: AuthorProfile[]): WorkCardAuthor[] {
  if (!authors?.length) return [];
  return authors
    .filter((author) => !!author.fullName?.trim())
    .map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified ?? author.isVerified,
      authorUrl: author.id === 0 ? undefined : author.profileUrl,
      profileImage: author.profileImage,
    }));
}

/** Funding organization, from related work when present and the entry itself otherwise. */
function resolveOrganization(entry: FeedEntry, work: ActivityWork): string | null {
  if (work.grant?.organization) return work.grant.organization;
  if (entry.contentType === 'GRANT') {
    return (entry.content as FeedGrantContent).grant?.organization || null;
  }
  return null;
}

function formatAmount(
  amount: number,
  showUSD: boolean,
  exchangeRate: number,
  skipConversion = false
): string {
  return formatCurrency({
    amount: Math.round(amount),
    showUSD,
    exchangeRate,
    skipConversion,
    shorten: true,
  });
}

function resolveReviewScore(entry: FeedEntry, work: ActivityWork): number | null {
  const entryScore = entry.metrics?.reviewScore;
  if (entryScore && entryScore > 0) return entryScore;

  const fundraiseAvg = work.fundraise?.reviewMetrics?.avg;
  if (fundraiseAvg && fundraiseAvg > 0) return fundraiseAvg;

  return null;
}

/** Discussions are product updates written by the ResearchHub team. */
function isDiscussion(work: ActivityWork): boolean {
  return work.documentType === 'post' || work.documentType === 'discussion';
}

function buildBasePresentation(
  entry: FeedEntry,
  work: ActivityWork,
  slot: ActivityBodySlot,
  options: { isReview?: boolean }
): WorkCardPresentation {
  // A review of a proposal leads with the review itself, so the proposal's
  // authors are dropped from the card.
  const hideAuthors = !!options.isReview && work.documentType === 'preregistration';

  return {
    authors: hideAuthors ? [] : toCardAuthors(work.authors),
    brand: isDiscussion(work) ? 'researchhub' : undefined,
    organization: resolveOrganization(entry, work),
    institution: entry.nonprofit?.name ?? null,
    score: resolveReviewScore(entry, work),
    // Caller ANDs with commentPreview presence; here we only gate by slot.
    showComment: slot !== 'bounty' && slot !== 'grant',
  };
}

function presentFundraise(
  base: WorkCardPresentation,
  fundraise: NonNullable<ActivityWork['fundraise']>,
  showUSD: boolean,
  exchangeRate: number
): WorkCardPresentation {
  const goalUsd = fundraise.goalAmount?.usd ?? 0;
  const goalRsc = fundraise.goalAmount?.rsc ?? 0;
  const raisedUsd = fundraise.amountRaised?.usd ?? 0;
  const goalAmount = showUSD ? goalUsd : goalRsc;

  return {
    ...base,
    stats: [
      {
        label: 'Raising',
        value: formatAmount(goalAmount, showUSD, exchangeRate, true),
        accent: true,
      },
    ],
    progress: goalUsd > 0 ? raisedUsd / goalUsd : undefined,
  };
}

function presentGrant(
  base: WorkCardPresentation,
  grant: NonNullable<ActivityWork['grant']>,
  showUSD: boolean,
  exchangeRate: number
): WorkCardPresentation {
  const stats: WorkCardStat[] = [];
  let budgetAmount: number | null = null;
  let skipConversion = showUSD;

  if (showUSD) {
    if (grant.amount.usd > 0) {
      budgetAmount = grant.amount.usd;
    }
  } else if (grant.amount.rsc != null && grant.amount.rsc > 0) {
    budgetAmount = grant.amount.rsc;
  } else if (grant.amount.usd > 0 && exchangeRate > 0) {
    budgetAmount = grant.amount.usd / exchangeRate;
    skipConversion = true;
  }

  if (budgetAmount != null) {
    stats.push({
      label: 'Available',
      value: formatAmount(budgetAmount, showUSD, exchangeRate, skipConversion),
      accent: true,
    });
  }
  stats.push({
    label: 'Proposals',
    value: String(grant.numApplicants),
  });

  return {
    ...base,
    stats,
  };
}

function presentBounty(
  base: WorkCardPresentation,
  bounty: Bounty,
  showUSD: boolean,
  exchangeRate: number
): WorkCardPresentation {
  const { amount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  return {
    ...base,
    stats: [
      {
        label: bounty.bountyType === 'REVIEW' ? 'Peer Review' : 'Bounty',
        value: formatAmount(amount, showUSD, exchangeRate, true),
        accent: true,
        accentColor: bounty.bountyType === 'REVIEW' ? 'orange' : 'emerald',
      },
    ],
  };
}

export function getWorkCardPresentation(
  entry: FeedEntry,
  work: ActivityWork,
  options: { showUSD: boolean; exchangeRate: number; isReview?: boolean }
): WorkCardPresentation {
  const { showUSD, exchangeRate, isReview } = options;
  const slot = resolveActivityBodySlot(entry.activityAction, work, { isReview });
  const base = buildBasePresentation(entry, work, slot, { isReview });

  if (slot === 'fundraise' && work.fundraise) {
    return presentFundraise(base, work.fundraise, showUSD, exchangeRate);
  }
  if (slot === 'grant' && work.grant) {
    return presentGrant(base, work.grant, showUSD, exchangeRate);
  }
  if (slot === 'bounty' && work.bounty) {
    return presentBounty(base, work.bounty, showUSD, exchangeRate);
  }

  return base;
}

function grantSummaryFromFeedGrant(content: FeedGrantContent): WorkGrantSummary | undefined {
  const grant = content.grant;
  if (!grant) return undefined;
  return {
    status: grant.status,
    organization: grant.organization,
    amount: { usd: grant.amount.usd, rsc: grant.amount.rsc ?? null },
    numApplicants: grant.applicants?.length ?? 0,
    endDate: grant.endDate,
  };
}

/**
 * Build work from a top-level document payload when `related_work` is
 * absent (PAPER / POST / GRANT / proposal / contribution events).
 */
function getWorkFromContent(entry: FeedEntry): ActivityWork | null {
  const bounty = getActivityBounty(entry);

  if (entry.contentType === 'PAPER') {
    const paper = entry.content as FeedPaperContent;
    if (!paper.title) return null;
    const documentType: ContentType = 'paper';
    const tab = resolveWorkTab(entry, documentType);
    return {
      id: paper.id,
      slug: paper.slug,
      title: paper.title,
      href: buildWorkUrl({
        id: paper.id,
        slug: paper.slug,
        contentType: documentType,
        tab,
      }),
      imageUrl: paper.previewImage || paper.previewThumbnail,
      documentType,
      unifiedDocumentId: toOptionalNumber(paper.unifiedDocumentId),
      bounty,
      authors: paper.authors,
      tab,
    };
  }

  if (entry.contentType === 'GRANT') {
    const grantContent = entry.content as FeedGrantContent;
    if (!grantContent.title) return null;
    const documentType: ContentType = 'funding_request';
    const tab = resolveWorkTab(entry, documentType);
    return {
      id: grantContent.id,
      slug: grantContent.slug,
      title: grantContent.title,
      href: buildWorkUrl({
        id: grantContent.id,
        slug: grantContent.slug,
        contentType: documentType,
        tab,
      }),
      imageUrl: grantContent.previewImage,
      documentType,
      unifiedDocumentId: toOptionalNumber(grantContent.unifiedDocumentId),
      grant: grantSummaryFromFeedGrant(grantContent),
      bounty,
      authors: grantContent.authors,
      tab,
    };
  }

  if (
    entry.contentType === 'POST' ||
    entry.contentType === 'PREREGISTRATION' ||
    entry.contentType === 'PURCHASE' ||
    entry.contentType === 'USDFUNDRAISECONTRIBUTION'
  ) {
    const post = entry.content as FeedPostContent;
    if (!post.title) return null;
    const documentType: ContentType =
      entry.contentType === 'PREREGISTRATION' ||
      entry.contentType === 'PURCHASE' ||
      entry.contentType === 'USDFUNDRAISECONTRIBUTION' ||
      post.contentType === 'PREREGISTRATION'
        ? 'preregistration'
        : 'post';
    const tab = resolveWorkTab(entry, documentType);
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      href: buildWorkUrl({
        id: post.id,
        slug: post.slug || undefined,
        contentType: documentType,
        tab,
      }),
      imageUrl: post.previewImage,
      documentType,
      unifiedDocumentId: toOptionalNumber(post.unifiedDocumentId),
      fundraise: post.fundraise,
      bounty,
      authors:
        entry.contentType === 'PURCHASE' || entry.contentType === 'USDFUNDRAISECONTRIBUTION'
          ? undefined
          : post.authors,
      tab,
    };
  }

  return null;
}

/**
 * Prefer related-work authors when present; otherwise use the entry content's
 * authors (activity `related_work` often ships without an authors list while
 * `content_object.authors` is populated for proposal submissions).
 */
function resolveWorkAuthors(
  entry: FeedEntry,
  relatedAuthors?: AuthorProfile[]
): AuthorProfile[] | undefined {
  if (relatedAuthors?.length) return relatedAuthors;

  if (entry.contentType === 'PURCHASE' || entry.contentType === 'USDFUNDRAISECONTRIBUTION') {
    return undefined;
  }

  const content = entry.content as { authors?: AuthorProfile[] } | undefined;
  if (Array.isArray(content?.authors) && content.authors.length > 0) {
    return content.authors;
  }

  return relatedAuthors;
}

/** True when `authorId` matches an author on the work or content object. */
export function isActivityWorkAuthor(entry: FeedEntry, authorId?: number | null): boolean {
  if (!authorId) return false;

  const relatedAuthors = entry.relatedWork?.authors?.map((authorship) => authorship.authorProfile);
  const authors = resolveWorkAuthors(entry, relatedAuthors);

  return authors?.some((author) => author.id === authorId) ?? false;
}

/**
 * Whether the activity header should show the Author badge. Opening an RFP or
 * submitting a proposal already identifies the actor as the author, so the badge
 * would be redundant.
 */
export function shouldShowAuthorBadge(entry: FeedEntry, authorId?: number | null): boolean {
  if (isProposalSubmission(entry) || isGrantOpened(entry)) return false;
  return isActivityWorkAuthor(entry, authorId);
}

function workFromRelatedWork(entry: FeedEntry, related: Work): ActivityWork {
  const documentType = related.contentType;
  const tab = resolveWorkTab(entry, documentType);
  const relatedAuthors = related.authors?.map((authorship) => authorship.authorProfile);

  return {
    id: related.id,
    slug: related.slug,
    title: related.title,
    href: buildWorkUrl({
      id: related.id,
      slug: related.slug,
      contentType: documentType,
      tab,
    }),
    imageUrl: related.image,
    documentType,
    unifiedDocumentId: related.unifiedDocumentId,
    fundraise: related.fundraise,
    grant: related.grantSummary,
    bounty: getActivityBounty(entry),
    authors: resolveWorkAuthors(entry, relatedAuthors),
    tab,
  };
}

export function getActivityWork(entry: FeedEntry): ActivityWork | null {
  const related = entry.relatedWork;
  if (related?.title) {
    return workFromRelatedWork(entry, related);
  }

  return getWorkFromContent(entry);
}
