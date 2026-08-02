import { buildWorkUrl } from '@/utils/url';
import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import { getBountyDisplayAmount, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';
import { isDeadlineInFuture } from '@/utils/date';
import { toOptionalNumber } from '@/utils/number';
import type {
  ActivityContext,
  FeedBountyContent,
  FeedCommentContent,
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

export interface ActivityWorkContext {
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
  tab?: 'reviews' | 'bounties' | 'conversation';
}

export interface WorkCardAuthor {
  name: string;
  verified?: boolean;
  authorUrl?: string;
}

export interface WorkCardStat {
  label: string;
  value: string;
  accent?: boolean;
}

export type WorkCardCta =
  | { kind: 'fund-modal'; label: 'Fund' }
  | { kind: 'link'; label: string; href: string };

export interface WorkCardPresentation {
  authors: WorkCardAuthor[];
  /** Funding organization, shown in place of authors when present. */
  organization?: string | null;
  institution?: string | null;
  score?: number | null;
  stats?: WorkCardStat[];
  progress?: number;
  cta?: WorkCardCta;
  showComment: boolean;
}

export function getActivityBounty(entry: FeedEntry): Bounty | undefined {
  if (entry.contentType === 'COMMENT') {
    return (entry.content as FeedCommentContent).bounties?.[0];
  }
  if (entry.contentType === 'BOUNTY') {
    return (entry.content as FeedBountyContent).bounty;
  }
  return undefined;
}

function resolveTabFromContext(activityContext?: ActivityContext): ActivityWorkContext['tab'] {
  switch (activityContext) {
    case 'tip_review':
    case 'peer_review_published':
      return 'reviews';
    case 'bounty_opened':
    case 'bounty_contributed':
    case 'bounty_payout':
      return 'bounties';
    case 'comment_published':
      return 'conversation';
    default:
      return undefined;
  }
}

function resolveActivityBodySlot(
  activityContext?: ActivityContext,
  work?: Pick<ActivityWorkContext, 'fundraise' | 'grant' | 'bounty'>,
  options?: { isReview?: boolean }
): ActivityBodySlot {
  if (activityContext === 'bounty_opened' || activityContext === 'bounty_contributed') {
    return work?.bounty ? 'bounty' : 'default';
  }
  if (activityContext === 'grant_opened') {
    return work?.grant ? 'grant' : 'default';
  }
  if (
    activityContext === 'tip_review' ||
    activityContext === 'bounty_payout' ||
    activityContext === 'fundraise_contribution' ||
    activityContext === 'proposal_submitted'
  ) {
    return work?.fundraise ? 'fundraise' : 'default';
  }
  if (activityContext === 'peer_review_published' || options?.isReview) {
    return work?.fundraise ? 'fundraise' : 'default';
  }
  if (activityContext === 'comment_published' && work?.fundraise) {
    return 'fundraise';
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
    }));
}

/** Funding organization, from related work when present and the entry itself otherwise. */
function resolveOrganization(entry: FeedEntry, work: ActivityWorkContext): string | null {
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

export function getWorkCardPresentation(
  entry: FeedEntry,
  work: ActivityWorkContext,
  options: { showUSD: boolean; exchangeRate: number; isReview?: boolean }
): WorkCardPresentation {
  const { showUSD, exchangeRate, isReview } = options;
  const slot = resolveActivityBodySlot(entry.activityContext, work, { isReview });

  // Prefer real document score; omit when absent (no mocks).
  const score =
    entry.metrics?.reviewScore && entry.metrics.reviewScore > 0
      ? entry.metrics.reviewScore
      : work.fundraise?.reviewMetrics?.avg && work.fundraise.reviewMetrics.avg > 0
        ? work.fundraise.reviewMetrics.avg
        : null;

  const authors = toCardAuthors(work.authors);
  const institution = entry.nonprofit?.name ?? null;
  const base: WorkCardPresentation = {
    authors,
    organization: resolveOrganization(entry, work),
    institution,
    score,
    // Caller ANDs with commentPreview presence; here we only gate by slot.
    showComment: slot !== 'bounty' && slot !== 'grant',
  };

  if (slot === 'fundraise' && work.fundraise) {
    const fundraise = work.fundraise;
    const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
    const goalUsd = fundraise.goalAmount.usd;
    const raisedUsd = fundraise.amountRaised.usd;

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
      cta: isFundraiseActive(fundraise) ? { kind: 'fund-modal', label: 'Fund' } : undefined,
    };
  }

  if (slot === 'grant' && work.grant) {
    const grant = work.grant;
    const isActive =
      grant.status === 'OPEN' && (grant.endDate ? isDeadlineInFuture(grant.endDate) : true);
    const budgetAmount = showUSD ? grant.amount.usd : (grant.amount.rsc ?? 0);
    const hasBudget = grant.amount.usd > 0 || (grant.amount.rsc ?? 0) > 0;
    const stats: WorkCardStat[] = [];

    if (hasBudget) {
      stats.push({
        label: 'Available',
        value: formatAmount(budgetAmount, showUSD, exchangeRate, showUSD),
        accent: true,
      });
    }
    stats.push({
      label: 'Proposals',
      value: String(grant.numApplicants),
    });

    return {
      ...base,
      stats: stats.length ? stats : undefined,
      cta: isActive ? { kind: 'link', label: 'Apply', href: work.href } : undefined,
    };
  }

  if (slot === 'bounty' && work.bounty) {
    const bounty = work.bounty;
    const { amount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);
    const isReviewBounty = bounty.bountyType === 'REVIEW';
    const href = `${buildWorkUrl({
      id: work.id,
      slug: work.slug,
      contentType: work.documentType,
      tab: 'bounties',
    })}?focus=true`;
    const active =
      bounty.status === 'OPEN'
        ? bounty.expirationDate
          ? isDeadlineInFuture(bounty.expirationDate)
          : true
        : bounty.status === 'ASSESSMENT' || isOpenBounty(bounty);

    return {
      ...base,
      stats: [
        {
          label: isReviewBounty ? 'Peer Review' : 'Bounty',
          value: formatAmount(amount, showUSD, exchangeRate, true),
          accent: true,
        },
      ],
      cta: active ? { kind: 'link', label: isReviewBounty ? 'Review' : 'Solve', href } : undefined,
    };
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
 * Build work context from a top-level document payload when `related_work` is
 * absent (PAPER / POST / GRANT / proposal / contribution events).
 */
function getWorkContextFromContent(entry: FeedEntry): ActivityWorkContext | null {
  const tab = resolveTabFromContext(entry.activityContext);
  const bounty = getActivityBounty(entry);

  if (entry.contentType === 'PAPER') {
    const paper = entry.content as FeedPaperContent;
    if (!paper.title) return null;
    const documentType: ContentType = 'paper';
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
      authors: post.authors,
      tab,
    };
  }

  return null;
}

function workContextFromRelatedWork(entry: FeedEntry, related: Work): ActivityWorkContext {
  const tab = resolveTabFromContext(entry.activityContext);
  const documentType = related.contentType;
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
    authors: related.authors?.map((authorship) => authorship.authorProfile),
    tab,
  };
}

export function getActivityWorkContext(entry: FeedEntry): ActivityWorkContext | null {
  const related = entry.relatedWork;
  if (related?.title) {
    return workContextFromRelatedWork(entry, related);
  }

  return getWorkContextFromContent(entry);
}
