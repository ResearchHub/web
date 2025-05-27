import { ApiClient } from './client';
import {
  User,
  UserDetailsForModerator,
  transformUser,
  transformUserDetailsForModerator,
} from '@/types/user';

interface University {
  id: number;
  name: string;
  country?: string;
  state?: string;
  city?: string;
  [key: string]: any; // Allow other properties
}

interface UniversityApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: University[];
}

export class UserService {
  /**
   * Get author profile information using the profile ID
   * This is an alternative if the author ID doesn't work
   */
  static async getAuthorProfileInfo(profileId: number): Promise<User> {
    try {
      const response = await ApiClient.get(`/api/author_profile/${profileId}/`);
      const userData = transformUser({ author_profile: response });

      return userData;
    } catch (error) {
      console.error(`Error fetching author profile for ID ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Mark a user as having completed the onboarding process
   */
  static async setCompletedOnboarding(): Promise<void> {
    try {
      await ApiClient.patch(`/api/user/has_completed_onboarding/`, {});
    } catch (error) {
      console.error('Error setting onboarding as completed:', error);
      throw error;
    }
  }

  /**
   * Check if the user should be redirected to onboarding
   * @param user The current user object
   * @returns Boolean indicating if the user should be redirected to onboarding
   */
  static shouldRedirectToOnboarding(user: User | null): boolean {
    // If no user or user is already onboarded, no redirection needed
    if (!user || user.hasCompletedOnboarding) {
      return false;
    }

    // User exists but hasn't completed onboarding
    return true;
  }

  /**
   * Search for universities by name
   * @param search The search query for university name
   * @returns Array of universities matching the search
   */
  static async searchUniversities(search: string): Promise<University[]> {
    try {
      // Use the same URL format as in the old app
      const url = `/api/university/${search ? `?search=${encodeURIComponent(search)}` : ''}`;
      const response = await ApiClient.get<UniversityApiResponse>(url);

      // Extract the results from the paginated response
      return response.results || [];
    } catch (error) {
      console.error('Error searching universities:', error);
      return [];
    }
  }

  /**
   * Fetch detailed user information for moderation purposes
   * @param userId The ID of the user to fetch details for
   * @returns User details for moderation
   */
  static async fetchUserDetails(userId: string): Promise<UserDetailsForModerator> {
    try {
      const response = await ApiClient.get<UserDetailsForModerator>(
        `/api/moderator/${userId}/user_details`
      );
      return transformUserDetailsForModerator(response);
    } catch (error) {
      console.error(`Error fetching user details for ID ${userId}:`, error);
      throw error;
    }
  }
}
