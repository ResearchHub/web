import { Hub, User, Metrics } from './feed';

export type FundingAuthor = {
  name: string;
  affiliation: string;
  verified: boolean;
};

export type TopContributor = User & {
  amount: number;
};

export type Funding = {
  id: string;
  type: 'funding_request';
  title: string;
  objective: string;
  abstract: string;
  content: string;

  // User information
  user: User;
  authors: User[];

  // Metadata
  timestamp: string;
  publishDate: string;
  hub: Hub;
  doi: string;
  keywords: string[];

  // Funding specific
  amount: number;
  goalAmount: number;
  progress: number;

  // Metrics grouped together
  metrics: Metrics;

  // Contributors as User types
  contributors: { user: User; amount: number }[];
};
