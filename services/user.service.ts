import { ApiClient } from './client';
import { User, transformUser } from '@/types/user';

export class UserService {
  private static readonly BASE_PATH = '/api/popover';

  // Cache to store previously fetched user data
  private static userCache: Record<number, User> = {};

  /**
   * Get user information for the tooltip
   */
  static async getUserInfo(userId: number): Promise<User> {
    // Check if we already have cached data for this user
    if (this.userCache[userId]) {
      console.log(`Using cached data for user ID: ${userId}`);
      return this.userCache[userId];
    }

    try {
      // Add debug logging
      console.log(`Fetching user info for ID: ${userId}`);

      const response = await ApiClient.get(`${this.BASE_PATH}/${userId}/get_user/`);

      // Log the response to see what data is coming back
      console.log('User info response:', response);

      const userData = transformUser(response);

      // Cache the result
      this.userCache[userId] = userData;

      return userData;
    } catch (error) {
      console.error(`Error fetching user info for ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get author profile information using the profile ID
   * This is an alternative if the user ID doesn't work
   */
  static async getAuthorProfileInfo(profileId: number): Promise<User> {
    // Check if we already have cached data for this profile
    if (this.userCache[profileId]) {
      console.log(`Using cached data for profile ID: ${profileId}`);
      return this.userCache[profileId];
    }

    try {
      const response = await ApiClient.get(`/api/author_profile/${profileId}/`);
      const userData = transformUser({ author_profile: response });

      // Cache the result
      this.userCache[profileId] = userData;

      return userData;
    } catch (error) {
      console.error(`Error fetching author profile for ID ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Clear the cache for testing or when needed
   */
  static clearCache(): void {
    this.userCache = {};
  }
}
