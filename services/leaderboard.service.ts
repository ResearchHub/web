import { ApiClient } from './client';
import {
  LeaderboardOverviewResponse,
  LeaderboardReviewersResponse,
  LeaderboardFundersResponse,
  LeaderboardAuthorsResponse,
  LeaderboardHubsResponse,
  TopReviewer,
  TopFunder,
  TopAuthor,
  TopHub,
  transformTopReviewer,
  transformTopFunder,
  transformTopAuthor,
  transformTopHub,
  RawTopReviewer,
  RawTopFunder,
  RawTopAuthor,
  RawTopHub,
} from '@/types/leaderboard';
import { mockAuthors, mockHubs, BrowseAuthor, BrowseHub } from '@/store/browseStore';

interface TransformedLeaderboardOverview {
  reviewers: TopReviewer[];
  funders: TopFunder[];
}

// Define structure for paginated/structured list responses
interface ListApiResponse<T> {
  results: T[];
  // Add other pagination fields like count, next, previous if they exist
}

// Convert BrowseAuthor to TopAuthor
const convertBrowseAuthorToTopAuthor = (browseAuthor: BrowseAuthor): TopAuthor => {
  return {
    id: parseInt(browseAuthor.id),
    authorProfile: {
      id: parseInt(browseAuthor.id),
      fullName: browseAuthor.name,
      firstName: browseAuthor.name.split(' ')[0] || '',
      lastName: browseAuthor.name.split(' ').slice(1).join(' ') || '',
      profileImage: browseAuthor.avatar,
      headline: browseAuthor.headline,
      profileUrl: `/author/${browseAuthor.username}`,
      isClaimed: browseAuthor.isVerified,
    },
    totalPublications: browseAuthor.publicationCount,
    totalCitations: browseAuthor.citationCount,
    hIndex: browseAuthor.hIndex,
    impactScore: browseAuthor.followerCount, // Use follower count as impact score for sorting
  };
};

// Convert BrowseHub to TopHub
const convertBrowseHubToTopHub = (browseHub: BrowseHub): TopHub => {
  return {
    id: parseInt(browseHub.id),
    name: browseHub.name,
    slug: browseHub.slug,
    description: browseHub.description,
    image: browseHub.avatar.startsWith('http') ? browseHub.avatar : null,
    memberCount: browseHub.memberCount,
    publicationCount: 0, // BrowseHub doesn't have this field, using 0 as default
    totalEngagement: browseHub.followerCount, // Use follower count as engagement metric
  };
};

export class LeaderboardService {
  private static readonly BASE_PATH = '/api/leaderboard';

  /**
   * Fetch the leaderboard overview data (top reviewers and funders)
   * and transform it into the application's format.
   */
  static async fetchLeaderboardOverview(): Promise<TransformedLeaderboardOverview> {
    const rawData = await ApiClient.get<LeaderboardOverviewResponse>(`${this.BASE_PATH}/overview`);

    // Transform the raw data
    const transformedData: TransformedLeaderboardOverview = {
      reviewers: rawData.reviewers.map(transformTopReviewer),
      funders: rawData.funders.map(transformTopFunder),
    };

    return transformedData;
  }

  /**
   * Fetch the detailed list of top reviewers within a date range.
   */
  static async fetchReviewers(startDate: string, endDate: string): Promise<TopReviewer[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const rawData = await ApiClient.get<ListApiResponse<RawTopReviewer>>(
      `${this.BASE_PATH}/reviewers/?${params.toString()}`
    );
    if (rawData && Array.isArray(rawData.results)) {
      return rawData.results.map(transformTopReviewer);
    } else {
      console.error('Unexpected response structure for reviewers:', rawData);
      return [];
    }
  }

  /**
   * Fetch the detailed list of top funders within a date range.
   */
  static async fetchFunders(startDate: string, endDate: string): Promise<TopFunder[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const rawData = await ApiClient.get<ListApiResponse<RawTopFunder>>(
      `${this.BASE_PATH}/funders/?${params.toString()}`
    );
    if (rawData && Array.isArray(rawData.results)) {
      return rawData.results.map(transformTopFunder);
    } else {
      console.error('Unexpected response structure for funders:', rawData);
      return [];
    }
  }

  /**
   * Fetch the detailed list of top authors within a date range.
   * Uses data from browseStore and sorts by follower count.
   */
  static async fetchAuthors(startDate: string, endDate: string): Promise<TopAuthor[]> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Convert browse authors to top authors and sort by follower count
      return mockAuthors
        .map(convertBrowseAuthorToTopAuthor)
        .sort((a, b) => b.impactScore - a.impactScore); // impactScore is followerCount
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  }

  /**
   * Fetch the detailed list of top hubs within a date range.
   * Uses data from browseStore and sorts by follower count.
   */
  static async fetchHubs(startDate: string, endDate: string): Promise<TopHub[]> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Convert browse hubs to top hubs and sort by follower count
      return mockHubs
        .map(convertBrowseHubToTopHub)
        .sort((a, b) => b.totalEngagement - a.totalEngagement); // totalEngagement is followerCount
    } catch (error) {
      console.error('Error fetching hubs:', error);
      return [];
    }
  }
}
