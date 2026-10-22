import { buildWorkUrl } from '@/utils/url';
import { isFoundationUser } from '@/components/Bounty/lib/bountyUtil';
import type { CurrencyAmount } from '@/utils/currency';
import { parseContent } from '@/components/Comment/lib/commentContentUtils';
import type {
  FeedBountyContent,
  FeedCommentContent,
  FeedContentType,
  FeedEntry,
  FeedFundingActivityContent,
  FeedGrantContent,
  FeedPaperContent,
  FeedPostContent,
  ParentCommentPreview,
} from '@/types/feed';
import type { AuthorProfile } from '@/types/authorProfile';
import type { CommentType, ContentFormat } from '@/types/comment';
import type { CommentContent, TipTapNode, TipTapTextNode } from '@/components/Comment/lib/types';
import type { Bounty } from '@/types/bounty';
import type { ContentType } from '@/types/work';

const COMMENT_ACTION_LABELS: Record<CommentType, string> = {
  GENERIC_COMMENT: 'commented on',
  REVIEW: 'peer reviewed',
  AUTHOR_UPDATE: 'posted an update on their research',
  ANSWER: 'answered on',
  BOUNTY: 'contributed to',
};

const DOC_ACTION_LABELS: Partial<Record<FeedContentType, string>> = {
  GRANT: 'opened an RFP for',
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

export interface ActivityHeaderTarget {
  author: AuthorProfile;
  suffix?: string;
}

export interface ActivityHeaderMessage {
  actor: AuthorProfile;
  verb: string;
  target?: ActivityHeaderTarget;
  isEarning?: boolean;
  suffix?: string;
}

/**
 * True when the profile belongs to the ResearchHub Foundation account.
 */
function isFoundationProfile(profile?: AuthorProfile): boolean {
  if (!profile) return false;
  if (profile.userId != null) return isFoundationUser(profile.userId);
  if (profile.user?.id != null) return isFoundationUser(profile.user.id);
  return false;
}

/**
 * Feed entries carry verification on the nested user, while a profile's own
 * author record carries it at the top level, so check both.
 */
export function isVerifiedAuthor(author?: AuthorProfile): boolean {
  return Boolean(author?.isVerified || author?.user?.isVerified);
}

function getFundingActivityMessage(content: FeedFundingActivityContent): ActivityHeaderMessage {
  const actor = content.createdBy;
  const recipient = content.recipient;

  if (recipient && (content.sourceType === 'BOUNTY_PAYOUT' || isFoundationProfile(actor))) {
    return {
      actor: recipient,
      verb: 'earned',
      isEarning: true,
      suffix: ' for their peer review',
    };
  }

  if (content.sourceType === 'BOUNTY_PAYOUT') {
    return { actor, verb: 'awarded bounty', isEarning: true };
  }

  if (!recipient) {
    return { actor, verb: 'tipped review' };
  }
  return {
    actor,
    verb: 'tipped',
    target: {
      author: recipient,
      suffix: ' on peer review',
    },
  };
}

export function isFundingPoolContribution(entry: FeedEntry): boolean {
  if (entry.contentType !== 'PURCHASE' && entry.contentType !== 'USDFUNDRAISECONTRIBUTION') {
    return false;
  }
  return entry.relatedWork?.contentType === 'funding_request';
}

function getDefaultActivityMessage(entry: FeedEntry): ActivityHeaderMessage {
  const actor = entry.content.createdBy;

  if (entry.contentType === 'COMMENT') {
    const commentContent = entry.content as FeedCommentContent;
    const bounty = commentContent.bounties?.[0];
    if (bounty) {
      const isReviewBounty = bounty.bountyType === 'REVIEW';
      return {
        actor,
        verb: isReviewBounty ? 'opened a peer review bounty for' : 'opened a bounty for',
      };
    }

    const commentType = commentContent.comment?.commentType;
    if (commentType === 'REVIEW') {
      if (getReviewEarning(entry)) {
        return {
          actor,
          verb: 'earned',
          isEarning: true,
          suffix: ' for their peer review',
        };
      }
      const score = commentContent.review?.score ?? commentContent.comment.reviewScore;
      return { actor, verb: score ? 'peer reviewed and scored' : 'peer reviewed' };
    }

    return {
      actor,
      verb: COMMENT_ACTION_LABELS[commentType] ?? 'commented on',
    };
  }

  if (entry.contentType === 'BOUNTY') {
    return { actor, verb: 'contributed to' };
  }

  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    return isFundingPoolContribution(entry)
      ? { actor, verb: 'contributed', suffix: ' to the funding pool' }
      : { actor, verb: 'funded this proposal with' };
  }

  // Registered reports arrive as `post` entries; only the document type sets them apart,
  // and it sits on the entry itself or on the work it relates to.
  const postType = (entry.content as FeedPostContent).postType ?? entry.relatedWork?.postType;
  if (entry.contentType === 'POST' && postType === 'REGISTERED_REPORT') {
    return { actor, verb: 'published registered report' };
  }

  return {
    actor,
    verb: DOC_ACTION_LABELS[entry.contentType] ?? 'contributed to',
  };
}

