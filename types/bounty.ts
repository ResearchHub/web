import { BaseTransformer } from './transformer';
import { User, transformUser } from './user';

export type BountyType = 'REVIEW' | 'BOUNTY' | 'GENERIC_COMMENT';
export type SolutionStatus = 'AWARDED' | 'PENDING';

export interface BountySolution {
  id: number;
  contentType?: {
    id: number;
    name: string;
  };
  objectId: number;
  createdBy: User;
  status: SolutionStatus;
  awardedAmount?: string;
}

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate: string;
  bountyType: BountyType;
  createdBy: User;
  isContribution: boolean;
  solutions: BountySolution[];
  raw: any;
}

export const transformSolution = (raw: any): BountySolution => ({
  id: raw.id,
  contentType: raw.content_type,
  objectId: raw.object_id,
  createdBy: transformUser(raw.created_by),
  status: raw.status,
  awardedAmount: raw.awarded_amount,
});

export const transformBounty: BaseTransformer<any, Bounty> = (raw) => ({
  id: raw.id,
  amount: raw.amount,
  status: raw.status,
  expirationDate: raw.expiration_date,
  bountyType: raw.bounty_type,
  createdBy: transformUser(raw.created_by),
  isContribution: !!raw.parent,
  solutions: Array.isArray(raw.solutions) ? raw.solutions.map(transformSolution) : [],
  raw,
});
