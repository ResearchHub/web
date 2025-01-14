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

export type SuggestionSource = 'api' | 'recent'

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
  // Additional fields for recent suggestions
  isRecent?: boolean
  lastVisited?: string
  slug?: string
}

export interface RecentPageView {
  id: number
  title: string
  doi?: string
  authors: string[]
  lastVisited: string
  slug: string
}

export function transformSearchSuggestion(raw: any, source: SuggestionSource = 'api'): SearchSuggestion {
  if (source === 'recent') {
    return {
      entityType: 'work',
      doi: raw.doi || '',
      displayName: raw.title,
      authors: raw.authors,
      score: 0,
      citations: 0,
      source: '',
      openalexId: '',
      id: raw.id,
      isRecent: true,
      lastVisited: raw.lastVisited,
      slug: raw.slug
    }
  }

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
    isRecent: false
  }
} 