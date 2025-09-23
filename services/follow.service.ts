import { ApiClient } from './client';
import { FollowResponse, FollowedObject, transformFollowedObject } from '@/types/follow';
import { Topic } from '@/types/topic';

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
   * Get only followed topics/hubs
   * @returns Array of Topic objects that the user is following
   */
  static async getFollowedTopics(): Promise<Topic[]> {
    const followedObjects = await this.getFollowedObjects();

    // Filter for hub/topic objects and extract the Topic data
    return followedObjects
      .filter((obj) => obj.type === 'HUB')
      .map((obj) => obj.data as Topic)
      .filter((topic) => topic !== null);
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
}
