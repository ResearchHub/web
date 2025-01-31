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

export interface Hub {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

export class HubService {
  private static readonly BASE_PATH = '/api/hub';
  private static readonly SEARCH_PATH = '/api/search/hub';

  static async getHubs(): Promise<Hub[]> {
    const response = await ApiClient.get<HubsApiResponse>(`${this.SEARCH_PATH}/`);
    return response.results.map((hub) => ({
      id: hub.id,
      name: hub.name,
      slug: hub.slug,
      imageUrl: hub.hub_image,
      description: hub.description,
    }));
  }

  static async followHub(hubId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${hubId}/follow/`);
  }

  static async unfollowHub(hubId: number): Promise<void> {
    await ApiClient.post(`${this.BASE_PATH}/${hubId}/unfollow/`);
  }
}
