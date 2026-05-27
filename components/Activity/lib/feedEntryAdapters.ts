import { buildWorkUrl } from '@/utils/url';
import type {
  FeedCommentContent,
  FeedContentType,
  FeedEntry,
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

export function getActionLabel(entry: FeedEntry): string {
  if (entry.contentType === 'COMMENT') {
    const commentContent = entry.content as FeedCommentContent;
    if (commentContent.hasBounties) return 'opened a bounty';
    return COMMENT_ACTION_LABELS[commentContent.comment?.commentType] ?? 'commented on';
  }
  if (entry.contentType === 'BOUNTY') return 'contributed to';
  if (entry.contentType === 'USDFUNDRAISECONTRIBUTION' || entry.contentType === 'PURCHASE') {
    return 'Funded Proposal';
  }
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

export type FeedEntryIconName = 'coins' | 'bell' | 'message' | null;

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

/**
 * Picks the right amount and currency to render for a contribution. Honors the
 * user's preference when an exchange rate is available, otherwise falls back to
 * the stored currency so we never multiply by a 0 rate. `formatCurrency` only
 * converts RSC → USD, so the reverse direction is computed here.
 */
export function resolveDisplayedContribution(
  contribution: FeedContribution,
  showUSD: boolean,
  exchangeRate: number
): DisplayedAmount {
  const sourceIsUSD = contribution.currency === 'USD';
  const canConvert = exchangeRate > 0;
  const inUSD = canConvert ? showUSD : sourceIsUSD;

  if (sourceIsUSD === inUSD) return { amount: contribution.amount, inUSD };
  if (sourceIsUSD) return { amount: contribution.amount / exchangeRate, inUSD };
  return { amount: contribution.amount * exchangeRate, inUSD };
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
  if (entry.contentType !== 'COMMENT') return null;
  const { comment } = entry.content as FeedCommentContent;
  if (!comment?.content) return null;
  return {
    content: comment.content,
    format: comment.contentFormat,
    isReview: comment.commentType === 'REVIEW',
  };
}
