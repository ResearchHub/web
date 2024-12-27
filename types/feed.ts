import { AuthorProfile } from './user';

export type Role = 'contributor' | 'author' | 'reviewer' | 'applicant';

export interface Participants {
  role: Role;
  profiles: AuthorProfile[];
}

export type FeedActionType = 'repost' | 'contribute' | 'publish' | 'post';

export type ContentType = 
  | 'paper'
  | 'comment'
  | 'funding_request'
  | 'bounty'
  | 'grant'
  | 'review'
  | 'contribution';

interface BaseContent {
  id: string;
  type: ContentType;
  timestamp: string;
  hub: {
    id: string;
    name: string;
    slug: string;
  };
  slug: string;
  title?: string;
  actor: AuthorProfile;
  participants?: Participants;
}

export interface Paper extends BaseContent {
  type: 'paper';
  abstract: string;
  doi?: string;
  journal?: string;
}

export interface Comment extends BaseContent {
  type: 'comment';
  content: string;
  parent?: Content;
}

export type FundingRequestStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

export interface FundingRequest extends BaseContent {
  type: 'funding_request';
  title: string;
  abstract: string;
  amount: number;
  deadline: string;
  goalAmount: number;
  status: FundingRequestStatus;
}

export interface Bounty extends BaseContent {
  type: 'bounty';
  title?: string;
  description: string;
  amount: number;
  deadline: string;
}

export interface Grant extends BaseContent {
  type: 'grant';
  title: string;
  abstract: string;
  amount: number;
  deadline: string;
}

export interface Review extends BaseContent {
  type: 'review';
  title?: string;
  content: string;
  score?: number;
}

export interface Contribution extends BaseContent {
  type: 'contribution';
  amount: number;
}

export type Content = 
  | Paper 
  | Comment 
  | FundingRequest 
  | Bounty 
  | Grant 
  | Review
  | Contribution;

export interface FeedEntry {
  id: string;
  timestamp: string;
  action: FeedActionType;
  content: Content;
  target?: Content;
  context?: Content;
  metrics?: {
    votes: number;
    comments: number;
    reposts: number;
    saves?: number;
    applicants?: number;
    reviewScore?: number;
    views?: number;
    earned?: number;
  };
}