/** An author publishing their own proposal, rather than acting on someone else's work. */
export function isProposalSubmission(entry: FeedEntry): boolean {
  return entry.activityAction === 'proposal_submitted' || entry.contentType === 'PREREGISTRATION';
}

/** An organization or author publishing their own RFP. */
export function isGrantOpened(entry: FeedEntry): boolean {
  return entry.activityAction === 'grant_opened' || entry.contentType === 'GRANT';
}

/** A document's own publication, which all of its authors share credit for. */
export function isDocumentPublication(entry: FeedEntry): boolean {
  return entry.contentType in DOC_ACTION_LABELS;
}

/**
 * `profileAuthor`, when given, is the author whose profile the entry appears on.
 * Documents arrive credited to their lead bylined author, so a co-authored work
 * would otherwise headline the same person on every author's profile.
 */
export function getActivityHeaderMessage(
  entry: FeedEntry,
  profileAuthor?: AuthorProfile
): ActivityHeaderMessage {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    return getFundingActivityMessage(entry.content as FeedFundingActivityContent);
  }

  const message = getDefaultActivityMessage(entry);
  if (profileAuthor && isDocumentPublication(entry)) {
    return { ...message, actor: profileAuthor };
  }
  return message;
}

export interface ActivityEntryMeta {
  title?: string;
  author?: AuthorProfile;
  href?: string;
}

type CommentWorkTab = 'reviews' | 'bounties' | 'conversation' | 'updates' | undefined;

/**
 * Author updates belong on their work's Updates tab, but only proposals have
 * one: `WorkTabs` renders it for the fund content type alone, and `/updates` is
 * only routed under `/proposal` and `/report`. On any other work the update has
 * to settle for the conversation tab rather than link at a missing route.
 */
function shouldLinkToUpdatesTab(entry: FeedEntry, workContentType?: ContentType): boolean {
  if (entry.contentType !== 'COMMENT') return false;
  if (workContentType !== 'preregistration') return false;
  return (entry.content as FeedCommentContent).comment?.commentType === 'AUTHOR_UPDATE';
}

function resolveCommentWorkTab(
  entry: FeedEntry,
  comment: FeedCommentContent | null,
  workContentType?: ContentType
): CommentWorkTab {
  if (comment?.comment?.commentType === 'REVIEW') return 'reviews';
  if (entry.contentType === 'BOUNTY' || (comment?.bounties?.length ?? 0) > 0) return 'bounties';
  if (shouldLinkToUpdatesTab(entry, workContentType)) return 'updates';
  if (entry.contentType === 'COMMENT') return 'conversation';
  return undefined;
}

function resolveRelatedWorkTab(entry: FeedEntry, workContentType?: ContentType): CommentWorkTab {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const funding = entry.content as FeedFundingActivityContent;
    return funding.sourceType === 'BOUNTY_PAYOUT' ? 'bounties' : 'reviews';
  }
  if (entry.contentType === 'COMMENT') {
    return resolveCommentWorkTab(entry, entry.content as FeedCommentContent, workContentType);
  }
  if (entry.contentType === 'BOUNTY') return 'bounties';
  return undefined;
}

