import { buildWorkUrl, extractFirstUrl, stripUrls, type DetectedUrl } from '@/utils/url';
import type { Comment } from '@/types/comment';
import type { FeedEntry, FeedCommentContent } from '@/types/feed';
import { extractTextFromTipTap, parseContent } from './commentContentUtils';

/**
 * View-model for a single embedded "author post" card. Document-agnostic on
 * purpose: the card surfaces an author, an embed, and an optional reference
 * to the work the post belongs to. `onEdit` is supplied by whichever section
 * owns the composer for this surface (so the card never needs to know how to
 * edit a comment — only that it can).
 */
export interface PostCardData {
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
  embed: DetectedUrl;
  /**
   * Pointer to the source document for this post. Always provided when
   * available; the card decides whether to render it via `showRelatedWork`.
   */
  relatedWork?: { title: string; href: string };
  /** When provided, the card shows a 3-dots menu with an Edit action. */
  onEdit?: () => void;
}

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
 * embeddable URL aren't shown as post cards — the card UI is built around
 * the embed, not the text.
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
 * Maps a domain `Comment` into a `PostCardData`. Returns `null` when the
 * comment has no embeddable URL (we don't render text-only post cards).
 */
export const commentToPostCard = (
  comment: Comment,
  options: CommentToPostCardOptions = {}
): PostCardData | null => {
  const embed = extractEmbedFromComment(comment);
  if (!embed) return null;

  const createdBy = comment.createdBy;
  const authorProfile = createdBy?.authorProfile;
  const fullName =
    authorProfile?.fullName ||
    `${createdBy?.firstName ?? ''} ${createdBy?.lastName ?? ''}`.trim() ||
    undefined;

  return {
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
 * Builds a `PostCardData` from a feed entry. Returns `null` for entries that
 * aren't `AUTHOR_UPDATE` comments or that lack an embeddable URL. Always
 * populates `relatedWork` when the feed entry exposes one — surfaces decide
 * whether to render it via `showRelatedWork` on the card.
 */
export const feedEntryToPostCard = (entry: FeedEntry): PostCardData | null => {
  if (entry.contentType !== 'COMMENT') return null;
  const content = entry.content as FeedCommentContent;
  if (content.comment?.commentType !== 'AUTHOR_UPDATE') return null;

  const rawContent = content.comment.content;
  const text = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent ?? '');
  const embed = extractFirstUrl(text);
  if (!embed) return null;

  // Reuse the same snippet pipeline as comments by funneling the feed
  // payload through a Comment-shaped object — keeps the truncation /
  // url-strip behavior identical across surfaces.
  const snippet = getCommentSnippet({
    content: rawContent,
    contentFormat: content.comment.contentFormat,
  } as Comment);

  const author = content.createdBy;
  const relatedWork = entry.relatedWork
    ? {
        title: entry.relatedWork.title,
        href: buildWorkUrl({
          id: entry.relatedWork.id,
          slug: entry.relatedWork.slug,
          contentType: entry.relatedWork.contentType,
          tab: 'updates',
        }),
      }
    : undefined;

  return {
    key: entry.id,
    author: {
      id: author?.user?.id,
      fullName: author?.fullName,
      profileImage: author?.profileImage,
      authorProfileId: author?.id,
    },
    createdDate: entry.timestamp,
    snippet,
    embed,
    relatedWork,
  };
};
