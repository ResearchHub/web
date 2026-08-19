import { Topic, transformTopicSuggestions, transformTopic } from '@/types/topic';
import { ApiClient } from './client';
import { createTransformer, BaseTransformed } from '@/types/transformer';

interface HubResponse {
  id: number;
  name: string;
  slug: string;
  hub_image?: string | null;
  description?: string;
  namespace?: string;
  category?: string;
  discussion_count?: number;
  paper_count?: number;
  subscriber_count?: number;
  is_locked?: boolean;
  is_removed?: boolean;
  is_used_for_rep?: boolean;
  editor_permission_groups?: any[];
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

interface PrimaryHubsResponse {
  count: number;
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
  imageUrl: hub.hub_image || undefined,
  description: hub.description,
}));

export class HubService {
  private static readonly BASE_PATH = '/api/hub';
  private static readonly SUGGEST_PATH = '/api/search/hubs/suggest';
  private static readonly PRIMARY_HUBS_PATH = '/api/hub/primary_only';

  static async suggestTopics(query: string, limit?: number): Promise<Topic[]> {
    const params = new URLSearchParams({
      name_suggest__completion: query,
    });

    // Add limit parameter if provided
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await ApiClient.get<any>(`${this.SUGGEST_PATH}/?${params.toString()}`);

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

  static async getHubBySlug(slug: string): Promise<Topic> {
    const response = await ApiClient.get<HubDetailResponse>(
      `${this.BASE_PATH}?slug=${encodeURIComponent(slug)}`
    );

    if (!response.results.length) {
      throw new Error(`Hub with slug "${slug}" not found`);
    }

    return transformTopic(response.results[0]);
  }

  static async getPrimaryHubs(): Promise<Topic[]> {
    const response = await ApiClient.getPublic<PrimaryHubsResponse>(this.PRIMARY_HUBS_PATH);
    return response.results.map(transformTopic);
  }
}
