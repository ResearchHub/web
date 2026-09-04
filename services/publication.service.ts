import { ApiClient } from './client';
import { transformPublicationsResponse, PublicationSearchResponse } from '@/types/publication';
import { ID } from '@/types/root';
import { ApiError } from './types';

export class PublicationError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'PublicationError';
  }
}

export interface PublicationSearchParams {
  doi: string;
  authorId?: string | null;
}

export interface AddPublicationsParams {
  authorId: string;
  openAlexPublicationIds: string[];
  openAlexAuthorId: string;
}

export interface GetAuthorPublicationsParams {
  authorId: ID;
  nextUrl?: string | null;
}

export interface AuthorPublicationsResponse {
  results: any[];
  count: number;
  next: string | null;
  previous: string | null;
}

export class PublicationService {
  private static readonly BASE_PATH = '/api/paper';
  private static readonly AUTHOR_PATH = '/api/author';

  /**
   * Search for publications by DOI and optionally filter by author
   * @throws {PublicationError} When the request fails or parameters are invalid
   */
  static async searchPublications(
    params: PublicationSearchParams
  ): Promise<PublicationSearchResponse> {
    const { doi, authorId } = params;

    if (!doi) {
      throw new PublicationError('Missing DOI parameter', 'INVALID_PARAMS');
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('doi', doi);
      if (authorId) {
        queryParams.append('author_id', authorId);
      }

      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/fetch_publications_by_doi?${queryParams.toString()}`
      );
      return transformPublicationsResponse(response);
    } catch (error) {
      console.log(error);
      if (error instanceof ApiError && error.status === 404) {
        throw new PublicationError('DOI not found', 'DOI_NOT_FOUND');
      }

      throw new PublicationError(
        'Failed to search publications',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Add publications to the user's profile
   * @throws {PublicationError} When the request fails or parameters are invalid
   */
  static async addPublications(params: AddPublicationsParams): Promise<void> {
    if (!params.openAlexPublicationIds || params.openAlexPublicationIds.length === 0) {
      throw new PublicationError('No publication IDs provided', 'INVALID_PARAMS');
    }

    if (!params.openAlexAuthorId || !params.authorId) {
      throw new PublicationError('No author ID provided', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.post(`${this.AUTHOR_PATH}/${params.authorId}/publications/`, {
        openalex_ids: params.openAlexPublicationIds,
        openalex_author_id: params.openAlexAuthorId,
      });
    } catch (error) {
      throw new PublicationError(
        'Failed to add publications',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Fetches publications for a specific author
   * @param params - Parameters for fetching author publications
   * @throws {PublicationError} When the request fails or parameters are invalid
   */
  static async getAuthorPublications(
    params: GetAuthorPublicationsParams
  ): Promise<AuthorPublicationsResponse> {
    try {
      const url = params.nextUrl || `${this.AUTHOR_PATH}/${params.authorId}/publications`;

      const response = await ApiClient.get<any>(url);

      if (!response || !Array.isArray(response.results)) {
        throw new PublicationError('Invalid response format', 'INVALID_RESPONSE');
      }

      return {
        results: response.results,
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      };
    } catch (error) {
      if (error instanceof PublicationError) {
        throw error;
      }

      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to fetch author publications';
      throw new PublicationError(errorMsg);
    }
  }

  /**
   * Loads the next page of author publications if available
   * @param currentResponse - The current response containing the next page URL
   * @throws {PublicationError} When the request fails or no next page is available
   */
  static async loadMoreAuthorPublications(
    currentResponse: AuthorPublicationsResponse
  ): Promise<AuthorPublicationsResponse> {
    if (!currentResponse.next) {
      throw new PublicationError('No more publications available', 'NO_MORE_RESULTS');
    }

    try {
      const response = await ApiClient.get<any>(currentResponse.next);

      if (!response || !Array.isArray(response.results)) {
        throw new PublicationError('Invalid response format', 'INVALID_RESPONSE');
      }

      return {
        results: response.results,
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      };
    } catch (error) {
      if (error instanceof PublicationError) {
        throw error;
      }

      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to load more publications';
      throw new PublicationError(errorMsg);
    }
  }
}
