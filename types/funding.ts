import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { transformUser, User } from './user';

export type FundraiseStatus = 'OPEN' | 'COMPLETED' | 'CLOSED';

export interface ApplicationContributor {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImage: string;
  totalContribution: { usd: number; rsc: number };
}

export interface ReviewMetrics {
  avg: number;
  count: number;
}

export interface ApplicationFundraise {
  id: number;
  title: string;
  status: FundraiseStatus;
  goalAmount: { usd: number; rsc: number };
  amountRaised: { usd: number; rsc: number };
  contributors: {
    total: number;
    top: ApplicationContributor[];
  };
  nonprofit?: { id: number; name: string };
  reviewMetrics?: ReviewMetrics;
}

export function transformApplicationFundraise(raw: any): ApplicationFundraise {
  const topContributors = (raw.contributors?.top ?? []).map((c: any) => {
    const firstName = c.first_name ?? '';
    const lastName = c.last_name ?? '';
    return {
      id: c.id,
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(' ') || 'Contributor',
      profileImage: c.profile_image ?? '',
      totalContribution: {
        usd: c.total_contribution?.usd ?? c.total_contribution?.USD ?? 0,
        rsc: c.total_contribution?.rsc ?? c.total_contribution?.RSC ?? 0,
      },
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    status: raw.status as FundraiseStatus,
    goalAmount: {
      usd: raw.goal_amount?.usd ?? 0,
      rsc: raw.goal_amount?.rsc ?? 0,
    },
    amountRaised: {
      usd: raw.amount_raised?.usd ?? 0,
      rsc: raw.amount_raised?.rsc ?? 0,
    },
    contributors: {
      total: raw.contributors?.total ?? 0,
      top: topContributors,
    },
    nonprofit: raw.nonprofit ? { id: raw.nonprofit.id, name: raw.nonprofit.name } : undefined,
    reviewMetrics:
      raw.review_metrics?.avg != null
        ? { avg: raw.review_metrics.avg, count: raw.review_metrics.count ?? 0 }
        : undefined,
  };
}

export interface Contribution {
  amount: number;
  date: string;
}

export interface ContributionTotals {
  usd: number;
  rsc: number;
}

export interface Contributor {
  id: ID;
  authorProfile: AuthorProfile;
  totalContribution: ContributionTotals;
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

  createdBy?: User;
  createdDate: string;
  updatedDate: string;

  postId?: number;
  postTitle?: string;
  postSlug?: string;
  postImage?: string | null;
  reviewMetrics?: ReviewMetrics;
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
      totalContribution: (() => {
        if (typeof contributor.total_contribution === 'number') {
          return { usd: 0, rsc: contributor.total_contribution };
        }

        return {
          usd: contributor.total_contribution?.usd ?? contributor.total_contribution?.USD ?? 0,
          rsc: contributor.total_contribution?.rsc ?? contributor.total_contribution?.RSC ?? 0,
        };
      })(),
      contributions: (contributor.contributions || []).map((contribution: any) => ({
        amount: contribution.amount,
        date: contribution.date,
      })),
    })),
  },
  createdBy: transformUser(raw.created_by),
  status: raw.status as FundraiseStatus,
  goalCurrency: raw.goal_currency as Currency,
  startDate: raw.start_date || undefined,
  endDate: raw.end_date || undefined,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  postId: raw.post_id || undefined,
  postTitle: raw.post_title || undefined,
  postSlug: raw.post_slug || undefined,
  postImage: raw.post_image || null,
  reviewMetrics:
    raw.review_metrics?.avg != null
      ? { avg: raw.review_metrics.avg, count: raw.review_metrics.count ?? 0 }
      : undefined,
}));
