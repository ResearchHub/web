import { ApiClient } from './client';
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
  private static readonly AUTHOR_PATH = '/api/author';

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
