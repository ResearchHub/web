export interface SearchSuggestionResponse {
  entity_type: string
  doi: string
  display_name: string
  authors: string[]
  _score: number
  citations: number
  source: string
  openalex_id: string
  id?: number
}

export interface SearchSuggestion {
  entityType: string
  doi: string
  displayName: string
  authors: string[]
  score: number
  citations: number
  source: string
  openalexId: string
  id?: number
}

export function transformSearchSuggestion(raw: any): SearchSuggestion {
  return {
    entityType: raw.entity_type,
    doi: raw.doi,
    displayName: raw.display_name,
    authors: raw.authors,
    score: raw._score,
    citations: raw.citations,
    source: raw.source,
    openalexId: raw.openalex_id,
    id: raw.id,
  }
} 