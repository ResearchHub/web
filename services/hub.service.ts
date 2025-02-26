import { Topic, transformTopicSuggestions } from '@/types/topic';
import { ApiClient } from './client';
import { createTransformer, BaseTransformed } from '@/types/transformer';

interface HubResponse {
  id: number;
  name: string;
  slug: string;
  hub_image?: string;
  description?: string;
}

interface GetHubsOptions {
  namespace?: 'journal';
  excludeJournals?: boolean;
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

interface HubDetailResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HubResponse[];
}

export interface Hub {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

export type TransformedHub = Hub & BaseTransformed;

// Transform the API response to our internal Hub model
export const transformHub = createTransformer<HubResponse, Hub>((hub) => ({
  id: hub.id,
  name: hub.name,
  slug: hub.slug,
  imageUrl: hub.hub_image,
  description: hub.description,
}));

export class HubService {
  private static readonly BASE_PATH = '/api/hub';
  private static readonly SUGGEST_PATH = '/api/search/hubs/suggest';

  static async getHubs(options: GetHubsOptions = {}): Promise<Hub[]> {
    const params = new URLSearchParams({
      ordering: '-paper_count',
    });
    if (options.namespace) {
      params.append('namespace', options.namespace);
    }
    if (options.excludeJournals) {
      params.append('exclude_journals', 'true');
    }

    const response = await ApiClient.get<HubsApiResponse>(
      `${this.BASE_PATH}/?${params.toString()}`
    );
    return response.results.map(transformHub);
  }

  static async suggestTopics(query: string): Promise<Topic[]> {
    const response = await ApiClient.get<any>(
      `${this.SUGGEST_PATH}/?name_suggest__completion=${encodeURIComponent(query)}`
    );

    return transformTopicSuggestions(response);
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

  static async getHubBySlug(slug: string): Promise<Hub> {
    const response = await ApiClient.get<HubDetailResponse>(
      `${this.BASE_PATH}?slug=${encodeURIComponent(slug)}`
    );

    if (!response.results.length) {
      throw new Error(`Hub with slug "${slug}" not found`);
    }

    return transformHub(response.results[0]);
  }
}
