import { buildWorkUrl, extractFirstUrl, stripUrls, type DetectedUrl } from '@/utils/url';
import type { Comment, ContentFormat } from '@/types/comment';
import type { FeedEntry, FeedCommentContent } from '@/types/feed';
import { extractTextFromTipTap, parseContent } from './commentContentUtils';

interface PostCardBase {
  key: string | number;
  author: {
    id?: number;
    fullName?: string;
    profileImage?: string;
    authorProfileId?: number;
  };
  createdDate: string;
  snippet?: string;
  relatedWork?: { title: string; href: string };
}

export interface PostCardPost extends PostCardBase {
  kind: 'post';
  embed: DetectedUrl;
  onEdit?: () => void;
}

export interface PostCardReview extends PostCardBase {
  kind: 'review';
  score?: number;
  reviewContent: any;
  reviewContentFormat?: ContentFormat;
}

export type PostCardData = PostCardPost | PostCardReview;

const SNIPPET_MAX_LENGTH = 200;

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

export const extractEmbedFromComment = (comment: Comment): DetectedUrl | null => {
  const text =
    typeof comment.content === 'string' ? comment.content : JSON.stringify(comment.content);
  return extractFirstUrl(text);
};

interface CommentToPostCardOptions {
  onEdit?: () => void;
}

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
