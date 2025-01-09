import { ApiClient } from './client'
import type { SearchSuggestionResponse } from './types/search.dto'

export class SearchService {
  private static readonly BASE_PATH = '/api'

  static async getSuggestions(query: string) {
    return ApiClient.get<SearchSuggestionResponse[]>(
      `${this.BASE_PATH}/paper/suggest/?q=${encodeURIComponent(query)}`
    )
  }
} 