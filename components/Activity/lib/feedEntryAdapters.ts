import { buildWorkUrl } from '@/utils/url';
import type {
  FeedCommentContent,
  FeedContentType,
  FeedEntry,
  FeedFundingActivityContent,
  FeedGrantContent,
  FeedPaperContent,
  FeedPostContent,
} from '@/types/feed';
import type { AuthorProfile } from '@/types/authorProfile';
import type { CommentType, ContentFormat } from '@/types/comment';
import type { CommentContent } from '@/components/Comment/lib/types';
import type { ContentType } from '@/types/work';

const COMMENT_ACTION_LABELS: Record<CommentType, string> = {
  GENERIC_COMMENT: 'commented on',
  REVIEW: 'peer reviewed',
  AUTHOR_UPDATE: 'posted an update on',
  ANSWER: 'answered on',
  BOUNTY: 'contributed to',
};

const DOC_ACTION_LABELS: Partial<Record<FeedContentType, string>> = {
  GRANT: 'opened funding',
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

function isPeerReviewTipComment(commentType?: CommentType | string): boolean {
  return commentType === 'PEER_REVIEW' || commentType === 'REVIEW';
}

export interface ActivityHeaderTarget {
  author: AuthorProfile;
  suffix?: string;
}

export interface ActivityHeaderMessage {
  actor: AuthorProfile;
  verb: string;
  target?: ActivityHeaderTarget;
}

function getFundingActivityMessage(content: FeedFundingActivityContent): ActivityHeaderMessage {
  const actor = content.createdBy;

  if (content.sourceType === 'BOUNTY_PAYOUT') {
    const recipient = content.recipient;
    return {
      actor,
      verb: recipient ? 'awarded bounty to' : 'awarded bounty',
      target: recipient ? { author: recipient } : undefined,
    };
  }

  const tippedAuthor = content.tippedComment?.createdBy;
  const isPeerReviewTip = isPeerReviewTipComment(content.tippedComment?.commentType);
  if (!tippedAuthor) {
    return {
      actor,
      verb: isPeerReviewTip ? 'tipped review' : 'tipped comment',
    };
  }
  return {
    actor,
    verb: 'tipped',
    target: {
      author: tippedAuthor,
      suffix: isPeerReviewTip ? "'s review" : "'s comment",
    },
  };
}

function getDefaultActivityMessage(entry: FeedEntry): ActivityHeaderMessage {
  const actor = entry.content.createdBy;

  if (entry.contentType === 'COMMENT') {
    const commentContent = entry.content as FeedCommentContent;
    if (commentContent.bounties?.length) {
      return { actor, verb: 'opened a bounty on' };
    }
    return {
      actor,
      verb: COMMENT_ACTION_LABELS[commentContent.comment?.commentType] ?? 'commented on',
    };
  }

  if (entry.contentType === 'BOUNTY') {
    return { actor, verb: 'contributed to' };
  }

  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    return { actor, verb: 'funded proposal' };
  }

  return {
    actor,
    verb: DOC_ACTION_LABELS[entry.contentType] ?? 'contributed to',
  };
}

export function getActivityHeaderMessage(entry: FeedEntry): ActivityHeaderMessage {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    return getFundingActivityMessage(entry.content as FeedFundingActivityContent);
  }
  return getDefaultActivityMessage(entry);
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
  if (entry.contentType === 'BOUNTY' || (comment?.bounties?.length ?? 0) > 0) return 'bounties';
  if (entry.contentType === 'COMMENT') return 'conversation';
  return undefined;
}

function resolveRelatedWorkTab(entry: FeedEntry): CommentWorkTab {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const funding = entry.content as FeedFundingActivityContent;
    return funding.sourceType === 'BOUNTY_PAYOUT' ? 'bounties' : 'reviews';
  }
  if (entry.contentType === 'COMMENT') {
    return resolveCommentWorkTab(entry, entry.content as FeedCommentContent);
  }
  if (entry.contentType === 'BOUNTY') return 'bounties';
  return undefined;
}

function getRelatedWorkMeta(entry: FeedEntry): FeedEntryMeta | null {
  const related = entry.relatedWork;
  if (!related?.title) return null;

  const tab = resolveRelatedWorkTab(entry);

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

export function getEntryMeta(entry: FeedEntry): FeedEntryMeta {
  const relatedMeta = getRelatedWorkMeta(entry);
  if (relatedMeta) return relatedMeta;

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

export type FeedEntryIconName = 'coins' | 'fund' | 'earn' | 'bell' | 'message' | null;

export function getActionIcon(entry: FeedEntry): FeedEntryIconName {
  if (entry.contentType === 'GRANT' || entry.activityContext === 'grant_opened') {
    return 'fund';
  }
  if (entry.activityContext === 'bounty_opened') {
    return 'earn';
  }
  if (
    entry.contentType === 'USDFUNDRAISECONTRIBUTION' ||
    entry.contentType === 'PURCHASE' ||
    entry.contentType === 'FUNDINGACTIVITY'
  ) {
    return 'coins';
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
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const funding = entry.content as FeedFundingActivityContent;
    const tippedComment = funding.tippedComment;
    if (!isPeerReviewTipComment(tippedComment?.commentType)) return undefined;
    return tippedComment?.review?.score ?? tippedComment?.reviewScore;
  }
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

export interface FeedCommentPreview {
  content: CommentContent;
  format: ContentFormat;
  isReview: boolean;
}

export function getCommentPreview(entry: FeedEntry): FeedCommentPreview | null {
  if (entry.contentType === 'FUNDINGACTIVITY') {
    const funding = entry.content as FeedFundingActivityContent;
    const tippedComment = funding.tippedComment;
    if (!tippedComment?.content) return null;
    return {
      content: tippedComment.content,
      format: tippedComment.contentFormat,
      isReview: isPeerReviewTipComment(tippedComment.commentType),
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
