import { AuthorProfile } from './user';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL' | 'HTML';

export interface UserMention {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  authorProfileId: string | null;
}

export interface QuillOperation {
  insert: string | { user: UserMention };
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
  };
}

export interface QuillContent {
  ops: QuillOperation[];
}

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate: string;
  bountyType: string;
  createdBy: AuthorProfile;
  raw: any;
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
