import { ApiClient } from './client'
import { SearchSuggestion, transformSearchSuggestion } from '@/types/search'

export class SearchService {
  private static readonly BASE_PATH = '/api'

  static async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    const response = await ApiClient.get<any[]>(
      `${this.BASE_PATH}/paper/suggest/?q=${encodeURIComponent(query)}`
    )

    return response.map(transformSearchSuggestion);
  }
} 