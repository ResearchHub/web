import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { BaseTransformer } from './transformer';
import { Bounty, transformBounty, groupBountiesWithContributions } from './bounty';
import { UserVoteType } from './reaction';
import { transformUser, User } from './user';
import { Tip, transformTip } from './tip';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW' | 'AUTHOR_UPDATE';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP' | 'CREATED_DATE';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL_EDITOR' | 'TIPTAP';
export type CommentType = 'GENERIC_COMMENT' | 'REVIEW' | 'BOUNTY' | 'ANSWER' | 'AUTHOR_UPDATE';

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

export interface AwardedBountySolution {
  id: number;
  awardedAmount: number;
  awardedBy?: User;
  isFoundationAwarded: boolean;
}

export interface Comment {
  id: number;
  content: any;
  contentFormat?: ContentFormat;
  createdDate: string;
  updatedDate: string;
  createdBy: User;
  score: number;
  reviewScore: number;
  replies: Comment[];
  replyCount?: number;
  childrenCount: number;
  commentType: CommentType;
  bountyAmount?: number;
  awardedBountyAmount?: number;
  awardedBountySolution?: AwardedBountySolution;
  expirationDate?: string;
  isPublic?: boolean;
  isRemoved?: boolean;
  parentId?: number | null;
  raw: any;
  bounties: Bounty[];
  tips?: Tip[];
  thread: Thread;
  userVote?: UserVoteType;
  cachedAcademicScore?: number;
  scoreLastCalculated?: string;
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
  let userVote: UserVoteType | undefined;

  if (raw.user_vote) {
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

  const bounties = groupBountiesWithContributions(raw.bounties || []);
  const tips = (raw.purchases || []).map(transformTip);
  const commentType = raw.comment_type || (bounties.length > 0 ? 'BOUNTY' : 'GENERIC_COMMENT');

  const awardedBountySolution = raw.awarded_bounty_solution
    ? {
        id: raw.awarded_bounty_solution.id,
        awardedAmount: raw.awarded_bounty_solution.awarded_amount,
        awardedBy: raw.awarded_bounty_solution.awarded_by,
        isFoundationAwarded: raw.awarded_bounty_solution.is_foundation_awarded || false,
      }
    : undefined;

  const result = {
    id: raw.id,
    content: raw.comment_content_json || raw.comment_content,
    contentFormat: raw.comment_content_type,
    createdDate: raw.created_date,
    createdBy: transformUser(raw.created_by),
    updatedDate: raw.updated_date,
    author: transformAuthorProfile(raw.created_by),
    score: raw.score || 0,
    reviewScore: raw.review?.score || 0,
    replyCount: raw.reply_count || raw.children_count || 0,
    childrenCount: raw.children_count || 0,
    replies: (raw.replies || raw.children || []).map(transformComment),
    commentType,
    bountyAmount: raw.amount,
    awardedBountyAmount: raw.awarded_bounty_amount,
    awardedBountySolution,
    expirationDate: raw.expiration_date,
    isPublic: raw.is_public,
    isRemoved: raw.is_removed,
    parentId: raw.parent?.id || raw.parent_id,
    bounties,
    tips,
    thread: transformThread(raw.thread),
    userVote,
    cachedAcademicScore: raw.cached_academic_score,
    scoreLastCalculated: raw.score_last_calculated,
    raw,
    metadata: raw.metadata,
  };

  return result;
};