function getRelatedWorkMeta(entry: FeedEntry): ActivityEntryMeta | null {
  const related = entry.relatedWork;
  if (!related?.title) return null;

  const tab = resolveRelatedWorkTab(entry, related.contentType);

  return {
    title: related.title,
    author: entry.content.createdBy,
    href: buildWorkUrl({
      id: related.id,
      slug: related.slug,
      contentType: related.contentType,
      tab,
    }),
  };
}

export function getEntryMeta(entry: FeedEntry): ActivityEntryMeta {
  const relatedMeta = getRelatedWorkMeta(entry);
  if (relatedMeta) return relatedMeta;

  const content = entry.content;
  const author = content.createdBy;

  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    const work = entry.relatedWork;
    const comment = entry.contentType === 'COMMENT' ? (content as FeedCommentContent) : null;
    const tab = resolveCommentWorkTab(entry, comment, work?.contentType);
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

export type ActivityActionIconName =
  | 'coins'
  | 'fund'
  | 'earn'
  | 'proposal'
  | 'bell'
  | 'message'
  | null;

export function getActionIcon(entry: FeedEntry): ActivityActionIconName {
  if (isGrantOpened(entry)) {
    return 'fund';
  }
  if (entry.activityAction === 'bounty_opened') {
    return 'earn';
  }
  if (isProposalSubmission(entry)) {
    return null;
  }
  if (
    entry.contentType === 'USDFUNDRAISECONTRIBUTION' ||
    entry.contentType === 'PURCHASE' ||
    entry.contentType === 'FUNDINGACTIVITY'
  ) {
    return 'coins';
  }
  if (entry.contentType === 'FUNDRAISE' || entry.activityAction === 'proposal_fully_funded') {
    return 'fund';
  }
  if (entry.contentType === 'BOUNTY') return 'coins';
  if (entry.contentType !== 'COMMENT') return null;

  const commentContent = entry.content as FeedCommentContent;
  if ((commentContent.bounties?.length ?? 0) > 0) return 'coins';

  const commentType = commentContent.comment?.commentType;
  if (commentType === 'AUTHOR_UPDATE') return 'bell';
  if (commentType === 'GENERIC_COMMENT' || commentType === 'ANSWER') return 'message';
  return null;
}

export function getReviewScore(entry: FeedEntry): number | undefined {
  if (entry.contentType === 'FUNDINGACTIVITY') return undefined;
  if (entry.contentType !== 'COMMENT') return undefined;
  const commentContent = entry.content as FeedCommentContent;
  if (commentContent.comment?.commentType !== 'REVIEW') return undefined;
  if (getReviewEarning(entry)) return undefined;
  return commentContent.review?.score ?? commentContent.comment.reviewScore;
}

/** Bounty payout shown on the header line for awarded peer reviews. */
export function getReviewEarning(entry: FeedEntry): CurrencyAmount | undefined {
  if (entry.contentType !== 'COMMENT') return undefined;
  const commentContent = entry.content as FeedCommentContent;
  if (commentContent.comment?.commentType !== 'REVIEW') return undefined;

  const awarded = entry.awardedBountyAmount;
  if (awarded == null || awarded <= 0) return undefined;

  return { amount: awarded, currency: 'RSC' };
}

export function getContribution(entry: FeedEntry): CurrencyAmount | undefined {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const funding = entry.content as FeedFundingActivityContent;
    if (funding.totalUsdCents > 0) {
      return { amount: funding.totalUsd, currency: 'USD' };
    }
    return { amount: funding.totalAmount, currency: 'RSC' };
  }
  if (entry.contentType !== 'USDFUNDRAISECONTRIBUTION' && entry.contentType !== 'PURCHASE') {
    return undefined;
  }
  const post = entry.content as FeedPostContent;
  const contribution = post.fundraiseContribution;
  if (contribution?.amount == null) return undefined;
  return { amount: contribution.amount, currency: contribution.currency };
}

export interface ActivityGrantAmount {
  usd: number;
  rsc: number;
}

