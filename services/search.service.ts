import { ApiClient } from './client';
import {
  SearchSuggestion,
  transformSearchSuggestion,
  EntityType,
  AuthorSuggestion,
} from '@/types/search';
import { transformAuthorSuggestions } from '@/types/search';

export class SearchService {
  private static readonly BASE_PATH = '/api';
  private static readonly PEOPLE_SUGGEST_PATH = '/api/search/people/suggest';

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

  static async suggestPeople(query: string): Promise<AuthorSuggestion[]> {
    const response = await ApiClient.get<any>(
      `${this.PEOPLE_SUGGEST_PATH}/?suggestion_phrases__completion=${encodeURIComponent(query)}`
    );

    return transformAuthorSuggestions(response);
  }
}
