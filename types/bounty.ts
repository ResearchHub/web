import { BaseTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './user';

export type BountyType = 'REVIEW' | 'ANSWER' | 'GENERIC_COMMENT';

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate: string;
  bountyType: BountyType;
  createdBy: AuthorProfile;
  raw: any;
}

export const transformBounty: BaseTransformer<any, Bounty> = (raw) => ({
  id: raw.id,
  amount: raw.amount,
  status: raw.status,
  expirationDate: raw.expiration_date,
  bountyType: raw.bounty_type,
  createdBy: transformAuthorProfile(raw.created_by),
  raw,
});