export function getGrantAmount(entry: FeedEntry): ActivityGrantAmount | undefined {
  if (entry.contentType !== 'GRANT') return undefined;
  const grant = (entry.content as FeedGrantContent).grant;
  if (!grant?.amount) return undefined;
  return grant.amount;
}

export interface ActivityCommentPreview {
  content: CommentContent;
  format: ContentFormat;
  isReview: boolean;
}

export function getCommentPreview(entry: FeedEntry): ActivityCommentPreview | null {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const peerReview = (entry.content as FeedFundingActivityContent).peerReview;
    if (!peerReview?.content) return null;
    return {
      content: peerReview.content,
      format: peerReview.contentFormat,
      isReview: peerReview.isReview,
    };
  }

  if (entry.contentType !== 'COMMENT') return null;
  const { comment } = entry.content as FeedCommentContent;
  if (!comment?.content) return null;
  return {
    content: comment.content,
    format: comment.contentFormat,
    isReview: comment.commentType === 'REVIEW',
  };
}

/**
 * The amount or score that rides on an action line. Each kind keeps its own
 * renderer, since bounties and grants convert currency differently.
 */
export type ActivityActionValue =
  | { kind: 'contribution'; amount: CurrencyAmount }
  | { kind: 'grant'; amount: ActivityGrantAmount }
  | { kind: 'bounty'; bounty: Bounty }
  | { kind: 'score'; score: number };

/**
 * What happened, phrased without the actor (whose name heads the card) and naming
 * what was acted on, so a first-time reader can tell a proposal from an RFP.
 */
export interface ActivityActionLine {
  /** "Funded a proposal", "Peer reviewed a proposal", "Earned". */
  label: string;
  /** Someone the action was aimed at, e.g. the reviewer a funder tipped. */
  target?: AuthorProfile;
  value?: ActivityActionValue;
  /** Words after the value: "for a peer review". */
  trailing?: string;
}

const WORK_NOUNS: Record<ContentType, string> = {
  preregistration: 'a proposal',
  funding_request: 'an RFP',
  paper: 'a paper',
  question: 'a question',
  discussion: 'a post',
  post: 'a post',
};

/** "a proposal", "an RFP"; registered reports only differ from posts by their post type. */
export function getWorkNoun(work?: { documentType: ContentType; postType?: string }): string {
  if (!work) return 'a post';
  if (work.postType === 'REGISTERED_REPORT') return 'a registered report';
  return WORK_NOUNS[work.documentType] ?? 'a post';
}

function contributionValue(amount?: CurrencyAmount): ActivityActionValue | undefined {
  return amount ? { kind: 'contribution', amount } : undefined;
}

function getFundingActivityActionLine(content: FeedFundingActivityContent): ActivityActionLine {
  const value = contributionValue(
    content.totalUsdCents > 0
      ? { amount: content.totalUsd, currency: 'USD' }
      : { amount: content.totalAmount, currency: 'RSC' }
  );
  const recipient = content.recipient;

  if (
    recipient &&
    (content.sourceType === 'BOUNTY_PAYOUT' || isFoundationProfile(content.createdBy))
  ) {
    return { label: 'Earned', value, trailing: 'for a peer review' };
  }
  if (content.sourceType === 'BOUNTY_PAYOUT') {
    return { label: 'Awarded a bounty', value };
  }
  if (!recipient) {
    return { label: 'Tipped a peer review', value };
  }
  return { label: 'Tipped', target: recipient, value, trailing: 'for a peer review' };
}

function getCommentActionLine(entry: FeedEntry, noun: string): ActivityActionLine {
  const commentContent = entry.content as FeedCommentContent;
  const bounty = commentContent.bounties?.[0];
  if (bounty) {
    return {
      label: bounty.bountyType === 'REVIEW' ? 'Opened a peer review bounty' : 'Opened a bounty',
      value: { kind: 'bounty', bounty },
    };
  }

  switch (commentContent.comment?.commentType) {
    case 'REVIEW': {
      const earning = getReviewEarning(entry);
      if (earning) {
        return {
          label: 'Earned',
          value: contributionValue(earning),
          trailing: 'for a peer review',
        };
      }
      const score = getReviewScore(entry);
      return {
        label: `Peer reviewed ${noun}`,
        value: score ? { kind: 'score', score } : undefined,
      };
    }
    case 'AUTHOR_UPDATE':
      return { label: 'Posted an update on their research' };
    case 'ANSWER':
      return { label: 'Answered a question' };
    default: {
      const parent = commentContent.parentComment;
      if (parent) {
        return {
          label:
            parent.commentType === 'REVIEW' ? 'Replied to a peer review' : 'Replied to a comment',
        };
      }
      return { label: `Commented on ${noun}` };
    }
  }
}

