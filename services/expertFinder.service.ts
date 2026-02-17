import { ApiClient } from './client';
import { PaperService } from './paper.service';
import { PostService } from './post.service';
import type {
  ExpertSearchListResponse,
  ExpertiseLevel,
  Region,
  Gender,
  InputType,
} from '@/types/expertFinder';
import {
  transformExpertSearch,
  transformExpertSearchCreateResponse,
  transformExpertSearchListItem,
  type ExpertSearchCreated,
  type ExpertSearchResult,
  type ExpertSearchListItem,
} from '@/types/expertFinder';
import type { ContentType } from '@/types/work';
import { assertNever } from '@/utils/assertNever';

export interface ExpertSearchCreatePayload {
  unified_document_id?: number | null;
  query?: string;
  input_type?: InputType;
  config: {
    expert_count: number;
    expertise_level: ExpertiseLevel[];
    region: Region;
    state: string;
    gender: Gender;
  };
  excluded_expert_names?: string[];
}

export class ExpertFinderService {
  private static readonly BASE_PATH = '/api/research_ai/expert-finder';

  /**
   * Submit a new expert search.
   * POST /api/research_ai/expert-finder/search/
   */
  static async createSearch(payload: ExpertSearchCreatePayload): Promise<ExpertSearchCreated> {
    const raw = await ApiClient.post<Record<string, unknown>>(`${this.BASE_PATH}/search/`, payload);
    return transformExpertSearchCreateResponse(raw);
  }

  /**
   * Fetch full detail for a single expert search.
   * GET /api/research_ai/expert-finder/search/:searchId/
   */
  static async getSearch(searchId: number | string): Promise<ExpertSearchResult> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/search/${searchId}/`);
    return transformExpertSearch(response);
  }

  /**
   * List the current user's expert searches with pagination.
   * GET /api/research_ai/expert-finder/searches/?limit=&offset=
   */
  static async listSearches(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ExpertSearchListResponse> {
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;

    const response = await ApiClient.get<any>(
      `${this.BASE_PATH}/searches/?limit=${limit}&offset=${offset}`
    );

    return {
      searches: Array.isArray(response.searches)
        ? response.searches.map(
            (item: any): ExpertSearchListItem => transformExpertSearchListItem(item)
          )
        : [],
      total: response.total ?? 0,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
    };
  }

  /**
   * Open an authenticated SSE stream for expert search progress.
   *
   * @param searchId – expert search id
   * @param signal – optional AbortSignal to cancel the request
   * @returns Response with response.body as ReadableStream (SSE)
   */
  static openProgressStream(searchId: number | string, signal?: AbortSignal): Promise<Response> {
    return ApiClient.getStream(`${this.BASE_PATH}/progress/${searchId}/`, {
      signal,
    });
  }

  /**
   * Resolves a content type + document ID to a unified document ID.
   * Fetches the document via PaperService (paper) or PostService (all other types)
   * and returns its unifiedDocumentId. Exhaustive on ContentType (assertNever in default).
   *
   * @throws {Error} if the document cannot be fetched or has no unified document ID
   */
  static async resolveUnifiedDocumentId(
    contentType: ContentType,
    documentId: string
  ): Promise<number> {
    let unifiedDocumentId: number | null | undefined;

    try {
      switch (contentType) {
        case 'paper': {
          const work = await PaperService.get(documentId);
          unifiedDocumentId = work.unifiedDocumentId;
          break;
        }
        case 'post':
        case 'question':
        case 'discussion':
        case 'preregistration':
        case 'funding_request': {
          const work = await PostService.get(documentId);
          unifiedDocumentId = work.unifiedDocumentId;
          break;
        }
        default: {
          assertNever(contentType, true);
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Could not load the document (${contentType}/${documentId}). ${detail}`);
    }

    if (!unifiedDocumentId) {
      throw new Error(`Could not resolve unified document ID for ${contentType}/${documentId}`);
    }

    return unifiedDocumentId;
  }
}
