import { BaseTransformer } from './transformer';
import { User, transformUser } from './user';

export type BountyType = 'REVIEW' | 'BOUNTY' | 'GENERIC_COMMENT';

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate: string;
  bountyType: BountyType;
  createdBy: User;
  isContribution: boolean;
  raw: any;
}

export const transformBounty: BaseTransformer<any, Bounty> = (raw) => ({
  id: raw.id,
  amount: raw.amount,
  status: raw.status,
  expirationDate: raw.expiration_date,
  bountyType: raw.bounty_type,
  createdBy: transformUser(raw.created_by),
  isContribution: !!raw.parent,
  raw,
});
