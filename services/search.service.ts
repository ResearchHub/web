import { ApiClient } from './client';
import {
  SearchSuggestion,
  transformSearchSuggestion,
  EntityType,
  AuthorSuggestion,
} from '@/types/search';
import { transformAuthorSuggestions } from '@/types/search';
import { transformTopic } from '@/types/topic';
import { Institution } from '@/app/paper/create/components/InstitutionAutocomplete';

export interface InstitutionResponse {
  id: number;
  display_name: string;
  city?: string;
  region?: string;
  country_code?: string;
  h_index?: number;
  works_count?: number;
  image_url?: string;
  image_thumbnail_url?: string;
}

export const transformInstitution = (response: any): Institution => {
  return {
    id: response.id,
    name: response.display_name,
    location: [response.city, response.region, response.country_code].filter(Boolean).join(', '),
    hIndex: response.h_index,
    worksCount: response.works_count,
    imageUrl: response.image_url,
    imageThumbnailUrl: response.image_thumbnail_url,
  };
};

export const transformInstitutions = (response: any): Institution[] => {
  const institutions: Institution[] = [];

  if (
    response.suggestion_phrases__completion &&
    response.suggestion_phrases__completion.length > 0
  ) {
    const suggestions = response.suggestion_phrases__completion[0].options || [];

    suggestions.forEach((suggestion: any) => {
      if (suggestion._source) {
        institutions.push(transformInstitution(suggestion._source));
      }
    });
  }

  return institutions;
};

export class SearchService {
  private static readonly BASE_PATH = '/api';
  private static readonly PEOPLE_SUGGEST_PATH = '/api/search/people/suggest';
  private static readonly INSTITUTIONS_SUGGEST_PATH = '/api/search/institutions/suggest';
  private static readonly DEFAULT_INDICES: EntityType[] = ['hub', 'paper', 'user', 'post'];

  static async getSuggestions(
    query: string,
    indices?: EntityType | EntityType[]
  ): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams({ q: query });

    // Use provided indices or default to all
    const indicesToUse = indices || this.DEFAULT_INDICES;
    const indexParam = Array.isArray(indicesToUse) ? indicesToUse.join(',') : indicesToUse;
    params.append('index', indexParam);

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

  static async suggestInstitutions(query: string): Promise<Institution[]> {
    const response = await ApiClient.get<any>(
      `${this.INSTITUTIONS_SUGGEST_PATH}/?suggestion_phrases__completion=${encodeURIComponent(query)}`
    );

    return transformInstitutions(response);
  }
}
