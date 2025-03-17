import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { BaseTransformer } from './transformer';
import { Bounty, transformBounty, groupBountiesWithContributions } from './bounty';
import { UserVoteType } from './reaction';
import { FeedEntry, FeedCommentContent, FeedBountyContent } from './feed';
import { ContentType } from './work';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP' | 'CREATED_DATE';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL_EDITOR' | 'TIPTAP';
export type CommentType = 'GENERIC_COMMENT' | 'REVIEW' | 'BOUNTY' | 'ANSWER';

export interface UserMention {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  authorProfileId: string | null;
}

export interface QuillOperation {
  insert: string | { user?: UserMention };
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    link?: string;
    code?: boolean;
  };
}

export interface QuillContent {
  ops: QuillOperation[];
}

export interface Thread {
  id: number;
  threadType: string;
  privacyType: CommentPrivacyType;
  objectId: number;
  raw: any;
}

export interface Comment {
  id: number;
  content: any;
  contentFormat?: ContentFormat;
  createdDate: string;
  updatedDate: string;
  author: any;
  score: number;
  replies: Comment[];
  replyCount?: number;
  childrenCount: number;
  commentType: CommentType;
  bountyAmount?: number;
  awardedBountyAmount?: number;
  expirationDate?: string;
  isPublic?: boolean;
  isRemoved?: boolean;
  parentId?: number | null;
  raw: any;
  bounties: Bounty[];
  thread: Thread;
  userVote?: UserVoteType;
  metadata?: {
    isVoteUpdate?: boolean;
    [key: string]: any;
  };
}

export const transformThread: BaseTransformer<any, Thread> = (raw) => ({
  id: raw.id,
  threadType: raw.thread_type,
  privacyType: raw.privacy_type,
  objectId: raw.object_id,
  raw,
});

export const transformContent = (raw: any): string => {
  if (raw.html) {
    return raw.html;
  }
  return raw.comment_content_json || '';
};

export const transformComment = (raw: any): Comment => {
  const reviewScore = raw.review?.score;
  // Transform user_vote from API
  // It can be either an object with vote_type or a direct numeric value
  let userVote: UserVoteType | undefined;

  if (raw.user_vote) {
    // If user_vote is an object with vote_type property
    if (typeof raw.user_vote === 'object' && raw.user_vote.vote_type !== undefined) {
      const voteType = raw.user_vote.vote_type;
      if (voteType === 1) {
        userVote = 'UPVOTE';
      } else if (voteType === -1) {
        userVote = 'DOWNVOTE';
      } else if (voteType === 0) {
        userVote = 'NEUTRAL';
      }
    }
    // If user_vote is a direct numeric value (for backward compatibility)
    else if (typeof raw.user_vote === 'number') {
      if (raw.user_vote === 1) {
        userVote = 'UPVOTE';
      } else if (raw.user_vote === -1) {
        userVote = 'DOWNVOTE';
      } else if (raw.user_vote === 0) {
        userVote = 'NEUTRAL';
      }
    }
  }

  // Group bounties with their contributions
  const bounties = groupBountiesWithContributions(raw.bounties || []);

  // Determine the comment type - if it has bounties, it should be a BOUNTY type
  const commentType = raw.comment_type || (bounties.length > 0 ? 'BOUNTY' : 'GENERIC_COMMENT');

  const result = {
    id: raw.id,
    content: raw.comment_content_json || raw.comment_content,
    contentFormat: raw.comment_content_type,
    createdDate: raw.created_date,
    updatedDate: raw.updated_date,
    author: transformAuthorProfile(raw.created_by),
    score: reviewScore !== undefined ? reviewScore : raw.score || 0,
    replyCount: raw.reply_count || raw.children_count || 0,
    childrenCount: raw.children_count || 0,
    replies: (raw.replies || raw.children || []).map(transformComment),
    commentType,
    bountyAmount: raw.amount,
    awardedBountyAmount: raw.awarded_bounty_amount,
    expirationDate: raw.expiration_date,
    isPublic: raw.is_public,
    isRemoved: raw.is_removed,
    parentId: raw.parent?.id || raw.parent_id,
    bounties,
    thread: transformThread(raw.thread),
    userVote,
    raw,
    metadata: raw.metadata,
  };

  return result;
};

export const transformCommentToCommentFeedEntry = (comment: Comment): FeedEntry => {
  // Create a FeedCommentContent object
  const commentContent: FeedCommentContent = {
    id: comment.id,
    contentType: 'COMMENT',
    createdDate: comment.createdDate,
    comment: comment,
    createdBy: comment.author,
  };

  // Create and return a FeedEntry
  return {
    id: `comment-${comment.id}`,
    timestamp: comment.createdDate,
    action: 'contribute',
    content: commentContent,
    contentType: 'COMMENT',
    metrics: {
      votes: comment.score || 0,
      comments: comment.childrenCount || 0,
      saves: 0,
    },
    userVote: comment.userVote,
  };
};

export const transformCommentToBountyFeedEntry = (comment: Comment): FeedEntry => {
  if (!comment.bounties || comment.bounties.length === 0) {
    throw new Error('Comment does not have any bounties');
  }

  // Get the first bounty (typically there's only one)
  const bounty = comment.bounties[0];

  // Determine the related document content type
  const relatedDocumentContentType: ContentType =
    comment.thread?.threadType === 'PAPER' ? 'paper' : 'post';

  // Create a FeedBountyContent object
  const bountyContent: FeedBountyContent = {
    id: comment.id,
    contentType: 'BOUNTY',
    createdDate: comment.createdDate,
    bounty: bounty,
    createdBy: comment.author,
    relatedDocumentId: comment.thread?.objectId,
    relatedDocumentContentType: relatedDocumentContentType,
    comment: {
      content: comment.content,
      contentFormat: comment.contentFormat || 'TIPTAP',
      commentType: comment.commentType,
      id: comment.id,
    },
  };

  // Create and return a FeedEntry
  return {
    id: `bounty-${comment.id}`,
    timestamp: comment.createdDate,
    action: 'open',
    content: bountyContent,
    contentType: 'BOUNTY',
    metrics: {
      votes: comment.score || 0,
      comments: comment.childrenCount || 0,
      saves: 0,
    },
    userVote: comment.userVote,
  };
};
