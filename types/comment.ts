import { AuthorProfile, transformAuthorProfile } from './user';
import { BaseTransformer } from './transformer';
import { Bounty, transformBounty } from './bounty';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL' | 'HTML';
export type CommentType = 'GENERIC_COMMENT' | 'REVIEW' | 'ANSWER';

export interface UserMention {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  authorProfileId: string | null;
}

export interface QuillOperation {
  insert: string;
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
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
  content: string;
  contentFormat: ContentFormat;
  createdDate: string;
  updatedDate: string;
  author: AuthorProfile;
  score: number;
  replyCount: number;
  replies: Comment[];
  bounties: Bounty[];
  thread: Thread;
  isPublic: boolean;
  isRemoved: boolean;
  isAcceptedAnswer: boolean | null;
  raw: any;
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

export const transformComment: BaseTransformer<any, Comment> = (raw) => ({
  id: raw.id,
  content: transformContent(raw),
  contentFormat: raw.html ? 'HTML' : 'QUILL',
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  author: transformAuthorProfile(raw.created_by),
  score: raw.score || 0,
  replyCount: raw.children_count || 0,
  replies: (raw.children || []).map(transformComment),
  bounties: (raw.bounties || []).map(transformBounty),
  thread: transformThread(raw.thread),
  isPublic: raw.is_public,
  isRemoved: raw.is_removed,
  isAcceptedAnswer: raw.is_accepted_answer,
  raw,
});
