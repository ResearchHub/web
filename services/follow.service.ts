import { ApiClient } from './client';
import { FollowResponse, FollowedObject, transformFollowedObject } from '@/types/follow';

interface FollowMultipleResponse {
  followed: Array<{
    id: number;
    name: string;
    slug?: string;
  }>;
  already_following: Array<{
    id: number;
    name: string;
  }>;
  not_found: number[];
}

export class FollowService {
  private static readonly BASE_PATH = '/api/hub';

  /**
   * Get all objects that the user is following
   * @returns Array of followed objects with their data
   */
  static async getFollowedObjects(): Promise<FollowedObject[]> {
    const response = await ApiClient.get<FollowResponse[]>(`${this.BASE_PATH}/following/`);
    return response.map(transformFollowedObject);
  }

  /**
   * Get only followed topics/hubs with their metadata
   * @returns Array of FollowedObject containing Topics
   */
  static async getFollowedTopics(): Promise<FollowedObject[]> {
    const followedObjects = await this.getFollowedObjects();

    // Filter for hub/topic objects that have valid topic data
    return followedObjects.filter((obj) => obj.type === 'HUB' && obj.data !== null);
  }

  /**
   * Follow multiple hubs/topics at once
   * @param hubIds Array of hub IDs to follow
   * @returns Response with followed, already following, and not found items
   */
  static async followMultipleHubs(hubIds: number[]): Promise<FollowMultipleResponse> {
    return await ApiClient.post<FollowMultipleResponse>(`${this.BASE_PATH}/follow_multiple/`, {
      ids: hubIds,
    });
  }
}
