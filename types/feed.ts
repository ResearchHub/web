import { User } from "./user";
import { Hub } from "./hub";

export type PaperAuthor = {
  name: string;
  isVerified: boolean;
};

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
  | 'reward'
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

export type RewardItem = BaseItem & {
  type: 'reward';
  amount: number;
  deadline: string;
  contributors?: User[];
};

export type ContributionItem = Omit<BaseItem, 'slug'> & {
  type: 'contribution';
  amount: number;
};

export type FeedItemType = 
  | CommentItem 
  | PaperItem 
  | FundingRequestItem
  | GrantItem
  | RewardItem
  | ContributionItem
  | ReviewItem;

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
