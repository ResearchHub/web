import { buildWorkUrl } from '@/utils/url';
import { findLatestFoundationBounty, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import { getRemainingDays } from '@/utils/date';
import type {
  AssociatedGrant,
  FeedBountyContent,
  FeedCommentContent,
  FeedContentType,
  FeedEntry,
  FeedGrantContent,
  FeedPaperContent,
  FeedPostContent,
} from '@/types/feed';
import type { AuthorProfile } from '@/types/authorProfile';
import type { Bounty } from '@/types/bounty';
import type { CommentType, ContentFormat } from '@/types/comment';
import type { CommentContent } from '@/components/Comment/lib/types';
import type { ContentType } from '@/types/work';

const COMMENT_ACTION_LABELS: Record<CommentType, string> = {
  GENERIC_COMMENT: 'commented on',
  REVIEW: 'peer reviewed',
  AUTHOR_UPDATE: 'posted an update',
  ANSWER: 'answered on',
  BOUNTY: 'contributed to',
};

const DOC_ACTION_LABELS: Partial<Record<FeedContentType, string>> = {
  PREREGISTRATION: 'submitted proposal',
  POST: 'posted discussion',
  PAPER: 'published preprint',
};

const FEED_TO_CONTENT_TYPE: Partial<Record<FeedContentType, ContentType>> = {
  GRANT: 'funding_request',
  PREREGISTRATION: 'preregistration',
  POST: 'post',
  PAPER: 'paper',
};

/**
 * Base action label shown in the author line. For entries that also carry an
 * inline amount or score (grants, contributions, scored reviews) the label
 * includes the trailing connector word (e.g. "for", "and scored") so the
 * amount/score can be rendered immediately after it in the same sentence.
 */
export function getActionLabel(entry: FeedEntry): string {
  if (entry.contentType === 'COMMENT') {
    const commentContent = entry.content as FeedCommentContent;
    if (commentContent.hasBounties) return 'opened a bounty';
    const commentType = commentContent.comment?.commentType;
    if (commentType === 'REVIEW') {
      const score = commentContent.review?.score ?? commentContent.comment.reviewScore;
      return score != null ? 'peer reviewed and scored' : 'peer reviewed';
    }
    return COMMENT_ACTION_LABELS[commentType] ?? 'commented on';
  }
  if (entry.contentType === 'BOUNTY') return 'contributed to';
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    return 'funded proposal for';
  }
  if (entry.contentType === 'GRANT') return 'opened a funding opportunity for';
  return DOC_ACTION_LABELS[entry.contentType] ?? 'contributed';
}

export interface FeedEntryMeta {
  title?: string;
  author?: AuthorProfile;
  href?: string;
}

type CommentWorkTab = 'reviews' | 'bounties' | 'conversation' | undefined;

function resolveCommentWorkTab(
  entry: FeedEntry,
  comment: FeedCommentContent | null
): CommentWorkTab {
  if (comment?.comment?.commentType === 'REVIEW') return 'reviews';
  if (entry.contentType === 'BOUNTY' || comment?.hasBounties) return 'bounties';
  if (entry.contentType === 'COMMENT') return 'conversation';
  return undefined;
}

export function getEntryMeta(entry: FeedEntry): FeedEntryMeta {
  const content = entry.content;
  const author = content.createdBy;

  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    const work = entry.relatedWork;
    const comment = entry.contentType === 'COMMENT' ? (content as FeedCommentContent) : null;
    const tab = resolveCommentWorkTab(entry, comment);
    return {
      title: work?.title,
      author,
      href: work
        ? buildWorkUrl({
            id: work.id,
            slug: work.slug,
            contentType: work.contentType,
            tab,
          })
        : undefined,
    };
  }

  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    const post = content as FeedPostContent;
    return {
      title: post.title,
      author,
      href: post.id
        ? buildWorkUrl({
            id: post.id,
            slug: post.slug || undefined,
            contentType: 'preregistration',
          })
        : undefined,
    };
  }

  const titled = content as FeedPostContent | FeedPaperContent | FeedGrantContent;
  const targetType = FEED_TO_CONTENT_TYPE[entry.contentType];
  return {
    title: titled.title,
    author,
    href: targetType
      ? buildWorkUrl({
          id: titled.id,
          slug: titled.slug,
          contentType: targetType,
        })
      : undefined,
  };
}

