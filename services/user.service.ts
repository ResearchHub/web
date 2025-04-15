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
}
