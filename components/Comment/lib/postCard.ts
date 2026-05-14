import { buildWorkUrl, extractFirstUrl, stripUrls, type DetectedUrl } from '@/utils/url';
import type { Comment, ContentFormat } from '@/types/comment';
import type { FeedEntry, FeedCommentContent } from '@/types/feed';
import { extractTextFromTipTap, parseContent } from './commentContentUtils';

/**
 * Shared shape across every post-card variant. The `kind` discriminator on
 * `PostCardData` decides which extra fields are present (embed for posts,
 * review body + score for reviews, etc.).
 */
interface PostCardBase {
  /** Stable React key. Use the underlying comment id when available. */
  key: string | number;
  author: {
    id?: number;
    fullName?: string;
    profileImage?: string;
    /** Threaded through to <Avatar authorId={…} /> for tooltip + linking. */
    authorProfileId?: number;
  };
  createdDate: string;
  /** Plain-text excerpt with URLs stripped — already truncated. */
  snippet?: string;
  /**
   * Pointer to the source document. Always provided when available; the
   * card decides whether to render it via `showRelatedWork`.
   */
  relatedWork?: { title: string; href: string };
}

/**
 * "Author post" card: embeds a YouTube/TikTok/X/LinkedIn/webpage URL with
 * the author's note as context. Editable when `onEdit` is supplied.
 */
export interface PostCardPost extends PostCardBase {
  kind: 'post';
  embed: DetectedUrl;
  /** When provided, the card shows a 3-dots menu with an Edit action. */
  onEdit?: () => void;
}

/**
 * "Peer review" card: surfaces a reviewer + score, and lets the viewer
 * pop open the full review body via `PeerReviewModal`.
 */
export interface PostCardReview extends PostCardBase {
  kind: 'review';
  score?: number;
  /** Raw review body + format, passed straight to PeerReviewModal. */
  reviewContent: any;
  reviewContentFormat?: ContentFormat;
}

/**
 * Discriminated union of every card variant the AuthorPostsCarousel can
 * render. Add a new `kind` here when introducing a new variant; the card
 * dispatcher will exhaustively check against it.
 */
export type PostCardData = PostCardPost | PostCardReview;

const SNIPPET_MAX_LENGTH = 200;

/**
 * Reads a comment's TipTap/Quill body and returns a short plain-text excerpt
 * with URLs stripped (URLs render via the embed, so duplicating them in the
 * snippet just adds noise).
 */
export const getCommentSnippet = (comment: Comment, maxLength = SNIPPET_MAX_LENGTH): string => {
  try {
    const parsed = parseContent(comment.content, comment.contentFormat);
    const text = extractTextFromTipTap(parsed);
    const cleaned = stripUrls(text).replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.slice(0, maxLength).trimEnd() + '…';
  } catch {
    return '';
  }
};

/**
 * Pulls the first embeddable URL out of a comment body. Comments without an
 * embeddable URL aren't shown as "post" cards — the post card UI is built
 * around the embed, not the text.
 */
export const extractEmbedFromComment = (comment: Comment): DetectedUrl | null => {
  const text =
    typeof comment.content === 'string' ? comment.content : JSON.stringify(comment.content);
  return extractFirstUrl(text);
};

interface CommentToPostCardOptions {
  onEdit?: () => void;
}

/**
 * Maps a domain `Comment` into a `PostCardPost`. Returns `null` when the
 * comment has no embeddable URL (we don't render text-only post cards on
 * the proposal-page surface).
 */
export const commentToPostCard = (
  comment: Comment,
  options: CommentToPostCardOptions = {}
): PostCardPost | null => {
  const embed = extractEmbedFromComment(comment);
  if (!embed) return null;

  const createdBy = comment.createdBy;
  const authorProfile = createdBy?.authorProfile;
  const fullName =
    authorProfile?.fullName ||
    `${createdBy?.firstName ?? ''} ${createdBy?.lastName ?? ''}`.trim() ||
    undefined;

  return {
    kind: 'post',
    key: comment.id,
    author: {
      id: createdBy?.id,
      fullName,
      profileImage: authorProfile?.profileImage,
      authorProfileId: authorProfile?.id,
    },
    createdDate: comment.createdDate,
    snippet: getCommentSnippet(comment),
    embed,
    onEdit: options.onEdit,
  };
};

/**
 * Builds a `PostCardData` from a feed entry. Emits:
 *  - `kind: 'post'` for AUTHOR_UPDATE comments that contain an embeddable URL.
 *  - `kind: 'review'` for REVIEW comments (no embed requirement — reviews
 *    are surfaced via a different card variant that opens the full review
 *    body in a modal).
 *
 * Returns `null` for any other content type, and for AUTHOR_UPDATE comments
 * that lack an embed (the post card UI requires one).
 */
export const feedEntryToPostCard = (entry: FeedEntry): PostCardData | null => {
  if (entry.contentType !== 'COMMENT') return null;
  const content = entry.content as FeedCommentContent;
  const commentType = content.comment?.commentType;
  if (commentType !== 'AUTHOR_UPDATE' && commentType !== 'REVIEW') return null;

  const author = content.createdBy;
  const baseAuthor = {
    id: author?.user?.id,
    fullName: author?.fullName,
    profileImage: author?.profileImage,
    authorProfileId: author?.id,
  };

  const relatedWork = entry.relatedWork
    ? {
        title: entry.relatedWork.title,
        href: buildWorkUrl({
          id: entry.relatedWork.id,
          slug: entry.relatedWork.slug,
          contentType: entry.relatedWork.contentType,
          tab: commentType === 'REVIEW' ? 'reviews' : 'updates',
        }),
      }
    : undefined;

  const rawContent = content.comment.content;
  const contentFormat = content.comment.contentFormat;

  // Reuse the same snippet pipeline as comments by funneling the feed
  // payload through a Comment-shaped object — keeps the truncation /
  // url-strip behavior identical across surfaces.
  const snippet = getCommentSnippet({
    content: rawContent,
    contentFormat,
  } as Comment);

  if (commentType === 'REVIEW') {
    return {
      kind: 'review',
      key: entry.id,
      author: baseAuthor,
      createdDate: entry.timestamp,
      snippet,
      relatedWork,
      score: content.review?.score ?? content.comment.reviewScore,
      reviewContent: rawContent,
      reviewContentFormat: contentFormat,
    };
  }

  // AUTHOR_UPDATE — requires an embeddable URL.
  const text = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent ?? '');
  const embed = extractFirstUrl(text);
  if (!embed) return null;

  return {
    kind: 'post',
    key: entry.id,
    author: baseAuthor,
    createdDate: entry.timestamp,
    snippet,
    relatedWork,
    embed,
  };
};