export type FeedEntryIconName = 'bell' | 'coins' | 'message' | null;

export function getActionIcon(entry: FeedEntry): FeedEntryIconName {
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    return 'coins';
  }
  if (entry.contentType === 'BOUNTY') return 'coins';
  if (entry.contentType !== 'COMMENT') return null;

  const commentContent = entry.content as FeedCommentContent;
  if (commentContent.hasBounties) return 'coins';

  const commentType = commentContent.comment?.commentType;
  if (commentType === 'AUTHOR_UPDATE') return 'bell';
  if (commentType === 'GENERIC_COMMENT' || commentType === 'ANSWER') return 'message';
  return null;
}

export function getReviewScore(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'COMMENT') return undefined;
  const commentContent = entry.content as FeedCommentContent;
  if (commentContent.comment?.commentType !== 'REVIEW') return undefined;
  return commentContent.review?.score ?? commentContent.comment.reviewScore;
}

export interface FeedContribution {
  amount: number;
  currency: 'USD' | 'RSC';
}

export function getContribution(entry: FeedEntry): FeedContribution | undefined {
  if (entry.contentType !== 'USDFUNDRAISECONTRIBUTION' && entry.contentType !== 'PURCHASE') {
    return undefined;
  }
  const post = entry.content as FeedPostContent;
  const contribution = post.fundraiseContribution;
  if (contribution?.amount == null) return undefined;
  return { amount: contribution.amount, currency: contribution.currency };
}

export interface DisplayedAmount {
  amount: number;
  inUSD: boolean;
}

function toDisplayPrecision(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function resolveDisplayedContribution(
  contribution: FeedContribution,
  showUSD: boolean,
  exchangeRate: number
): DisplayedAmount {
  const sourceIsUSD = contribution.currency === 'USD';
  const canConvert = exchangeRate > 0;
  const inUSD = canConvert ? showUSD : sourceIsUSD;

  if (sourceIsUSD === inUSD) return { amount: toDisplayPrecision(contribution.amount), inUSD };
  if (sourceIsUSD) return { amount: toDisplayPrecision(contribution.amount / exchangeRate), inUSD };
  return { amount: toDisplayPrecision(contribution.amount * exchangeRate), inUSD };
}

export interface FeedGrantAmount {
  usd: number;
  rsc: number;
}

export function getGrantAmount(entry: FeedEntry): FeedGrantAmount | undefined {
  if (entry.contentType !== 'GRANT') return undefined;
  const grant = (entry.content as FeedGrantContent).grant;
  if (!grant?.amount) return undefined;
  return { usd: grant.amount.usd, rsc: grant.amount.rsc };
}

/** Preview image for the document an entry refers to (direct content or related work). */
export function getPreviewImage(entry: FeedEntry): string | undefined {
  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    return entry.relatedWork?.image || undefined;
  }
  return (entry.content as { previewImage?: string })?.previewImage || undefined;
}

export interface FeedCommentPreview {
  content: CommentContent;
  format: ContentFormat;
  isReview: boolean;
}

/**
 * Author-update posts often lead with a standalone "UPDATED" label paragraph
 * before the real content. Strip it so the preview starts with the update
 * itself.
 */
function stripLeadingUpdateLabel(content: CommentContent): CommentContent {
  if (typeof content !== 'object' || content === null || !Array.isArray((content as any).content)) {
    return content;
  }
  const nodes = (content as { content: any[] }).content;
  const [first, ...rest] = nodes;
  if (!first) return content;

  const text = (first.content ?? [])
    .map((n: any) => n.text ?? '')
    .join('')
    .trim();

  if (!/^updated?:?$/i.test(text)) return content;
  return { ...content, content: rest } as CommentContent;
}

export function getCommentPreview(entry: FeedEntry): FeedCommentPreview | null {
  if (entry.contentType !== 'COMMENT') return null;
  const { comment } = entry.content as FeedCommentContent;
  if (!comment?.content) return null;
  const content =
    comment.commentType === 'AUTHOR_UPDATE'
      ? stripLeadingUpdateLabel(comment.content)
      : comment.content;
  return {
    content,
    format: comment.contentFormat,
    isReview: comment.commentType === 'REVIEW',
  };
}

