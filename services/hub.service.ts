import { transformTopic } from '@/types/topic';
import { ApiClient } from './client';

interface HubResponse {
  id: number;
  name: string;
  slug: string;
  hub_image?: string;
  description?: string;
}

interface HubsApiResponse {
  results: HubResponse[];
}

interface FollowResponse {
  id: number;
  content_type: string;
  type: string;
  object_id: number;
  created_date: string;
  updated_date: string;
}

export interface Hub {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

export class HubService {
  private static readonly BASE_PATH = '/api/hub';
  private static readonly SUGGEST_PATH = '/api/search/hubs/suggest';

  static async getHubs(namespace?: 'journal'): Promise<Hub[]> {
    const params = new URLSearchParams({
      ordering: '-paper_count',
    });
    if (namespace) {
      params.append('namespace', namespace);
    }

    const response = await ApiClient.get<HubsApiResponse>(
      `${this.BASE_PATH}/?${params.toString()}`
    );
    return response.results.map((hub) => transformTopic(hub));
  }

  static async suggestHubs(query: string): Promise<Hub[]> {
    const response = await ApiClient.get<HubsApiResponse>(
      `${this.SUGGEST_PATH}/?name_suggest__completion=${encodeURIComponent(query)}`
    );
    return response.results.map((hub) => ({
      id: hub.id,
      name: hub.name,
      slug: hub.slug,
      imageUrl: hub.hub_image,
      description: hub.description,
    }));
  }

  static async getFollowedHubs(): Promise<number[]> {
    const response = await ApiClient.get<FollowResponse[]>(`${this.BASE_PATH}/following/`);
    return response.map((follow) => follow.object_id);
  }

  static async followHub(hubId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${hubId}/follow/`);
  }

  static async unfollowHub(hubId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${hubId}/unfollow/`);
  }
}
