import { ApiClient } from './client';
import { User, transformUser } from '@/types/user';

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
}
