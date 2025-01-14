import { ApiClient } from './client'
import { SearchSuggestion, SearchSuggestionResponse } from './types/search.dto'

export class SearchService {
  private static readonly BASE_PATH = '/api'

  static async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    const response = await ApiClient.get<SearchSuggestionResponse[]>(
      `${this.BASE_PATH}/paper/suggest/?q=${encodeURIComponent(query)}`
    )

    console.log('Raw API response:', response)
    const transformed = response.map((item: SearchSuggestionResponse) => ({
      entityType: item.entity_type,
      doi: item.doi,
      displayName: item.display_name,
      authors: item.authors,
      score: item._score,
      citations: item.citations,
      source: item.source,
      openalexId: item.openalex_id,
      id: item.id,
      isRecent: false
    }))
    console.log('Transformed suggestions:', transformed)
    return transformed
  }
} 