export interface FeedDocumentAuthor {
  name: string;
  verified?: boolean;
  authorUrl?: string;
}

export interface FeedDocumentInfo {
  /** Short document-type label for the card badge (e.g. "Paper"). */
  typeLabel: string | null;
  /** Document authors, in AuthorList shape. */
  authors: FeedDocumentAuthor[];
  /** Institution or nonprofit shown for proposals. */
  institution: string | null;
  /** Average peer-review score; mocked deterministically when unavailable. */
  reviewScore: number | null;
  /** Href for the document card's CTA button, when applicable. */
  ctaHref: string | null;
  /** Label for the document card's CTA button (e.g. "Fund" a proposal, "Apply" to an opportunity). */
  ctaLabel: 'Fund' | 'Apply' | null;
}

const WORK_TYPE_LABELS: Record<ContentType, string> = {
  paper: 'Paper',
  post: 'Post',
  preregistration: 'Proposal',
  question: 'Question',
  discussion: 'Discussion',
  funding_request: 'Opportunity',
};

const ENTRY_TYPE_LABELS: Partial<Record<FeedContentType, string>> = {
  GRANT: 'Opportunity',
  PREREGISTRATION: 'Proposal',
  POST: 'Post',
  PAPER: 'Paper',
  USDFUNDRAISECONTRIBUTION: 'Proposal',
  PURCHASE: 'Proposal',
};

/** Deterministic placeholder score in the 3.5–4.9 range (demo only). */
function mockReviewScore(seed: string | number): number {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return Math.round((3.5 + (hash % 15) / 10) * 10) / 10;
}

function toDocumentAuthors(authors: (AuthorProfile | undefined)[]): FeedDocumentAuthor[] {
  return authors
    .filter((author): author is AuthorProfile => !!author?.fullName?.trim())
    .map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      authorUrl: author.id === 0 ? undefined : author.profileUrl,
    }));
}

const MOCK_AUTHOR_NAMES = [
  'Dr. Elena Vasquez',
  'Dr. Marcus Chen',
  'Dr. Priya Nair',
  'Dr. Samuel Okoro',
  'Dr. Anna Kowalski',
  'Dr. Liam Fitzgerald',
];

/** Deterministic placeholder author list for proposals missing real authors (demo only). */
function mockDocumentAuthors(seed: string | number): FeedDocumentAuthor[] {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const count = 1 + (hash % 2);
  return Array.from({ length: count }, (_, i) => ({
    name: MOCK_AUTHOR_NAMES[(hash + i) % MOCK_AUTHOR_NAMES.length],
  }));
}

/** Reviewable document types that should display a peer-review score. */
const REVIEWABLE_TYPE_LABELS = new Set(['Paper', 'Proposal']);

/** Type label, authors, institution, and review score for an entry's document. */
export function getDocumentInfo(entry: FeedEntry): FeedDocumentInfo {
  let typeLabel: string | null;
  let authors: FeedDocumentAuthor[];
  let institution: string | null = null;
  let ctaHref: string | null = null;
  let ctaLabel: 'Fund' | 'Apply' | null = null;

  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    const work = entry.relatedWork;
    typeLabel = work ? (WORK_TYPE_LABELS[work.contentType] ?? null) : null;
    authors = work ? toDocumentAuthors(work.authors.map((a) => a.authorProfile)) : [];
  } else {
    typeLabel = ENTRY_TYPE_LABELS[entry.contentType] ?? null;
    const content = entry.content as FeedPostContent | FeedPaperContent | FeedGrantContent;
    authors = toDocumentAuthors(
      'authors' in content && Array.isArray(content.authors) ? content.authors : []
    );
    if (typeLabel === 'Proposal') {
      institution = entry.nonprofit?.name || (content as FeedPostContent).institution || null;

      const postContent = content as FeedPostContent;
      if (postContent.fundraise) {
        if (isFundraiseActive(postContent.fundraise)) {
          ctaHref = buildWorkUrl({
            id: postContent.id,
            slug: postContent.slug,
            contentType: 'preregistration',
          });
          ctaLabel = 'Fund';
        }
      } else if (
        entry.contentType === 'USDFUNDRAISECONTRIBUTION' ||
        entry.contentType === 'PURCHASE'
      ) {
        // Contribution/purchase entries don't carry fundraise status; assume the
        // proposal someone just funded is still open to further contributions.
        ctaHref = getEntryMeta(entry).href ?? null;
        ctaLabel = ctaHref ? 'Fund' : null;
      }
    } else if (typeLabel === 'Opportunity' && entry.contentType === 'GRANT') {
      ctaHref = getEntryMeta(entry).href ?? null;
      ctaLabel = ctaHref ? 'Apply' : null;
    }
  }

  if (typeLabel === 'Proposal' && authors.length === 0) {
    authors = mockDocumentAuthors(entry.id);
  }

  let reviewScore: number | null = null;
  if (typeLabel && REVIEWABLE_TYPE_LABELS.has(typeLabel)) {
    const realScore = entry.metrics?.reviewScore;
    reviewScore = realScore && realScore > 0 ? realScore : mockReviewScore(entry.id);
  }

  return { typeLabel, authors, institution, reviewScore, ctaHref, ctaLabel };
}

