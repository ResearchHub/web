import { AuthorProfile, transformAuthorProfile } from './authorProfile';
import { createTransformer } from './transformer';

// Define the structure for a top reviewer entry from the API
export interface RawTopReviewer {
  id: number;
  author_profile: any; // Raw author profile data, can be {} or actual profile
  first_name: string;
  last_name: string;
  created_date: string;
  earned_rsc: number | string; // API might send as string
  bounty_earnings: number | string;
  tip_earnings: number | string;
}

// Define the transformed structure for a top reviewer
export interface TopReviewer {
  id: number;
  authorProfile: AuthorProfile;
  earnedRsc: number;
}

// Define the structure for a top funder entry from the API
export interface RawTopFunder {
  id: number;
  author_profile: any; // Raw author profile data
  first_name: string;
  last_name: string;
  created_date: string;
  total_funding: number | string; // API might send as string
  purchase_funding: number | string;
  bounty_funding: number | string;
  distribution_funding: number | string;
}

// Define the transformed structure for a top funder
export interface TopFunder {
  id: number;
  authorProfile: AuthorProfile;
  totalFunding: number;
}

// Define the structure for the leaderboard overview API response
export interface LeaderboardOverviewResponse {
  reviewers: RawTopReviewer[];
  funders: RawTopFunder[];
}

// Define the structure for the detailed reviewers list API response
export type LeaderboardReviewersResponse = RawTopReviewer[];

// Define the structure for the detailed funders list API response
export type LeaderboardFundersResponse = RawTopFunder[];

// Transformer for TopReviewer
export const transformTopReviewer = createTransformer<RawTopReviewer, TopReviewer>(
  (raw: RawTopReviewer) => {
    // Use transformAuthorProfile, providing fallback names if profile is empty
    const authorProfile = transformAuthorProfile(
      raw.author_profile || { first_name: raw.first_name, last_name: raw.last_name, id: raw.id }
    );

    return {
      id: raw.id,
      authorProfile: authorProfile,
      earnedRsc: typeof raw.earned_rsc === 'string' ? parseFloat(raw.earned_rsc) : raw.earned_rsc,
    };
  }
);

// Transformer for TopFunder
export const transformTopFunder = createTransformer<RawTopFunder, TopFunder>(
  (raw: RawTopFunder) => {
    const authorProfile = transformAuthorProfile(
      raw.author_profile || { first_name: raw.first_name, last_name: raw.last_name, id: raw.id }
    );

    return {
      id: raw.id,
      authorProfile: authorProfile,
      totalFunding:
        typeof raw.total_funding === 'string' ? parseFloat(raw.total_funding) : raw.total_funding,
    };
  }
);
