import { buildWorkUrl } from '@/utils/url';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';
import { getBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import {
  getActivityComment,
  getActivityReview,
  isFundingPoolContribution,
  isGrantOpened,
  isProposalSubmission,
  isVerifiedAuthor,
  type ActivityCommentKind,
} from './activityDisplay.utils';
import { formatCurrency } from '@/utils/currency';
import { toOptionalNumber } from '@/utils/number';
import { getGrantBadgeAmount, type FundingPool } from '@/types/grant';
import type {
  ActivityAction,
  FeedBountyContent,
  FeedEntry,
  FeedGrantContent,
  FeedPostContent,
} from '@/types/feed';
import type { Bounty } from '@/types/bounty';
import type { Fundraise, ReviewMetrics } from '@/types/funding';
import type { AuthorProfile } from '@/types/authorProfile';
import type { ContentType, Work, WorkGrantSummary } from '@/types/work';

type ActivityBodySlot = 'fundraise' | 'bounty' | 'grant' | 'default';

export interface ActivityWork {
  id: number;
  slug: string;
  title: string;
  /** The work's own page, never one of its tabs: a card always opens the work itself. */
  href: string;
  imageUrl?: string;
  documentType: ContentType;
  /** Raw document type, the only thing telling a registered report from a discussion. */
  postType?: string;
  unifiedDocumentId?: number | null;
  fundraise?: Fundraise;
  grant?: WorkGrantSummary;
  bounty?: Bounty;
  authors?: AuthorProfile[];
  /** The average score and count of the work's assessed peer reviews. */
  reviewMetrics?: ReviewMetrics;
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

function resolveActivityBodySlot(
  activityAction?: ActivityAction,
  work?: Pick<ActivityWork, 'documentType' | 'fundraise' | 'grant' | 'bounty'>,
  options?: { isReview?: boolean }
): ActivityBodySlot {
  if (activityAction === 'bounty_opened' || activityAction === 'bounty_contributed') {
    return work?.bounty ? 'bounty' : 'default';
  }
  if (activityAction === 'grant_opened') {
    return work?.grant ? 'grant' : 'default';
  }
  if (work?.grant && work.documentType === 'funding_request') {
    return 'grant';
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
      verified: isVerifiedAuthor(author),
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

function isRegisteredReport(postType?: string): boolean {
  return postType === 'REGISTERED_REPORT';
}

/** The tabs a comment can live on, for links that open on one. */
type WorkTab = 'reviews' | 'conversation' | 'updates';

/**
 * Registered reports are `post` documents, which `buildWorkUrl` has no route for. Their
 * pages carry their own tabs, so a work tab is dropped, as `/post` does when redirecting.
 */
function buildActivityWorkHref(params: {
  id: number;
  slug?: string;
  contentType: ContentType;
  postType?: string;
  tab?: WorkTab;
}): string {
  return isRegisteredReport(params.postType)
    ? buildRegisteredReportUrl(params.id, params.slug)
    : buildWorkUrl(params);
}

/** Discussions are product updates written by the ResearchHub team. */
function isDiscussion(work: ActivityWork): boolean {
  if (isRegisteredReport(work.postType)) return false;
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

/** The grant's available funding in the reader's currency, or null when it has none. */
function resolveGrantBudget(
  grant: NonNullable<ActivityWork['grant']>,
  showUSD: boolean,
  exchangeRate: number
): string | null {
  const badge = getGrantBadgeAmount({
    amount: { usd: grant.amount.usd, rsc: grant.amount.rsc ?? 0 },
    fundingPool: grant.fundingPool,
  });

  if (showUSD) {
    return badge.usd > 0 ? formatAmount(badge.usd, showUSD, exchangeRate, true) : null;
  }
  if (badge.rsc > 0) {
    return formatAmount(badge.rsc, showUSD, exchangeRate, false);
  }
  if (badge.usd > 0 && exchangeRate > 0) {
    return formatAmount(badge.usd / exchangeRate, showUSD, exchangeRate, true);
  }
  return null;
}

function presentGrant(
  base: WorkCardPresentation,
  grant: NonNullable<ActivityWork['grant']>,
  showUSD: boolean,
  exchangeRate: number
): WorkCardPresentation {
  const stats: WorkCardStat[] = [];
  const budget = resolveGrantBudget(grant, showUSD, exchangeRate);

  if (budget != null) {
    stats.push({ label: 'Available', value: budget, accent: true });
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

export interface WorkCoverStat {
  label: string;
  /** Label for narrow screens, when the full one would crowd the title. */
  shortLabel?: string;
  value: string;
  /** `rating` draws a star before the value; everything else is an amount. */
  tone?: 'amount' | 'rating';
}

/** What the frosted bar on an activity card's cover shows. */
export interface WorkCoverPresentation {
  /** Kind of work and whose it is: "Proposal · Darren Wang", "RFP · Athanatos Foundation". */
  eyebrow: string;
  brand?: 'researchhub';
  /** At most two figures, so the title keeps the room. */
  stats: WorkCoverStat[];
  /** How far a proposal's fundraise is toward its goal, from 0 to 1. */
  progress?: number;
  showComment: boolean;
}

function getWorkKindLabel(work: ActivityWork): string {
  if (isRegisteredReport(work.postType)) return 'Registered report';
  switch (work.documentType) {
    case 'preregistration':
      return 'Proposal';
    case 'funding_request':
      return 'RFP';
    case 'paper':
      return 'Paper';
    case 'question':
      return 'Question';
    default:
      return 'Post';
  }
}

/**
 * The work's average score across its assessed peer reviews. Deliberately not a
 * single review's score: on the cover it reads as the work's rating.
 */
function resolveCoverRating(work: ActivityWork): number | null {
  const average = (work.reviewMetrics ?? work.fundraise?.reviewMetrics)?.avg;
  return average && average > 0 ? average : null;
}

/**
 * Every card about a proposal shows how far its fundraise has come, whatever the
 * activity was, so the bar is read from the work rather than the card's slot.
 */
function resolveFundingProgress(work: ActivityWork): number | undefined {
  if (work.documentType !== 'preregistration' || !work.fundraise) return undefined;
  const goal = work.fundraise.goalAmount?.usd ?? 0;
  if (goal <= 0) return undefined;
  return Math.min(1, (work.fundraise.amountRaised?.usd ?? 0) / goal);
}

function getSlotStat(
  slot: ActivityBodySlot,
  work: ActivityWork,
  showUSD: boolean,
  exchangeRate: number
): WorkCoverStat | null {
  if (slot === 'fundraise' && work.fundraise) {
    const { goalAmount } = work.fundraise;
    const goal = (showUSD ? goalAmount?.usd : goalAmount?.rsc) ?? 0;
    return goal > 0
      ? { label: 'Raising', value: formatAmount(goal, showUSD, exchangeRate, true) }
      : null;
  }

  if (slot === 'grant' && work.grant) {
    const budget = resolveGrantBudget(work.grant, showUSD, exchangeRate);
    return budget ? { label: 'Available funding', shortLabel: 'Funding', value: budget } : null;
  }

  if (slot === 'bounty' && work.bounty) {
    const { amount } = getBountyDisplayAmount(work.bounty, exchangeRate, showUSD);
    return {
      label: work.bounty.bountyType === 'REVIEW' ? 'Review bounty' : 'Bounty',
      value: formatAmount(amount, showUSD, exchangeRate, true),
    };
  }

  return null;
}

/** The work's rating wherever it has one, then the figure the card's slot carries. */
function getCoverStats(
  slot: ActivityBodySlot,
  work: ActivityWork,
  showUSD: boolean,
  exchangeRate: number
): WorkCoverStat[] {
  const stats: WorkCoverStat[] = [];
  const rating = resolveCoverRating(work);
  if (rating != null) {
    stats.push({ label: 'Rating', value: rating.toFixed(1), tone: 'rating' });
  }
  const slotStat = getSlotStat(slot, work, showUSD, exchangeRate);
  if (slotStat) stats.push(slotStat);
  return stats;
}

export function getWorkCoverPresentation(
  entry: FeedEntry,
  work: ActivityWork,
  options: { showUSD: boolean; exchangeRate: number; isReview?: boolean }
): WorkCoverPresentation {
  const { showUSD, exchangeRate, isReview } = options;
  const slot = resolveActivityBodySlot(entry.activityAction, work, { isReview });
  const base = buildBasePresentation(entry, work, slot, { isReview });

  const owner = base.brand
    ? 'ResearchHub'
    : base.organization || base.authors[0]?.name || base.institution;

  return {
    eyebrow: owner ? `${getWorkKindLabel(work)} · ${owner}` : getWorkKindLabel(work),
    brand: base.brand,
    showComment: base.showComment,
    stats: getCoverStats(slot, work, showUSD, exchangeRate),
    progress: resolveFundingProgress(work),
  };
}

/**
 * The work's page, on the tab a comment of this kind lives on: reviews on the reviews
 * tab, author updates on updates (proposals only have one), the rest in conversation.
 */
export function getWorkHrefForComment(work: ActivityWork, kind: ActivityCommentKind): string {
  let tab: WorkTab = 'conversation';
  if (kind === 'review') tab = 'reviews';
  else if (kind === 'update' && work.documentType === 'preregistration') tab = 'updates';
  return buildActivityWorkHref({
    id: work.id,
    slug: work.slug || undefined,
    contentType: work.documentType,
    postType: work.postType,
    tab,
  });
}

/**
 * The one button on an activity card. Funding opens the contribution modal in place;
 * everything else is a link to where the activity happened.
 */
export type ActivityCta =
  /** Opens the card's side panel on its words: a review or an author update. */
  | { kind: 'panel'; label: string }
  | { kind: 'fund-proposal'; label: string; shortLabel: string; fundraise: Fundraise }
  | { kind: 'fund-pool'; label: string; fundingPool: FundingPool }
  | { kind: 'link'; label: string; href: string };

function readLabel(work: ActivityWork): string {
  switch (work.documentType) {
    case 'preregistration':
      return 'Read proposal';
    case 'funding_request':
      return 'View RFP';
    case 'paper':
      return 'Read paper';
    default:
      return 'Read post';
  }
}

export function getActivityCta(entry: FeedEntry, work: ActivityWork): ActivityCta {
  const link = (label: string): ActivityCta => ({ kind: 'link', label, href: work.href });
  const openFundraise = work.fundraise?.status === 'OPEN' ? work.fundraise : undefined;
  const commentType =
    entry.content.contentType === 'COMMENT' ? entry.content.comment?.commentType : undefined;

  // A review, or a payout for one, always leads to the review itself, opened in
  // place; one that arrives without its text falls back to the work's page.
  if (getActivityReview(entry)) return { kind: 'panel', label: 'Read review' };
  if (entry.contentType === 'FUNDINGACTIVITY' || commentType === 'REVIEW') {
    return link('Read review');
  }

  if (entry.activityAction === 'bounty_opened' || entry.contentType === 'BOUNTY') {
    return link('View bounty');
  }

  // An update is read in place too, with its videos playing there.
  if (getActivityComment(entry)?.kind === 'update') return { kind: 'panel', label: 'Read update' };

  if (commentType) return link('Reply');

  if (isFundingPoolContribution(entry)) {
    const pool = work.grant?.fundingPool;
    return pool?.status === 'OPEN'
      ? { kind: 'fund-pool', label: 'Add to pool', fundingPool: pool }
      : link('View RFP');
  }

  if (openFundraise) {
    return {
      kind: 'fund-proposal',
      label: 'Fund proposal',
      shortLabel: 'Fund',
      fundraise: openFundraise,
    };
  }

  return link(readLabel(work));
}

function grantSummaryFromFeedGrant(content: FeedGrantContent): WorkGrantSummary | undefined {
  const grant = content.grant;
  if (!grant) return undefined;
  return {
    status: grant.status,
    organization: grant.organization,
    amount: { usd: grant.amount.usd, rsc: grant.amount.rsc ?? null },
    fundingPool: grant.fundingPool ?? null,
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

  // Paper pages are retired, so a paper event has no work card to show.
  if (entry.contentType === 'PAPER') return null;

  if (entry.contentType === 'GRANT') {
    const grantContent = entry.content as FeedGrantContent;
    if (!grantContent.title) return null;
    const documentType: ContentType = 'funding_request';
    return {
      id: grantContent.id,
      slug: grantContent.slug,
      title: grantContent.title,
      href: buildWorkUrl({
        id: grantContent.id,
        slug: grantContent.slug,
        contentType: documentType,
      }),
      imageUrl: grantContent.previewImage,
      documentType,
      unifiedDocumentId: toOptionalNumber(grantContent.unifiedDocumentId),
      grant: grantSummaryFromFeedGrant(grantContent),
      bounty,
      authors: grantContent.authors,
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
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      href: buildActivityWorkHref({
        id: post.id,
        slug: post.slug || undefined,
        contentType: documentType,
        postType: post.postType,
      }),
      imageUrl: post.previewImage,
      documentType,
      postType: post.postType,
      unifiedDocumentId: toOptionalNumber(post.unifiedDocumentId),
      fundraise: post.fundraise,
      bounty,
      authors:
        entry.contentType === 'PURCHASE' || entry.contentType === 'USDFUNDRAISECONTRIBUTION'
          ? undefined
          : post.authors,
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
  const relatedAuthors = related.authors?.map((authorship) => authorship.authorProfile);

  return {
    id: related.id,
    slug: related.slug,
    title: related.title,
    href: buildActivityWorkHref({
      id: related.id,
      slug: related.slug,
      contentType: documentType,
      postType: related.postType,
    }),
    imageUrl: related.image,
    documentType,
    postType: related.postType,
    unifiedDocumentId: related.unifiedDocumentId,
    fundraise: related.fundraise,
    grant: related.grantSummary,
    bounty: getActivityBounty(entry),
    authors: resolveWorkAuthors(entry, relatedAuthors),
    reviewMetrics: related.reviewMetrics,
  };
}

export function getActivityWork(entry: FeedEntry): ActivityWork | null {
  const related = entry.relatedWork;
  if (related?.title) {
    return workFromRelatedWork(entry, related);
  }

  return getWorkFromContent(entry);
}