export interface ReviewOpportunity {
  title: string;
  href?: string;
  /** e.g. "closes in 6 days", or null when unknown/expired. */
  closesLabel: string | null;
  /** Contextual line for the card footer, e.g. "Earn 150 RSC for reviewing · closes in 6 days". */
  metaLabel: string;
  /** Preview image of the related document, when available. */
  previewImage?: string;
  /** Feed entry timestamp used for the "time ago" label. */
  timestamp?: string;
  /** Type label and author line for the related document. */
  documentInfo?: FeedDocumentInfo;
}

function formatClosesLabel(expirationDate?: string): string | null {
  const days = getRemainingDays(expirationDate ?? null);
  if (days === null) return null;
  if (days < 1) return 'closes in less than a day';
  const wholeDays = Math.floor(days);
  return `closes in ${wholeDays} day${wholeDays === 1 ? '' : 's'}`;
}

function resolveOpenReviewBounty(entry: FeedEntry): Bounty | undefined {
  if (entry.contentType === 'BOUNTY') {
    const bounty = (entry.content as FeedBountyContent).bounty;
    if (bounty?.bountyType === 'REVIEW' && isOpenBounty(bounty)) return bounty;
    return undefined;
  }

  if (entry.contentType !== 'COMMENT') return undefined;
  const commentContent = entry.content as FeedCommentContent;
  const bounties = commentContent.bounties ?? [];
  const foundation = findLatestFoundationBounty(bounties);
  if (foundation && isOpenBounty(foundation)) return foundation;

  return bounties.find((bounty) => bounty.bountyType === 'REVIEW' && isOpenBounty(bounty));
}

/**
 * Returns peer-review earning opportunity details when the entry is an open
 * REVIEW bounty (Foundation or otherwise).
 */
export function getReviewOpportunity(entry: FeedEntry): ReviewOpportunity | null {
  const bounty = resolveOpenReviewBounty(entry);
  if (!bounty) return null;

  const { title } = getEntryMeta(entry);
  if (!title) return null;

  const work = entry.relatedWork;
  const href = work
    ? buildWorkUrl({
        id: work.id,
        slug: work.slug,
        contentType: work.contentType,
        tab: 'reviews',
      })
    : getEntryMeta(entry).href;

  const closesLabel = formatClosesLabel(bounty.expirationDate);
  const bountyAmount = Math.round(parseFloat(bounty.totalAmount || bounty.amount));
  const earnLabel =
    bountyAmount > 0
      ? `Earn ${bountyAmount.toLocaleString()} RSC for reviewing`
      : 'Peer review requested';

  return {
    title,
    href,
    closesLabel,
    metaLabel: closesLabel ? `${earnLabel} · ${closesLabel}` : earnLabel,
    previewImage: getPreviewImage(entry),
    timestamp: entry.timestamp,
    documentInfo: getDocumentInfo(entry),
  };
}

export interface QuotedGrantCard {
  title: string;
  organization: string;
  imageSrc?: string;
  href?: string;
  numApplicants: number;
  /** Formatted amount string, e.g. "$10,000". */
  amountLabel: string;
}

