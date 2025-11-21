import { ApiClient } from './client';
import {
  SearchSuggestion,
  transformSearchSuggestion,
  EntityType,
  AuthorSuggestion,
  SearchResponse,
  ApiDocumentSearchResult,
  PersonSearchResult,
  SearchFilters,
  SearchSortOption,
} from '@/types/search';
import { transformAuthorSuggestions } from '@/types/search';
import { transformTopic } from '@/types/topic';
import { Institution } from '@/app/paper/create/components/InstitutionAutocomplete';
import { FeedEntry, transformFeedEntry } from '@/types/feed';
import { SearchResult } from '@/types/searchResult';
import { highlightSearchTerms, hasHighlights } from '@/components/Search/lib/searchHighlight';

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

export interface FullSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
  filters?: SearchFilters;
  sortBy?: SearchSortOption;
}

export interface FullSearchResponse {
  entries: SearchResult[];
  people: PersonSearchResult[];
  count: number;
  aggregations: any;
  hasMore: boolean;
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
    indices?: EntityType | EntityType[],
    limit?: number
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

    const response = await ApiClient.get<any[]>(
      `${this.BASE_PATH}/search/suggest/?${params.toString()}`
    );

    return response.map(transformSearchSuggestion);
  }

  static async fullSearch(params: FullSearchParams): Promise<FullSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.query);
    searchParams.append('page', (params.page || 1).toString());
    searchParams.append('page_size', (params.pageSize || 20).toString());

    // Always use relevance for backend sorting - frontend will handle other sorts
    searchParams.append('sort', 'relevance');

    // Add filters if provided
    if (params.filters) {
      if (params.filters.contentTypes && params.filters.contentTypes.length > 0) {
        searchParams.append('content_types', params.filters.contentTypes.join(','));
      }

      if (params.filters.yearMin !== undefined) {
        searchParams.append('year_min', params.filters.yearMin.toString());
      }

      if (params.filters.yearMax !== undefined) {
        searchParams.append('year_max', params.filters.yearMax.toString());
      }
    }

    const response = await ApiClient.get<SearchResponse | { error?: string }>(
      `${this.BASE_PATH}/search/?${searchParams.toString()}`
    );

    // If backend returns an error payload, throw to be handled by caller
    if ((response as any)?.error) {
      throw new Error((response as any).error || 'Search failed');
    }

    const resp = response as SearchResponse;

    // Transform documents to SearchResult format
    const documents = Array.isArray(resp.documents) ? resp.documents : [];
    const entries: SearchResult[] = documents.map((doc) =>
      this.transformSearchResult(doc, params.query)
    );

    const hasMore = !!resp.next;

    return {
      entries,
      people: Array.isArray(resp.people) ? resp.people : [],
      count: resp.count || 0,
      aggregations: resp.aggregations,
      hasMore,
    };
  }

  private static transformSearchResult(doc: ApiDocumentSearchResult, query: string): SearchResult {
    // First transform to a clean FeedEntry
    const feedEntry = this.transformDocumentToFeedEntry(doc);

    // Strip HTML tags from snippet and title for plain text, handle null values
    const plainSnippet = doc.snippet
      ? doc.snippet.replace(/<mark>/g, '').replace(/<\/mark>/g, '')
      : '';
    const plainTitle = doc.title ? doc.title.replace(/<mark>/g, '').replace(/<\/mark>/g, '') : '';

    // Check if the snippet contains highlighting
    const snippetHasHighlight = doc.snippet ? hasHighlights(doc.snippet) : false;
    const titleHasHighlight = doc.title ? hasHighlights(doc.title) : false;

    // Initialize highlight fields
    let highlightedTitle: string | undefined;
    let highlightedSnippet: string | undefined;

    // If title itself has highlighting, use it
    if (titleHasHighlight && doc.title) {
      highlightedTitle = doc.title;
      // Also highlight the abstract if it doesn't already have highlights
      if (!snippetHasHighlight && plainSnippet) {
        highlightedSnippet = highlightSearchTerms(plainSnippet, query);
      }
    }
    // Otherwise if matched_field is title, use snippet for title
    else if (doc.matched_field === 'title' && snippetHasHighlight && doc.snippet) {
      highlightedTitle = doc.snippet;
      // Also try to highlight the abstract
      if (plainSnippet && plainSnippet !== plainTitle) {
        highlightedSnippet = highlightSearchTerms(plainSnippet, query);
      }
    }

    // If snippet has highlighting and matched_field is not title, use it for content
    if (snippetHasHighlight && doc.matched_field !== 'title' && doc.snippet) {
      highlightedSnippet = doc.snippet;
      // Also try to highlight the title if it doesn't already have highlights
      if (!titleHasHighlight && plainTitle) {
        highlightedTitle = highlightSearchTerms(plainTitle, query);
      }
    }

    // If we still don't have any highlights, try to highlight based on the query
    if (!highlightedTitle && plainTitle) {
      highlightedTitle = highlightSearchTerms(plainTitle, query);
    }
    if (!highlightedSnippet && plainSnippet) {
      highlightedSnippet = highlightSearchTerms(plainSnippet, query);
    }

    return {
      entry: feedEntry,
      highlightedTitle,
      highlightedSnippet,
      matchedField: doc.matched_field,
    };
  }

  private static transformDocumentToFeedEntry(doc: ApiDocumentSearchResult): FeedEntry {
    // Strip HTML tags from snippet and title for plain text, handle null values
    const plainSnippet = doc.snippet
      ? doc.snippet.replace(/<mark>/g, '').replace(/<\/mark>/g, '')
      : '';
    const plainTitle = doc.title ? doc.title.replace(/<mark>/g, '').replace(/<\/mark>/g, '') : '';

    // Use structured author objects from API - no more string splitting!
    const firstAuthor = doc.authors && doc.authors.length > 0 ? doc.authors[0] : null;

    // Create a mock RawApiFeedEntry structure that can be transformed by transformFeedEntry
    const mockRawEntry = {
      id: doc.id,
      recommendation_id: null,
      content_type: doc.type === 'paper' ? 'PAPER' : 'RESEARCHHUBPOST',
      content_object: {
        id: doc.id,
        title: plainTitle,
        abstract: plainSnippet,
        slug: doc.slug || '',
        created_date: doc.created_date || doc.paper_publish_date || new Date().toISOString(),
        authors: (doc.authors || []).map((author) => ({
          first_name: author.first_name || '',
          last_name: author.last_name || '',
          profile_image: '',
        })),
        hub: doc.hubs && doc.hubs.length > 0 ? doc.hubs[0] : null,
        journal: null,
        doi: doc.doi,
        citations: doc.citations || 0,
        score: doc.score || 0,
        hot_score: doc.hot_score || 0,
        unified_document_id: doc.unified_document_id?.toString() || doc.id.toString(),
      },
      created_date: doc.created_date || doc.paper_publish_date || new Date().toISOString(),
      action: 'publish',
      action_date: doc.created_date || doc.paper_publish_date || new Date().toISOString(),
      author: {
        id: 0,
        first_name: firstAuthor?.first_name || 'Unknown',
        last_name: firstAuthor?.last_name || 'Author',
        profile_image: '',
      },
      metrics: {
        votes: doc.score || 0,
        comments: 0,
      },
    };

    return transformFeedEntry(mockRawEntry);
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
