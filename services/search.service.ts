import { ApiClient } from './client';
import {
  SearchSuggestion,
  transformSearchSuggestion,
  EntityType,
  AuthorSuggestion,
  UserSuggestion,
  mapUserSuggestionToAuthorSuggestion,
} from '@/types/search';
import {
  transformInstitutions,
  type Institution,
  type InstitutionSuggestionsResponse,
} from '@/types/institution';

export class SearchService {
  private static readonly BASE_PATH = '/api';
  private static readonly INSTITUTIONS_SUGGEST_PATH = '/api/search/institutions/suggest';
  private static readonly DEFAULT_INDICES: EntityType[] = ['user', 'post'];

  static async getSuggestions(
    query: string,
    indices?: EntityType | EntityType[],
    limit?: number,
    externalSearch?: boolean
  ): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams({ q: query });

    // Use provided indices or default to all
    const indicesToUse = indices || this.DEFAULT_INDICES;
    const indexParam = Array.isArray(indicesToUse) ? indicesToUse.join(',') : indicesToUse;
    params.append('index', indexParam);

    // Add limit parameter if provided
    if (limit) {
      params.append('limit', limit.toString());
    }

    if (externalSearch) {
      params.append('enable_openalex', 'true');
    }

    const response = await ApiClient.get<any[]>(
      `${this.BASE_PATH}/search/suggest/?${params.toString()}`
    );

    return response.map(transformSearchSuggestion);
  }

  static async suggestPeople(query: string): Promise<AuthorSuggestion[]> {
    const suggestions = await this.getSuggestions(query, 'user');

    return suggestions
      .filter(
        (s): s is UserSuggestion => (s.entityType === 'user' || s.entityType === 'author') && !!s.id
      )
      .map(mapUserSuggestionToAuthorSuggestion);
  }

  static async suggestInstitutions(query: string): Promise<Institution[]> {
    const response = await ApiClient.get<InstitutionSuggestionsResponse>(
      `${this.INSTITUTIONS_SUGGEST_PATH}/?suggestion_phrases__completion=${encodeURIComponent(query)}`
    );

    return transformInstitutions(response);
  }
}
