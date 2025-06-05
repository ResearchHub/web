import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';

export type GrantStatus = 'OPEN' | 'CLOSED';

export interface GrantAmount {
  usd: number;
  rsc: number;
  formatted: string;
}

export interface Grant {
  id: ID;
  createdBy: {
    id: ID;
    authorProfile: AuthorProfile;
    firstName: string;
    lastName: string;
  };
  amount: GrantAmount;
  currency: Currency;
  organization: string;
  description: string;
  status: GrantStatus;
  startDate: string;
  endDate: string;
}

export const transformGrant = createTransformer<any, Grant>((raw) => ({
  id: raw.id,
  createdBy: {
    id: raw.created_by.id,
    authorProfile: transformAuthorProfile(raw.created_by.author_profile),
    firstName: raw.created_by.first_name,
    lastName: raw.created_by.last_name,
  },
  amount: {
    usd: raw.amount.usd,
    rsc: raw.amount.rsc,
    formatted: raw.amount.formatted,
  },
  currency: raw.currency as Currency,
  organization: raw.organization,
  description: raw.description,
  status: raw.status as GrantStatus,
  startDate: raw.start_date,
  endDate: raw.end_date,
}));
