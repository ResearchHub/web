import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { BaseTransformer } from './transformer';
import { Bounty, transformBounty, groupBountiesWithContributions } from './bounty';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP' | 'CREATED_DATE';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL_EDITOR' | 'TIPTAP';
export type CommentType = 'GENERIC_COMMENT' | 'REVIEW' | 'BOUNTY' | 'ANSWER';

export type UserVoteType = 'UPVOTE' | 'NEUTRAL' | 'DOWNVOTE';

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

  // Add debugging for comment type
  console.log('transformComment raw data:', {
    id: raw.id,
    comment_type: raw.comment_type,
    has_bounties: !!raw.bounties && Array.isArray(raw.bounties) && raw.bounties.length > 0,
  });

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

  console.log('transformComment result:', {
    id: result.id,
    commentType: result.commentType,
    hasBounties: result.bounties.length > 0,
  });

  return result;
};
