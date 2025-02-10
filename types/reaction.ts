import { ID } from './root';
import { createTransformer } from './transformer';
import { ContentType, FlagReasonKey } from './work';

//TODO: Do we need to add more document types? are they still used?
export type DocumentType = 'paper' | 'researchhubpost'; // | 'thread' | 'comment' | 'reply' | 'rhcomment' | 'review';

// DOWNVOTE is not used in the current implementation
export enum VoteType {
  // DOWNVOTE = 2,
  NEUTRALVOTE = 0,
  UPVOTE = 1,
}

export type VoteTypeString = 'upvote' | 'neutralvote'; // | 'downvote'

export const VOTE_TYPE_LABELS: Record<VoteType, VoteTypeString> = {
  // [VoteType.DOWNVOTE]: 'downvote',
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
    // case VoteType.DOWNVOTE:
    //   return VOTE_TYPE_LABELS[VoteType.DOWNVOTE];
    case VoteType.NEUTRALVOTE:
      return VOTE_TYPE_LABELS[VoteType.NEUTRALVOTE];
    default:
      return undefined;
  }
}

interface UserVotes {
  papers: Record<string, Vote>;
  posts: Record<string, Vote>;
}

export const transformVotes = createTransformer<any, UserVotes>((raw) => {
  const votes: UserVotes = {
    papers: {},
    posts: {},
  };

  if (raw.paper) {
    Object.entries(raw.paper).forEach(([docId, vote]) => {
      votes.papers[docId] = transformVote(vote);
    });
  }

  if (raw.posts) {
    Object.entries(raw.posts).forEach(([docId, vote]) => {
      votes.posts[docId] = transformVote(vote);
    });
  }

  return votes;
});

export const getDocumentTypeFromWorkContentType = (workContentType: ContentType): DocumentType => {
  return workContentType === 'paper' ? 'paper' : 'researchhubpost';
};

export type Flag = {
  id: ID;
  createdDate: string;
  reason: FlagReasonKey;
  objectId: ID;
};

export const transformFlag = createTransformer<any, Flag>((raw) => ({
  id: raw.id,
  createdDate: raw.created_date,
  reason: raw.reason,
  objectId: raw.object_id,
}));
