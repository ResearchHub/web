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
   * Get IDs of all followed hubs
   * @returns Array of hub IDs
   */
  static async getFollowedHubIds(): Promise<number[]> {
    const response = await ApiClient.get<FollowResponse[]>(`${this.BASE_PATH}/following/`);
    return response.filter((item) => item.type === 'HUB').map((item) => item.object_id);
  }

  /**
   * Follow a hub/topic
   * @param hubId The ID of the hub to follow
   */
  static async followHub(hubId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${hubId}/follow/`);
  }

  /**
   * Unfollow a hub/topic
   * @param hubId The ID of the hub to unfollow
   */
  static async unfollowHub(hubId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${hubId}/unfollow/`);
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
