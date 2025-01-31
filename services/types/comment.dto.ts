import { createTransformer } from '@/types/transformer';

export enum COMMENT_TYPES {
  GENERIC_COMMENT = 'GENERIC_COMMENT',
  SUMMARY = 'SUMMARY',
  REVIEW = 'REVIEW',
  PEER_REVIEW = 'PEER_REVIEW',
  ANSWER = 'ANSWER',
  ANNOTATION = 'INNER_CONTENT_COMMENT',
  REPLICABILITY_COMMENT = 'REPLICABILITY_COMMENT',
}

export type RhDocumentType = 'hypothesis' | 'paper' | 'researchhubpost' | 'citationentry';

export type CommentPrivacyFilter = 'PUBLIC' | 'PRIVATE' | 'WORKSPACE';

export type CommentResponse = {
  id: string;
};

export interface CreateCommentInput {
  content: any;
  commentType?: COMMENT_TYPES;
  documentType: RhDocumentType;
  documentId: string;
  threadId?: string;
  bountyAmount?: number;
  privacy?: CommentPrivacyFilter;
  mentions?: string[];
  organizationId?: string;
  bountyType?: COMMENT_TYPES;
  targetHubs?: string[];
  expirationDate?: string;
}

export const transformCommentResponse = createTransformer<any, CommentResponse>((raw) => ({
  id: raw.id,
}));