/** Returns the first associated grant as a quoted card when the entry is a proposal. */
export function getQuotedGrant(entry: FeedEntry): QuotedGrantCard | null {
  const grants = entry.associatedGrants;
  if (!grants || grants.length === 0) return null;
  if (entry.contentType !== 'PREREGISTRATION' && entry.contentType !== 'PURCHASE') return null;

  const g: AssociatedGrant = grants[0];
  const amountNum = parseFloat(g.amount);
  const amountLabel =
    g.currency === 'USD'
      ? `$${Math.round(amountNum).toLocaleString()}`
      : `${Math.round(amountNum).toLocaleString()} RSC`;

  const href = g.postId
    ? buildWorkUrl({ id: g.postId, contentType: 'funding_request' })
    : undefined;

  return {
    title: g.shortTitle,
    organization: g.organization,
    imageSrc: g.image ?? undefined,
    href,
    numApplicants: g.numApplicants,
    amountLabel,
  };
}

export interface FeedFundraiseAmounts {
  goalUsd: number;
  raisedUsd: number;
}

/** Deterministic placeholder goal in the $5K–$50K range, rounded to $500 (demo only). */
function mockFundraiseGoal(seed: string | number): number {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 5000 + (hash % 91) * 500;
}

/**
 * Goal and raised amounts (USD) for a proposal entry's fundraise. Only call
 * for entries whose document is a proposal; falls back to a deterministic
 * mocked goal when the entry carries no fundraise data (demo only).
 */
export function getFundraiseAmounts(entry: FeedEntry): FeedFundraiseAmounts {
  const fundraise = (entry.content as FeedPostContent).fundraise;
  if (!fundraise?.goalAmount) {
    const goalUsd = mockFundraiseGoal(entry.id);
    // Deterministic raised fraction in the 10–90% range (demo only).
    let hash = 0;
    for (const ch of `raised:${entry.id}`) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return { goalUsd, raisedUsd: Math.round(goalUsd * (0.1 + (hash % 81) / 100)) };
  }
  return {
    goalUsd: fundraise.goalAmount.usd,
    raisedUsd: fundraise.amountRaised?.usd ?? 0,
  };
}

function formatDaysLeftLabel(date?: string | null): string | null {
  const days = getRemainingDays(date ?? null);
  if (days === null) return null;
  if (days < 1) return 'less than a day left';
  const wholeDays = Math.floor(days);
  return `${wholeDays} day${wholeDays === 1 ? '' : 's'} left`;
}

/**
 * Contextual footer line for a proposal fundraise, e.g. "68% funded · 6 days
 * left", falling back to "$38,500 of $57,000 raised" when no deadline is known.
 */
export function getFundraiseMetaLabel(entry: FeedEntry): string | null {
  const { goalUsd, raisedUsd } = getFundraiseAmounts(entry);
  if (goalUsd <= 0) return null;

  const percent = Math.min(100, Math.round((raisedUsd / goalUsd) * 100));
  const daysLeft = formatDaysLeftLabel((entry.content as FeedPostContent).fundraise?.endDate);
  if (daysLeft) return `${percent}% funded · ${daysLeft}`;
  return `$${Math.round(raisedUsd).toLocaleString()} of $${Math.round(goalUsd).toLocaleString()} raised`;
}

/**
 * Contextual footer line for a grant/funding-opportunity entry, e.g.
 * "10 proposals submitted · 12 days left" or "Rolling deadline".
 */
export function getGrantMetaLabel(entry: FeedEntry): string | null {
  if (entry.contentType !== 'GRANT') return null;
  const grant = (entry.content as FeedGrantContent).grant;
  if (!grant) return null;

  const parts: string[] = [];
  const numApplicants = grant.applicants?.length ?? 0;
  if (numApplicants > 0) {
    parts.push(`${numApplicants} proposal${numApplicants === 1 ? '' : 's'} submitted`);
  }
  parts.push(formatDaysLeftLabel(grant.endDate) ?? 'Rolling deadline');
  return parts.join(' · ');
}

/** Returns the short text preview for an entry when one exists. */
export function getTextPreview(entry: FeedEntry): string | null {
  if (entry.contentType === 'PREREGISTRATION' || entry.contentType === 'POST') {
    return (entry.content as FeedPostContent).textPreview || null;
  }
  return null;
}
