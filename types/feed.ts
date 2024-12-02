export type Hub = {
  name: string;
  slug: string;
};

export type User = {
  id: string;
  fullName: string;
  verified: boolean;
  isOrganization: boolean;
  isVerified: boolean;
};

export type Author = {
  name: string;
  verified: boolean;
};

export type Metrics = {
  votes: number;
  comments: number;
  contributors?: number;
  applicants?: number;
  reviewScore?: number;
};

export type FeedActionType = 
  | 'post'
  | 'share'
  | 'contribute'
  | 'apply'
  | 'review'
  | 'publish';

export type ItemType = 
  | 'funding_request'
  | 'grant'
  | 'paper'
  | 'review'
  | 'reward'
  | 'contribution';

export type BaseItem = {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  user: User;
  timestamp: string;
  hub: Hub;
  metrics: Metrics;
};

export type FundingRequestItem = BaseItem & {
  type: 'funding_request';
  amount: number;
  goalAmount: number;
  progress: number;
};

export type GrantItem = BaseItem & {
  type: 'grant';
  amount: string;
  deadline?: string;
};

export type PaperItem = BaseItem & {
  type: 'paper';
  authors: Author[];
  doi: string;
  journal: string;
};

export type ReviewItem = BaseItem & {
  type: 'review';
  amount: number;
};

export type RewardItem = BaseItem & {
  type: 'reward';
  amount: string;
  deadline: string;
  difficulty: 'Advanced' | 'Intermediate' | 'Beginner';
};

export type ContributionItem = BaseItem & {
  type: 'contribution';
  amount: number;
};

export type Item = 
  | FundingRequestItem
  | GrantItem
  | PaperItem
  | ReviewItem
  | RewardItem
  | ContributionItem;

export type FeedEntry = {
  id: string;
  action: FeedActionType;
  actor: User;
  timestamp: string;
  item: Item;
  relatedItem?: Item;
}; 