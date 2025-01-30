import { createTransformer } from '@/types/transformer';
import { Currency } from './post.dto';

export interface CreateContributionPayload {
  amount: number;
  /*TODO 
  *I import Currency from the post.dto. It was added in my previous commit
  when we added an endpoint for creating a new fund.
  Do we have a file where we can specify shared types?
  */
  amount_currency: Currency;
}

interface AmountInfo {
  usd: number;
  rsc: number;
}

interface AuthorProfile {
  id: number;
  profile_image?: string;
}

interface User {
  id: number;
  author_profile: AuthorProfile;
  first_name: string;
  last_name: string;
}

interface Contributors {
  total: number;
  top: User[];
}

export enum FundraiseStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

export interface FundraiseResponse {
  id: number;
  amount_raised: AmountInfo;
  goal_amount: AmountInfo;
  contributors: Contributors;
  status: FundraiseStatus;
  goal_currency: Currency;
  created_date: string;
  updated_date: string;
  start_date?: string;
  end_date?: string;
  unified_document?: number;
}

export const transformFundraiseResponse = createTransformer<any, FundraiseResponse>((raw) => ({
  id: raw.id,
  amount_raised: {
    usd: raw.amount_raised.usd,
    rsc: raw.amount_raised.rsc,
  },
  goal_amount: {
    usd: raw.goal_amount.usd,
    rsc: raw.goal_amount.rsc,
  },
  contributors: {
    total: raw.contributors.total,
    top: raw.contributors.top.map((user: any) => ({
      id: user.id,
      author_profile: {
        id: user.author_profile.id,
        profile_image: user.author_profile.profile_image || undefined,
      },
      first_name: user.first_name,
      last_name: user.last_name,
    })),
  },
  status: raw.status as FundraiseStatus,
  goal_currency: raw.goal_currency as Currency,
  created_date: raw.created_date,
  updated_date: raw.updated_date,
  start_date: raw.start_date || undefined,
  end_date: raw.end_date || undefined,
  unified_document: raw.unified_document || undefined,
}));
