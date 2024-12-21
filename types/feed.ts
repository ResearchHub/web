import { User } from "./user";
import { Hub } from "./hub";

export interface PaperAuthor {
  name: string;
  isVerified?: boolean;
  user?: User;
}

export type Metrics = {
  votes: number;
  comments: number;
  reposts: number;
  saves?: number;
  applicants?: number;
  reviewScore?: number;
  views?: number;
};

export type FeedActionType = 
  | 'post'
  | 'repost'
  | 'contribute'
  | 'publish';

export type ItemType = 
  | 'funding_request'
  | 'grant'
  | 'paper'
  | 'review'
  | 'bounty'
  | 'contribution'
  | 'comment';

export type BaseItem = {
  id: string;
  type: ItemType;
  title: string;
  abstract: string;
  user: User;
  timestamp: string;
  hub?: Hub;
  isPinned?: boolean;
  slug: string;
};

export type CommentItem = {
  id: string;
  type: 'comment';
  content: string;
  user: User;
  timestamp: string;
  parent?: CommentItem;
  hub?: Hub;
  isPinned?: boolean;
};

export type FundingRequestItem = BaseItem & {
  type: 'funding_request';
  amount: number;
  goalAmount: number;
  progress: number;
  contributors: User[];
  expirationDate: string;
};

export type GrantItem = BaseItem & {
  type: 'grant';
  amount: number;
  deadline: string;
  contributors?: User[];
  applicants?: User[];
};

export type PaperItem = BaseItem & {
  type: 'paper';
  authors: PaperAuthor[];
  doi?: string;
  journal?: string;
};

export type ReviewItem = BaseItem & {
  type: 'review';
  amount: number;
};

export type BountyType = 'review' | 'dataset' | 'translation' | 'other';

export type BountyItem = {
  id: string;
  type: 'bounty';
  bountyType: BountyType;
  description: string;
  title?: string;
  user: User;
  timestamp: string;
  hub: Hub;
  amount: number;
  deadline?: string;
  contributors?: User[];
  slug?: string;
  relatedPaper?: PaperItem;
};

export type ContributionItem = {
  id: string;
  type: 'contribution';
  user: User;
  timestamp: string;
  hub?: Hub;
  amount: number;
  recipientItem: Exclude<FeedItemType, ContributionItem>;
};

export type FeedItemType = 
  | PaperItem 
  | CommentItem 
  | FundingRequestItem 
  | BountyItem 
  | GrantItem 
  | ReviewItem
  | ContributionItem;

export type FeedEntry = {
  id: string;
  actor: User;
  timestamp: string;
  metrics: Metrics;
  item: FeedItemType;
  relatedItem?: FeedItemType;
} & (
  | {
      action: 'repost';
      repostMessage?: string;
    }
  | {
      action: 'post' | 'contribute' | 'publish';
    }
);
