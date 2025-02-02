import { createTransformer } from './transformer';
import { ID, transformAuthorProfile, User } from './user';

export type Currency = 'USD' | 'RSC';

export type FundraiseStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

export type Contributor = Pick<User, 'id' | 'firstName' | 'lastName' | 'authorProfile'>;

export interface Fundraise {
  id: ID;
  status: FundraiseStatus;
  goalCurrency: Currency;
  goalAmount: {
    usd: number;
    rsc: number;
  };
  amountRaised: {
    usd: number;
    rsc: number;
  };
  // ISO 8601
  startDate?: string;
  endDate?: string;

  contributors: {
    total: number;
    top: Contributor[];
  };
}

export const transformFundraise = createTransformer<any, Fundraise>((raw) => ({
  id: raw.id,
  amountRaised: {
    usd: raw.amount_raised.usd,
    rsc: raw.amount_raised.rsc,
  },
  goalAmount: {
    usd: raw.goal_amount.usd,
    rsc: raw.goal_amount.rsc,
  },
  contributors: {
    total: raw.contributors.total,
    top: raw.contributors.top.map((user: any) => ({
      id: user.id,
      authorProfile: transformAuthorProfile(user.author_profile),
      firstName: user.first_name,
      lastName: user.last_name,
    })),
  },
  status: raw.status as FundraiseStatus,
  goalCurrency: raw.goal_currency as Currency,
  startDate: raw.start_date || undefined,
  endDate: raw.end_date || undefined,
  created_date: raw.created_date,
  updated_date: raw.updated_date,
  unified_document: raw.unified_document || undefined,
}));
