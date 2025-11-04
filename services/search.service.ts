import { ApiClient } from './client';
import {
  SearchSuggestion,
  transformSearchSuggestion,
  EntityType,
  AuthorSuggestion,
  OpenSearchResponse,
  OpenSearchDocument,
  OpenSearchPerson,
  SearchFilters,
  SearchSortOption,
} from '@/types/search';
import { transformAuthorSuggestions } from '@/types/search';
import { transformTopic } from '@/types/topic';
import { Institution } from '@/app/paper/create/components/InstitutionAutocomplete';
import { FeedEntry, transformFeedEntry } from '@/types/feed';
import { highlightSearchTerms, hasHighlights } from '@/utils/searchHighlight';

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

  static async fullSearch(params: {
    query: string;
    page?: number;
    pageSize?: number;
    filters?: SearchFilters;
    sortBy?: SearchSortOption;
  }): Promise<{
    entries: FeedEntry[];
    people: OpenSearchPerson[];
    count: number;
    aggregations: any;
    hasMore: boolean;
  }> {
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

      if (params.filters.citationMin !== undefined) {
        searchParams.append('citation_min', params.filters.citationMin.toString());
      }

      if (params.filters.openAccess !== undefined) {
        searchParams.append('open_access', params.filters.openAccess.toString());
      }

      if (params.filters.hubs && params.filters.hubs.length > 0) {
        searchParams.append('hubs', params.filters.hubs.join(','));
      }
    }

    const response = await ApiClient.get<OpenSearchResponse | { error?: string }>(
      `${this.BASE_PATH}/search/?${searchParams.toString()}`
    );

    // If backend returns an error payload, throw to be handled by caller
    if ((response as any)?.error) {
      throw new Error((response as any).error || 'Search failed');
    }

    const resp = response as OpenSearchResponse;

    // Transform documents to FeedEntry format, passing the query for highlighting
    const documents = Array.isArray(resp.documents) ? resp.documents : [];
    const entries: FeedEntry[] = documents.map((doc) =>
      this.transformDocumentToFeedEntry(doc, params.query)
    );

    // Calculate hasMore based on count and current page
    const currentPage = params.page || 1;
    const pageSize = params.pageSize || 20;
    const hasMore = currentPage * pageSize < (resp?.count || 0);

    return {
      entries,
      people: Array.isArray(resp.people) ? resp.people : [],
      count: resp.count || 0,
      aggregations: resp.aggregations,
      hasMore,
    };
  }

  private static transformDocumentToFeedEntry(doc: OpenSearchDocument, query: string): FeedEntry {
    // Strip HTML tags from snippet and title for plain text, handle null values
    const plainSnippet = doc.snippet
      ? doc.snippet.replace(/<mark>/g, '').replace(/<\/mark>/g, '')
      : '';
    const plainTitle = doc.title ? doc.title.replace(/<mark>/g, '').replace(/<\/mark>/g, '') : '';

    // Check if the snippet contains highlighting
    const snippetHasHighlight = doc.snippet ? hasHighlights(doc.snippet) : false;
    const titleHasHighlight = doc.title ? hasHighlights(doc.title) : false;

    // Create a mock RawApiFeedEntry structure that can be transformed by transformFeedEntry
    const mockRawEntry = {
      id: doc.id,
      content_type: doc.type === 'paper' ? 'PAPER' : 'RESEARCHHUBPOST',
      content_object: {
        id: doc.id,
        title: plainTitle,
        abstract: plainSnippet,
        slug: doc.slug || '',
        created_date: doc.created_date || doc.paper_publish_date || new Date().toISOString(),
        authors: (doc.authors || []).map((name) => ({
          first_name: name.split(' ')[0] || '',
          last_name: name.split(' ').slice(1).join(' ') || '',
          profile_image: '',
        })),
        hub: doc.hubs && doc.hubs.length > 0 ? doc.hubs[0] : null,
        journal: null,
        doi: doc.doi,
        citations: doc.citations || 0,
        score: doc.score || 0,
        hot_score: doc.hot_score || 0,
        unified_document_id: doc.id.toString(),
      },
      created_date: doc.created_date || doc.paper_publish_date || new Date().toISOString(),
      action: 'publish',
      action_date: doc.created_date || doc.paper_publish_date || new Date().toISOString(),
      author: {
        id: 0,
        first_name: doc.authors[0]?.split(' ')[0] || 'Unknown',
        last_name: doc.authors[0]?.split(' ').slice(1).join(' ') || 'Author',
        profile_image: '',
      },
      metrics: {
        votes: doc.score || 0,
        comments: 0,
      },
    };

    const feedEntry = transformFeedEntry(mockRawEntry);

    // Add highlight fields to the transformed content
    if (feedEntry.content && 'title' in feedEntry.content) {
      const content = feedEntry.content as any;

      // If title itself has highlighting, use it
      if (titleHasHighlight && doc.title) {
        content.highlightedTitle = doc.title;
        // Also highlight the abstract if it doesn't already have highlights
        if (!snippetHasHighlight && plainSnippet) {
          content.highlightedSnippet = highlightSearchTerms(plainSnippet, query);
        }
      }
      // Otherwise if matched_field is title, use snippet for title
      else if (doc.matched_field === 'title' && snippetHasHighlight && doc.snippet) {
        content.highlightedTitle = doc.snippet;
        // Also try to highlight the abstract
        if (plainSnippet && plainSnippet !== plainTitle) {
          content.highlightedSnippet = highlightSearchTerms(plainSnippet, query);
        }
      }

      // If snippet has highlighting and matched_field is not title, use it for content
      if (snippetHasHighlight && doc.matched_field !== 'title' && doc.snippet) {
        content.highlightedSnippet = doc.snippet;
        // Also try to highlight the title if it doesn't already have highlights
        if (!titleHasHighlight && plainTitle) {
          content.highlightedTitle = highlightSearchTerms(plainTitle, query);
        }
      }

      // If we still don't have any highlights, try to highlight based on the query
      if (!content.highlightedTitle && plainTitle) {
        content.highlightedTitle = highlightSearchTerms(plainTitle, query);
      }
      if (!content.highlightedSnippet && plainSnippet) {
        content.highlightedSnippet = highlightSearchTerms(plainSnippet, query);
      }

      // Always include the matched field info
      content.matchedField = doc.matched_field;
    }

    return feedEntry;
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
