import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { BaseTransformer } from './transformer';
import { Bounty, transformBounty } from './bounty';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP' | 'CREATED_DATE';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL_EDITOR' | 'TIPTAP';
export type CommentType = 'GENERIC_COMMENT' | 'REVIEW' | 'BOUNTY';

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
  commentType: CommentType;
  bountyAmount?: number;
  expirationDate?: string;
  isPublic?: boolean;
  isRemoved?: boolean;
  parentId?: number | null;
  raw: any;
  bounties: Bounty[];
  thread: Thread;
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
  return {
    id: raw.id,
    content: raw.comment_content_json || raw.comment_content,
    contentFormat: raw.comment_content_type,
    createdDate: raw.created_date,
    updatedDate: raw.updated_date,
    author: transformAuthorProfile(raw.created_by),
    score: raw.score || 0,
    replyCount: raw.reply_count || 0,
    replies: (raw.replies || []).map(transformComment),
    commentType: raw.comment_type || 'GENERIC_COMMENT',
    bountyAmount: raw.amount,
    expirationDate: raw.expiration_date,
    isPublic: raw.is_public,
    isRemoved: raw.is_removed,
    parentId: raw.parent?.id || raw.parent_id,
    bounties: (raw.bounties || []).map(transformBounty),
    thread: transformThread(raw.thread),
    raw,
  };
};
