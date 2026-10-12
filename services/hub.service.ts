import { Topic, transformTopicSuggestions } from '@/types/topic';
import { ApiClient } from './client';

export class HubService {
  private static readonly SUGGEST_PATH = '/api/search/hubs/suggest';

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
}
