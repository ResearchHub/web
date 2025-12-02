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
import { highlightSearchTerms, hasHighlights } from '@/components/Search/lib/searchHighlight';
import { stripHtml } from '@/utils/stringUtils';

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
  entries: FeedEntry[];
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
    searchParams.append('page_size', (params.pageSize || 40).toString());

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

    // Transform documents to FeedEntry format with searchMetadata
    const documents = Array.isArray(resp.documents) ? resp.documents : [];
    const entries: FeedEntry[] = documents.map((doc) =>
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

  private static stripHighlightTags(text: string | null | undefined): string {
    if (!text) return '';
    return text.replaceAll('<mark>', '').replaceAll('</mark>', '');
  }

  private static processTitleHighlights(
    doc: ApiDocumentSearchResult,
    plainSnippet: string,
    query: string
  ): { highlightedTitle?: string; highlightedSnippet?: string } {
    const titleHasHighlight = doc.title ? hasHighlights(doc.title) : false;
    const snippetHasHighlight = doc.snippet ? hasHighlights(doc.snippet) : false;

    if (titleHasHighlight && doc.title) {
      return {
        highlightedTitle: doc.title,
        highlightedSnippet:
          !snippetHasHighlight && plainSnippet
            ? highlightSearchTerms(plainSnippet, query)
            : undefined,
      };
    }

    return {};
  }

  private static processSnippetAsTitle(
    doc: ApiDocumentSearchResult,
    plainSnippet: string,
    plainTitle: string,
    query: string
  ): { highlightedTitle?: string; highlightedSnippet?: string } {
    const snippetHasHighlight = doc.snippet ? hasHighlights(doc.snippet) : false;

    if (doc.matched_field === 'title' && snippetHasHighlight && doc.snippet) {
      return {
        highlightedTitle: doc.snippet,
        highlightedSnippet:
          plainSnippet && plainSnippet !== plainTitle
            ? highlightSearchTerms(plainSnippet, query)
            : undefined,
      };
    }

    return {};
  }

  private static processSnippetHighlights(
    doc: ApiDocumentSearchResult,
    plainTitle: string,
    query: string
  ): { highlightedTitle?: string; highlightedSnippet?: string } {
    const snippetHasHighlight = doc.snippet ? hasHighlights(doc.snippet) : false;
    const titleHasHighlight = doc.title ? hasHighlights(doc.title) : false;

    if (snippetHasHighlight && doc.matched_field !== 'title' && doc.snippet) {
      return {
        highlightedSnippet: doc.snippet,
        highlightedTitle:
          !titleHasHighlight && plainTitle ? highlightSearchTerms(plainTitle, query) : undefined,
      };
    }

    return {};
  }

  private static applyFallbackHighlights(
    plainTitle: string,
    plainSnippet: string,
    query: string,
    existingTitle?: string,
    existingSnippet?: string
  ): { highlightedTitle?: string; highlightedSnippet?: string } {
    return {
      highlightedTitle:
        existingTitle || (plainTitle ? highlightSearchTerms(plainTitle, query) : undefined),
      highlightedSnippet:
        existingSnippet || (plainSnippet ? highlightSearchTerms(plainSnippet, query) : undefined),
    };
  }

  /**
   * Extends highlighted snippet with additional abstract content if available
   */
  private static extendHighlightedSnippet(
    highlightedSnippet: string,
    plainSnippet: string,
    fullAbstract: string,
    query: string
  ): string {
    const highlightedPlainText = stripHtml(highlightedSnippet);
    const highlightedLength = highlightedPlainText.length;

    // Try to find where the snippet appears in the full abstract
    const abstractLower = fullAbstract.toLowerCase();
    const snippetLower = highlightedPlainText.toLowerCase();
    const snippetIndex = abstractLower.indexOf(snippetLower);

    // If snippet not found or already full length, return original
    if (snippetIndex < 0 || highlightedLength >= fullAbstract.length) {
      return highlightedSnippet;
    }

    // Found the snippet in abstract, extend it
    const endOfSnippet = snippetIndex + highlightedLength;
    const remainingAbstract = fullAbstract.slice(endOfSnippet).trim();

    if (!remainingAbstract || remainingAbstract.length === 0) {
      return highlightedSnippet;
    }

    // Extend up to a reasonable length (e.g., 500 chars total for search results)
    const maxExtendedLength = 500;
    const remainingLength = maxExtendedLength - highlightedLength;

    if (remainingLength <= 0) {
      return highlightedSnippet;
    }

    // Truncate remaining abstract and add highlights for search terms
    const additionalText = remainingAbstract.slice(0, remainingLength);
    const highlightedAdditional = highlightSearchTerms(additionalText, query);

    return highlightedSnippet + ' ' + highlightedAdditional;
  }

  private static transformSearchResult(doc: ApiDocumentSearchResult, query: string): FeedEntry {
    // First transform to a clean FeedEntry
    const feedEntry = this.transformDocumentToFeedEntry(doc);

    // Strip HTML tags from snippet and title for plain text, handle null values
    const plainSnippet = this.stripHighlightTags(doc.snippet);
    const plainTitle = this.stripHighlightTags(doc.title);

    // Process highlights in priority order
    const titleResult = this.processTitleHighlights(doc, plainSnippet, query);
    const snippetAsTitleResult = titleResult.highlightedTitle
      ? {}
      : this.processSnippetAsTitle(doc, plainSnippet, plainTitle, query);
    const snippetResult =
      titleResult.highlightedTitle || snippetAsTitleResult.highlightedTitle
        ? {}
        : this.processSnippetHighlights(doc, plainTitle, query);

    // Combine results
    const combined = {
      ...titleResult,
      ...snippetAsTitleResult,
      ...snippetResult,
    };

    // Apply fallback highlights if needed
    const final = this.applyFallbackHighlights(
      plainTitle,
      plainSnippet,
      query,
      combined.highlightedTitle,
      combined.highlightedSnippet
    );

    // Extend highlighted snippet with full abstract if available and longer
    let extendedSnippet = final.highlightedSnippet;
    if (final.highlightedSnippet) {
      // Get the full abstract - prefer doc.abstract (new field), then textPreview
      const fullAbstract =
        doc.abstract || ('textPreview' in feedEntry.content ? feedEntry.content.textPreview : null);

      if (fullAbstract && fullAbstract.length > plainSnippet.length) {
        extendedSnippet = this.extendHighlightedSnippet(
          final.highlightedSnippet,
          plainSnippet,
          fullAbstract,
          query
        );
      }
    }

    // Return FeedEntry with searchMetadata
    return {
      ...feedEntry,
      searchMetadata: {
        highlightedTitle: final.highlightedTitle,
        highlightedSnippet: extendedSnippet,
        matchedField: doc.matched_field,
      },
    };
  }

  /**
   * Maps search authors to feed entry author format
   */
  private static mapSearchAuthorsToContentAuthors(
    authors: ApiDocumentSearchResult['authors']
  ): Array<{ first_name: string; last_name: string; profile_image: string }> {
    return (authors || []).map((author) => ({
      first_name: author.first_name || '',
      last_name: author.last_name || '',
      profile_image: '',
    }));
  }

  /**
   * Gets the earliest available date from multiple sources
   */
  private static getEarliestDate(...dates: (string | null | undefined)[]): string {
    const validDate = dates.find((d): d is string => !!d);
    return validDate || new Date().toISOString();
  }

  private static transformDocumentToFeedEntry(doc: ApiDocumentSearchResult): FeedEntry {
    // Strip HTML tags from snippet and title for plain text, handle null values
    const plainSnippet = this.stripHighlightTags(doc.snippet);
    const plainTitle = this.stripHighlightTags(doc.title);

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
        // Use doc.abstract (new field) if available, otherwise fall back to plainSnippet
        abstract: doc.abstract || plainSnippet,
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
