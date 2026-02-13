import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { GrantApplication, transformGrantApplication } from './grantApplication';

export type FundraiseStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

export interface Contribution {
  amount: number;
  date: string;
}

export interface Contributor {
  id: ID;
  authorProfile: AuthorProfile;
  totalContribution: number;
  contributions: Contribution[];
}

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
    topContributors: Contributor[];
  };

  createdDate: string;
  updatedDate: string;
  grantApplication?: GrantApplication;
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
    topContributors: raw.contributors.top.map((contributor: any) => ({
      id: contributor.id,
      authorProfile: transformAuthorProfile(contributor.author_profile),
      totalContribution: contributor.total_contribution,
      contributions: contributor.contributions.map((contribution: any) => ({
        amount: contribution.amount,
        date: contribution.date,
      })),
    })),
  },
  status: raw.status as FundraiseStatus,
  goalCurrency: raw.goal_currency as Currency,
  startDate: raw.start_date || undefined,
  endDate: raw.end_date || undefined,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  grantApplication: raw.grant_application?.grant
    ? transformGrantApplication(raw.grant_application)
    : undefined,
}));
