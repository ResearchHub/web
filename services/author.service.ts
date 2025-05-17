import {
  Achievement,
  AuthorSummaryStats,
  transformAuthorAchievements,
  transformAuthorSummaryStats,
} from '@/types/authorProfile';
import { ApiClient } from './client';
import { User, transformUser } from '@/types/user';

interface AuthorResponse {
  id: number;
  first_name: string;
  last_name: string;
  slug: string;
  profile_image?: string;
  description?: string;
}

interface AuthorsApiResponse {
  results: AuthorResponse[];
}

interface FollowResponse {
  id: number;
  content_type: string;
  type: string;
  object_id: number;
  created_date: string;
  updated_date: string;
}

interface AuthorProfileResponse {
  id: number;
  first_name: string;
  last_name: string;
  profile_image?: string | null;
  description?: string | null;
  headline?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  google_scholar?: string | null;
  education?: any[];
  [key: string]: any; // Allow other properties
}

// Add this interface for the achievements response
interface AuthorAchievementsResponse {
  id: number;
  name: string;
  description: string;
  image: string;
  date_earned: string;
  // Add any other fields that come from the API
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

// Add this interface for the update payload
export interface AuthorUpdatePayload {
  first_name?: string;
  last_name?: string;
  description?: string;
  // Using a more generic education type that accepts both string and number for id
  education?: Array<{
    id?: string | number;
    name?: string;
    // Allow other properties
    [key: string]: any;
  }>;
  headline?: { title: string; isPublic?: boolean } | string | null;
  linkedin?: string | null;
  twitter?: string | null;
  orcid_id?: string | null;
  google_scholar?: string | null;
}

// Interface for the update payload parameters
export interface AuthorUpdateParams extends AuthorUpdatePayload {
  profileImageDataUrl?: string | null; // Add image data URL
}

export class AuthorService {
  private static readonly BASE_PATH = '/api/search/person';
  private static readonly AUTHORS_PATH = '/api/author';

  // Cache to store previously fetched author data
  private static authorCache: Record<number, User> = {};

  static async getAuthors(): Promise<Author[]> {
    const response = await ApiClient.get<AuthorsApiResponse>(`${this.BASE_PATH}/`);
    return response.results.map((author) => ({
      id: author.id,
      name: author.first_name + ' ' + author.last_name,
      slug: author.slug,
      imageUrl: author.profile_image,
      description: author.description,
    }));
  }

  static async getFollowedAuthors(): Promise<number[]> {
    const response = await ApiClient.get<FollowResponse[]>('/api/author/following/');
    return response.map((follow) => follow.object_id);
  }

  static async followAuthor(authorId: number): Promise<void> {
    await ApiClient.post(`${this.AUTHORS_PATH}/${authorId}/follow/`);
  }

  static async unfollowAuthor(authorId: number): Promise<void> {
    await ApiClient.post(`${this.AUTHORS_PATH}/${authorId}/unfollow/`);
  }

  /**
   * Get author information for the tooltip
   */
  static async getAuthorInfo(authorId: number): Promise<User> {
    // Check if we already have cached data for this author
    if (this.authorCache[authorId]) {
      return this.authorCache[authorId];
    }

    try {
      const response = await ApiClient.get<AuthorProfileResponse>(
        `${this.AUTHORS_PATH}/${authorId}/minimal_overview/`
      );

      // Check response structure and ensure it contains expected fields
      if (!response) {
        throw new Error('Received empty response from API');
      }

      // Properly prepare the data for transformUser
      let userData;
      if ('author_profile' in response) {
        // Response already has the expected structure
        userData = transformUser(response);
      } else if ('id' in response) {
        // Response is an author profile directly - wrap it properly
        // Create a user object with the author profile data
        userData = transformUser({
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          author_profile: {
            ...response,
            id: response.id,
            first_name: response.first_name,
            last_name: response.last_name,
            profile_image: response.profile_image,
            description: response.description,
            orcid_id: response.orcid_id,
          },
        });
      } else {
        throw new Error('Response does not contain expected author data');
      }

      // Cache the result
      this.authorCache[authorId] = userData;

      return userData;
    } catch (error) {
      console.error(`Error fetching author info for ID ${authorId}:`, error);

      // Try to fetch using the alternative method if the first one fails
      try {
        console.log(`Trying alternative method for author ID: ${authorId}`);
        const response = await ApiClient.get<AuthorProfileResponse>(
          `${this.AUTHORS_PATH}/${authorId}/`
        );
        console.log('Alternative method response structure:', Object.keys(response || {}));

        // Ensure the response is wrapped correctly for transformUser
        const userData = transformUser({
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          author_profile: {
            ...response,
            id: response.id,
            first_name: response.first_name,
            last_name: response.last_name,
            profile_image: response.profile_image,
            description: response.description,
            orcid_id: response.orcid_id,
          },
        });

        // Cache the result
        this.authorCache[authorId] = userData;

        return userData;
      } catch (secondError) {
        console.error(`Both fetch methods failed for author ID ${authorId}:`, secondError);
        throw error; // Throw the original error
      }
    }
  }

  /**
   * Update author profile data using JSON
   */
  static async updateAuthorProfileData(
    authorId: number,
    params: AuthorUpdatePayload
  ): Promise<void> {
    try {
      // Send JSON payload using PATCH
      await ApiClient.patch(`${this.AUTHORS_PATH}/${authorId}/`, params);
      // Invalidate cache
      delete this.authorCache[authorId];
    } catch (error) {
      console.error(`Error updating author data via PATCH JSON for ID ${authorId}:`, error);
      throw error; // Re-throw
    }
  }

  /**
   * Update author profile image using FormData
   */
  static async updateAuthorProfileImage(authorId: number, coverImage: File | Blob): Promise<void> {
    if (!coverImage) {
      throw new Error('Invalid image data URL');
    }

    try {
      const formData = new FormData();
      formData.append('profile_image', coverImage);

      // Send FormData using PATCH
      await ApiClient.patch(`${this.AUTHORS_PATH}/${authorId}/`, formData);
      // Invalidate cache
      delete this.authorCache[authorId];
    } catch (error) {
      console.error(`Error updating author image via PATCH FormData for ID ${authorId}:`, error);
      throw error; // Re-throw
    }
  }

  /**
   * Clear the cache for testing or when needed
   */
  static clearCache(): void {
    this.authorCache = {};
  }

  /**
   * Fetch achievements for a specific author
   */
  static async getAuthorAchievements(authorId: number): Promise<Achievement[]> {
    try {
      const response = await ApiClient.get<Achievement[]>(
        `${this.AUTHORS_PATH}/${authorId}/achievements/`
      );
      return transformAuthorAchievements(response);
    } catch (error) {
      console.error(`Error fetching achievements for author ID ${authorId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch summary statistics for a specific author
   */
  static async getAuthorSummaryStats(authorId: number): Promise<AuthorSummaryStats> {
    try {
      const response = await ApiClient.get<any>(`${this.AUTHORS_PATH}/${authorId}/summary_stats/`);
      return transformAuthorSummaryStats(response);
    } catch (error) {
      console.error(`Error fetching summary stats for author ID ${authorId}:`, error);
      throw error;
    }
  }
}
