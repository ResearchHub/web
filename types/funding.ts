import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';

export type FundraiseStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

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
    numContributors: number;
    topContributors: AuthorProfile[];
  };

  createdDate: string;
  updatedDate: string;
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
    numContributors: raw.contributors.total,
    topContributors: raw.contributors.top.map((contributor: any) =>
      transformAuthorProfile(contributor.author_profile)
    ),
  },
  status: raw.status as FundraiseStatus,
  goalCurrency: raw.goal_currency as Currency,
  startDate: raw.start_date || undefined,
  endDate: raw.end_date || undefined,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
}));
