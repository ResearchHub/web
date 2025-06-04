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

// Define the structure for a top author entry from the API
export interface RawTopAuthor {
  id: number;
  author_profile: any; // Raw author profile data
  first_name: string;
  last_name: string;
  created_date: string;
  total_publications: number | string;
  total_citations: number | string;
  h_index: number | string;
  impact_score: number | string;
}

// Define the transformed structure for a top author
export interface TopAuthor {
  id: number;
  authorProfile: AuthorProfile;
  totalPublications: number;
  totalCitations: number;
  hIndex: number;
  impactScore: number;
}

// Define the structure for a top hub entry from the API
export interface RawTopHub {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  member_count: number | string;
  publication_count: number | string;
  total_engagement: number | string;
  created_date: string;
}

// Define the transformed structure for a top hub
export interface TopHub {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  memberCount: number;
  publicationCount: number;
  totalEngagement: number;
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

// Define the structure for the detailed authors list API response
export type LeaderboardAuthorsResponse = RawTopAuthor[];

// Define the structure for the detailed hubs list API response
export type LeaderboardHubsResponse = RawTopHub[];

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

// Transformer for TopAuthor
export const transformTopAuthor = createTransformer<RawTopAuthor, TopAuthor>(
  (raw: RawTopAuthor) => {
    const authorProfile = transformAuthorProfile(
      raw.author_profile || { first_name: raw.first_name, last_name: raw.last_name, id: raw.id }
    );

    return {
      id: raw.id,
      authorProfile: authorProfile,
      totalPublications:
        typeof raw.total_publications === 'string'
          ? parseFloat(raw.total_publications)
          : raw.total_publications,
      totalCitations:
        typeof raw.total_citations === 'string'
          ? parseFloat(raw.total_citations)
          : raw.total_citations,
      hIndex: typeof raw.h_index === 'string' ? parseFloat(raw.h_index) : raw.h_index,
      impactScore:
        typeof raw.impact_score === 'string' ? parseFloat(raw.impact_score) : raw.impact_score,
    };
  }
);

// Transformer for TopHub
export const transformTopHub = createTransformer<RawTopHub, TopHub>((raw: RawTopHub) => {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    image: raw.image,
    memberCount:
      typeof raw.member_count === 'string' ? parseFloat(raw.member_count) : raw.member_count,
    publicationCount:
      typeof raw.publication_count === 'string'
        ? parseFloat(raw.publication_count)
        : raw.publication_count,
    totalEngagement:
      typeof raw.total_engagement === 'string'
        ? parseFloat(raw.total_engagement)
        : raw.total_engagement,
  };
});
