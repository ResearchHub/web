import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { ContentMetrics } from './metrics';
import { Journal } from './journal';
import { Topic, transformTopic } from './topic';
import { createTransformer, BaseTransformed } from './transformer';

export type FundingRequestStatus = 'OPEN' | 'FUNDED' | 'CLOSED';

// We're keeping the RequestForProposal interface but commenting it out for future reference
/*
export interface RequestForProposal {
  id: string;
  type: 'rfp';
  title: string;
  description: string;
  status: FundingRequestStatus;
  fundingAmount: number;
  distributedAmount?: number;
  requirements: string[];
  image?: string;
  topic: Topic;
  actor?: AuthorProfile;
  slug?: string;
}
*/

export interface Content {
  id: string | number;
  type: string;
  title?: string;
  abstract?: string;
  summary?: string;
  journal?: Journal;
  paper?: any;
  image?: string;
  topic?: any;
  status?: string;
  amount?: number;
  actor?: AuthorProfile;
  authors?: AuthorProfile[];
  profileUrl?: string;
  documents?: Array<{
    id: number;
    title: string;
    abstract: string;
    slug: string;
  }>;
}

export interface FundingRequest {
  id: string;
  type: 'funding_request';
  title: string;
  abstract: string;
  amount: number;
  goalAmount: number;
  goalAmountUsd?: number;
  image?: string;
  status: FundingRequestStatus;
  actor?: AuthorProfile;
  topic: Topic;
  offersMementos?: boolean;
  isTaxDeductible?: boolean;
  slug?: string;
  deadline: string;
  preregistered?: boolean;
  fundraiseId?: number;
  documents?: Array<{
    id: number;
    title: string;
    abstract: string;
    slug: string;
  }>;
}

export interface FeedEntry {
  id: string;
  timestamp: string;
  content: FundingRequest | Content;
  metrics?: ContentMetrics;
  action?: string;
}

export const transformFeedEntry = createTransformer<any, FeedEntry>((response) => {
  const type = response.content_type.toLowerCase();
  const content = response.content_object;

  const baseContent = {
    id: content.id.toString(),
    type,
    title: content.title,
    status: content.status,
    deadline: content.deadline,
    topic: transformTopic(content.topic),
    actor: content.author ? transformAuthorProfile(content.author) : undefined,
    image: content.image,
  };

  // We're only handling FundingRequest now
  const transformedContent = {
    ...baseContent,
    abstract: content.abstract,
    amount: content.amount || 0,
    goalAmount: content.goal_amount || 0,
    preregistered: content.preregistered,
    offersMementos: content.offers_mementos,
    isTaxDeductible: content.is_tax_deductible,
  } as FundingRequest;

  return {
    id: response.id.toString(),
    timestamp: response.action_date,
    content: transformedContent,
    metrics: {
      votes: content.metrics?.votes || 0,
      comments: content.metrics?.comments || 0,
      reposts: content.metrics?.reposts || 0,
      saves: content.metrics?.saves || 0,
    },
    action: response.action,
  };
});
