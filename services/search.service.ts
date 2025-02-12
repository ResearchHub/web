import { ApiClient } from './client';
import { SearchSuggestion, transformSearchSuggestion, EntityType } from '@/types/search';

export class SearchService {
  private static readonly BASE_PATH = '/api';

  static async getSuggestions(
    query: string,
    indices?: EntityType | EntityType[]
  ): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams({ q: query });
    if (indices) {
      const indexParam = Array.isArray(indices) ? indices.join(',') : indices;
      params.append('index', indexParam);
    }

    const response = await ApiClient.get<any[]>(
      `${this.BASE_PATH}/search/suggest/?${params.toString()}`
    );

    return response.map(transformSearchSuggestion);
  }
}
