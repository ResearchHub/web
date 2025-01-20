import { AuthorProfile } from './user';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic } from './topic';
import { Hub } from './hub';

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
  hub: Hub;
  slug: string;
  title?: string;
  actor: AuthorProfile;
}

export interface Paper extends BaseContent {
  type: 'paper';
  abstract: string;
  doi?: string;
  journal?: Journal;
  authors: AuthorProfile[];
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
  status: 'OPEN' | 'CLOSED' | 'COMPLETED';
  amount: number;
  goalAmount: number;
  deadline: string;
  image?: string;
  preregistered?: boolean;
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

export type Content = Paper | Comment | FundingRequest | Bounty | Grant | Review | Contribution;

export interface FeedEntry {
  id: string;
  timestamp: string;
  action: FeedActionType;
  content: Content;
  target?: Content;
  context?: Content;
  contributors: Array<{
    profile: AuthorProfile;
    amount: number;
  }>;
  applicants?: AuthorProfile[];
  metrics?: ContentMetrics;
}
