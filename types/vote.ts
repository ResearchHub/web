import { ID } from './root';
import { createTransformer } from './transformer';

export type DocumentType = 'paper' | 'researchhubpost' | 'hypothesis' | 'citationentry';

export enum VoteType {
  DOWNVOTE = 2,
  NEUTRALVOTE = 0,
  UPVOTE = 1,
}

export type VoteTypeString = 'upvote' | 'downvote' | 'neutralvote';

export const VOTE_TYPE_LABELS: Record<VoteType, VoteTypeString> = {
  [VoteType.DOWNVOTE]: 'downvote',
  [VoteType.NEUTRALVOTE]: 'neutralvote',
  [VoteType.UPVOTE]: 'upvote',
} as const;

export type Vote = {
  voteType?: VoteTypeString;
  id: ID;
  createdDate: string;
};

export const transformVote = createTransformer<any, Vote>((raw) => ({
  id: raw.id,
  voteType: transformVoteType(raw.vote_type),
  createdDate: raw.created_date,
}));

function transformVoteType(voteType: number | undefined): VoteTypeString | undefined {
  switch (voteType) {
    case VoteType.UPVOTE:
      return VOTE_TYPE_LABELS[VoteType.UPVOTE];
    case VoteType.DOWNVOTE:
      return VOTE_TYPE_LABELS[VoteType.DOWNVOTE];
    case VoteType.NEUTRALVOTE:
      return VOTE_TYPE_LABELS[VoteType.NEUTRALVOTE];
    default:
      return undefined;
  }
}
