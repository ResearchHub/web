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

/**
 * When a fundraise is COMPLETED, derive USD from the ratio (goalUsd / raisedRsc)
 * so each contributor's USD is their proportional share of the goal. Returns null for active fundraises.
 */
function computeGoalRate(status: string, goalUsd: number, raisedRsc: number): number | null {
  return status === 'COMPLETED' && raisedRsc > 0 ? goalUsd / raisedRsc : null;
}

function resolveContributionAmounts(
  totalContribution: any,
  goalRate: number | null
): { usd: number; rsc: number } {
  if (typeof totalContribution === 'number') {
    return {
      usd: goalRate != null ? totalContribution * goalRate : 0,
      rsc: totalContribution,
    };
  }

  const rsc = totalContribution?.rsc ?? totalContribution?.RSC ?? 0;
  return {
    usd:
      goalRate != null ? rsc * goalRate : (totalContribution?.usd ?? totalContribution?.USD ?? 0),
    rsc,
  };
}

export function transformApplicationFundraise(raw: any): ApplicationFundraise {
  const goalUsd = raw.goal_amount?.usd ?? 0;
  const goalRsc = raw.goal_amount?.rsc ?? 0;
  const raisedRsc = raw.amount_raised?.rsc ?? 0;
  const goalRate = computeGoalRate(raw.status, goalUsd, raisedRsc);

  const topContributors = (raw.contributors?.top ?? []).map((c: any) => {
    const firstName = c.first_name ?? '';
    const lastName = c.last_name ?? '';

    return {
      id: c.id,
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(' ') || 'Contributor',
      profileImage: c.profile_image ?? '',
      totalContribution: resolveContributionAmounts(c.total_contribution, goalRate),
    };
  });

  return {
    id: raw.id,
    title: raw.title,
    status: raw.status as FundraiseStatus,
    goalAmount: {
      usd: goalUsd,
      rsc: goalRsc,
    },
    amountRaised: {
      usd: goalRate != null ? raisedRsc * goalRate : (raw.amount_raised?.usd ?? 0),
      rsc: raisedRsc,
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

export interface Application {
  profile: AuthorProfile;
  preregistrationPostId?: number;
  fundraise?: ApplicationFundraise;
}

export function transformApplication(raw: any): Application {
  return {
    profile: transformAuthorProfile(raw.applicant),
    preregistrationPostId: raw.preregistration_post_id ?? undefined,
    fundraise: raw.fundraise ? transformApplicationFundraise(raw.fundraise) : undefined,
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

export const transformFundraise = createTransformer<any, Fundraise>((raw) => {
  const goalUsd = raw.goal_amount.usd;
  const goalRsc = raw.goal_amount.rsc;
  const raisedRsc = raw.amount_raised.rsc;
  const goalRate = computeGoalRate(raw.status, goalUsd, raisedRsc);

  return {
    id: raw.id,
    amountRaised: {
      usd: goalRate != null ? raisedRsc * goalRate : raw.amount_raised.usd,
      rsc: raisedRsc,
    },
    goalAmount: {
      usd: goalUsd,
      rsc: goalRsc,
    },
    contributors: {
      numContributors: raw.contributors.total,
      topContributors: raw.contributors.top.map((contributor: any) => ({
        id: contributor.id,
        authorProfile: transformAuthorProfile(contributor.author_profile),
        totalContribution: resolveContributionAmounts(contributor.total_contribution, goalRate),
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
  };
});