/**
 * The action line for a card. `work` supplies the noun ("a proposal", "an RFP"),
 * so it should be the work the card shows.
 */
export function getActivityActionLine(
  entry: FeedEntry,
  work?: { documentType: ContentType; postType?: string }
): ActivityActionLine {
  const noun = getWorkNoun(work);

  if (entry.contentType === 'FUNDINGACTIVITY') {
    return getFundingActivityActionLine(entry.content as FeedFundingActivityContent);
  }
  if (entry.contentType === 'COMMENT') {
    return getCommentActionLine(entry, noun);
  }
  if (entry.contentType === 'BOUNTY') {
    const bounty = (entry.content as FeedBountyContent).bounty;
    if (entry.activityAction === 'bounty_opened' && bounty) {
      return {
        label: bounty.bountyType === 'REVIEW' ? 'Opened a peer review bounty' : 'Opened a bounty',
        value: { kind: 'bounty', bounty },
      };
    }
    return { label: 'Contributed to a bounty' };
  }
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    return {
      label: isFundingPoolContribution(entry)
        ? 'Added to an RFP’s funding pool'
        : 'Funded a proposal',
      value: contributionValue(getContribution(entry)),
    };
  }
  if (entry.contentType === 'FUNDRAISE' || entry.activityAction === 'proposal_fully_funded') {
    return { label: 'Fully funded a proposal' };
  }
  if (entry.contentType === 'GRANT') {
    const amount = getGrantAmount(entry);
    return { label: 'Opened an RFP', value: amount ? { kind: 'grant', amount } : undefined };
  }
  if (entry.contentType === 'PREREGISTRATION') {
    return { label: 'Submitted a proposal for funding' };
  }
  if (entry.contentType === 'PAPER') {
    return { label: 'Published a preprint' };
  }
  const postType = (entry.content as FeedPostContent).postType ?? entry.relatedWork?.postType;
  if (entry.contentType === 'POST' && postType === 'REGISTERED_REPORT') {
    return { label: 'Published a registered report' };
  }
  if (entry.contentType === 'POST') {
    return { label: 'Posted a discussion' };
  }
  return { label: `Contributed to ${noun}` };
}

/** Plain text of a TipTap node and its children. */
function nodeText(node: TipTapNode | TipTapTextNode): string {
  if ('content' in node && node.content) return node.content.map(nodeText).join('');
  return node.text ?? '';
}

/** "Overall impact", "1. Overall assessment (3.0/5.0)", "OVERALL IMPACT (4/5)". */
const VERDICT_HEADING = /^\s*(\d+[.)]\s*)?overall\b/i;

