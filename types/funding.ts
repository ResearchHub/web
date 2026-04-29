import { Currency, ID } from './root';
import { createTransformer } from './transformer';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { transformUser, User } from './user';
import { transformAiPeerReviewFeedSummary, type AiPeerReviewFeedSummary } from './aiPeerReview';
import type { Review } from './feed';

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
 * so the displayed total matches the goal. Returns null for active fundraises (use live rate).
 */
export function computeGoalRate(status: string, goalUsd: number, raisedRsc: number): number | null {
  return status === 'COMPLETED' && raisedRsc > 0 ? goalUsd / raisedRsc : null;
}

/**
 * Pull raw RSC + direct USD contribution amounts out of a backend payload.
 * Conversion between currencies happens at render time using the live exchange rate
 * (or the fundraise's goal rate for COMPLETED fundraises).
 */
function resolveContributionAmounts(totalContribution: any): { usd: number; rsc: number } {
  return {
    rsc: totalContribution?.rsc ?? 0,
    usd: totalContribution?.usd ?? 0,
  };
}

/**
 * Combine RSC + direct USD contributions into a single display amount, using the
 * provided RSC→USD rate (goal rate for completed fundraises, live rate otherwise).
 */
export function getContributionTotal(
  amounts: { rsc: number; usd: number },
  displayCurrency: 'USD' | 'RSC',
  rscToUsdRate: number
): number {
  if (rscToUsdRate <= 0) {
    return displayCurrency === 'USD' ? amounts.usd : amounts.rsc;
  }
  if (displayCurrency === 'USD') {
    return amounts.rsc * rscToUsdRate + amounts.usd;
  }
  return amounts.rsc + amounts.usd / rscToUsdRate;
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
      totalContribution: resolveContributionAmounts(c.total_contribution),
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
      usd: goalRate == null ? (raw.amount_raised?.usd ?? 0) : raisedRsc * goalRate,
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
  aiPeerReview?: AiPeerReviewFeedSummary | null;
  reviews?: Review[];
}

export function transformApplication(raw: any): Application {
  return {
    profile: transformAuthorProfile(raw.applicant),
    preregistrationPostId: raw.preregistration_post_id ?? undefined,
    fundraise: raw.fundraise ? transformApplicationFundraise(raw.fundraise) : undefined,
    aiPeerReview: transformAiPeerReviewFeedSummary(raw.ai_peer_review),
    reviews: Array.isArray(raw.fundraise?.reviews)
      ? raw.fundraise.reviews.map((review: any) => ({
          id: review.id,
          score: review.score,
          author: transformAuthorProfile(review.author),
          isAssessed: review.is_assessed ?? false,
        }))
      : Array.isArray(raw.reviews)
        ? raw.reviews.map((review: any) => ({
            id: review.id,
            score: review.score,
            author: transformAuthorProfile(review.author),
            isAssessed: review.is_assessed ?? false,
          }))
        : [],
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
      usd: goalRate == null ? raw.amount_raised.usd : raisedRsc * goalRate,
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
        totalContribution: resolveContributionAmounts(contributor.total_contribution),
        contributions: (contributor.contributions || []).map((contribution: any) => ({
          amount: contribution.amount,
          currency: contribution.currency,
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