/** TipTap arrives either as an object or as the JSON string the API stores. */
function parseTipTap(content: CommentContent): Exclude<CommentContent, string> | null {
  if (typeof content !== 'string') return content ?? null;
  try {
    const parsed: unknown = JSON.parse(content);
    return parsed && typeof parsed === 'object'
      ? (parsed as Exclude<CommentContent, string>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Reviews open with the reviewer's credentials, conflicts and AI disclosure; the
 * verdict comes after. When a review has an "Overall …" section, the preview starts
 * there. Anything else (Quill, no such section) is returned untouched.
 */
export function toReviewVerdictPreview(content: CommentContent): CommentContent {
  const doc = parseTipTap(content);
  if (!doc) return content;

  if (!Array.isArray(doc.content)) {
    // Some payloads wrap the document one level down.
    const nested = doc.content as unknown;
    if (nested && typeof nested === 'object') {
      const inner = toReviewVerdictPreview(nested as CommentContent);
      return inner === nested ? content : ({ content: inner } as CommentContent);
    }
    return content;
  }

  const nodes = doc.content as TipTapNode[];
  const start = nodes.findIndex((node) => VERDICT_HEADING.test(nodeText(node)));
  if (start <= 0) return content;
  return { ...doc, content: nodes.slice(start) } as CommentContent;
}

export type ActivityCommentKind = 'review' | 'comment' | 'update' | 'answer';

/** A comment an activity quotes, such as the one a reply answers. */
export interface ActivityQuotedComment {
  author: AuthorProfile;
  content: CommentContent;
  format: ContentFormat;
  kind: ActivityCommentKind;
}

/** Someone's words an activity is about, with what the side panel needs to show them. */
export interface ActivityComment extends ActivityQuotedComment {
  /** Missing for a quoted parent, which the feed sends without a date. */
  createdDate?: string;
  score?: number;
  /** The comment this one replies to. */
  parent?: ActivityQuotedComment;
}

function toCommentKind(commentType?: string): ActivityCommentKind {
  switch (commentType) {
    case 'REVIEW':
      return 'review';
    case 'AUTHOR_UPDATE':
      return 'update';
    case 'ANSWER':
      return 'answer';
    default:
      return 'comment';
  }
}

function toQuotedParent(parent?: ParentCommentPreview): ActivityQuotedComment | undefined {
  if (!parent?.content || !parent.createdBy) return undefined;
  return {
    author: parent.createdBy,
    content: parent.content,
    format: parent.contentFormat ?? 'TIPTAP',
    kind: toCommentKind(parent.commentType),
  };
}

/**
 * The words behind a comment or review entry, or behind a payout for a review.
 * Null for everything else, and for entries that arrive without the text.
 */
export function getActivityComment(entry: FeedEntry): ActivityComment | null {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const funding = entry.content as FeedFundingActivityContent;
    const review = funding.peerReview;
    const author = review?.author ?? funding.recipient;
    if (!review?.content || !review.isReview || !author) return null;
    return {
      author,
      content: review.content,
      format: review.contentFormat,
      kind: 'review',
      createdDate: review.createdDate ?? entry.timestamp,
    };
  }

  if (entry.contentType !== 'COMMENT') return null;
  const commentContent = entry.content as FeedCommentContent;
  const { comment } = commentContent;
  if (!comment?.content) return null;
  const kind = toCommentKind(comment.commentType);
  const score = commentContent.review?.score ?? comment.reviewScore;
  return {
    author: commentContent.createdBy,
    content: comment.content,
    format: comment.contentFormat,
    kind,
    score: kind === 'review' && score && score > 0 ? score : undefined,
    createdDate: entry.timestamp,
    parent: toQuotedParent(commentContent.parentComment),
  };
}

/** The peer review behind an entry: a review itself, or a payout for one. */
export function getActivityReview(entry: FeedEntry): ActivityComment | null {
  const comment = getActivityComment(entry);
  return comment?.kind === 'review' ? comment : null;
}

/** Text nodes that sit inline; everything else is a block that needs a gap after it. */
const INLINE_PARENTS = new Set(['paragraph', 'heading', 'text']);

/** Plain text of a TipTap tree, with a space between blocks so they don't run together. */
function blockText(node: TipTapNode | TipTapTextNode): string {
  if (!('content' in node) || !node.content) return node.text ?? '';
  const separator = INLINE_PARENTS.has(node.type) ? '' : ' ';
  return node.content.map(blockText).join(separator);
}

/**
 * A comment flattened to one line of plain text, for quoting. Reviews start at
 * their verdict, as their previews do.
 */
export function getCommentExcerpt(comment: ActivityQuotedComment): string {
  const content =
    comment.kind === 'review' ? toReviewVerdictPreview(comment.content) : comment.content;
  const parsed = parseContent(content, comment.format);
  if (!parsed) return '';
  const text = Array.isArray(parsed.ops)
    ? parsed.ops
        .map((op: { insert?: unknown }) => (typeof op.insert === 'string' ? op.insert : ''))
        .join('')
    : blockText(parsed);
  return text.replace(/\s+/g, ' ').trim();
}
