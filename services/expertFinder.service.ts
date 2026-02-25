import { ApiClient } from './client';
import { PaperService } from './paper.service';
import { PostService } from './post.service';
import {
  transformExpertSearch,
  transformExpertSearchCreateResponse,
  transformExpertSearchListItem,
  transformGeneratedEmail,
  transformSavedTemplate,
  type ExpertSearchCreated,
  type ExpertSearchResult,
  type ExpertSearchListItem,
  type ExpertSearchListResponse,
  type GeneratedEmail,
  type GeneratedEmailListResponse,
  type SavedTemplate,
  type SavedTemplateListResponse,
} from '@/types/expertFinder';
import type { ContentType, Work } from '@/types/work';
import { transformUnifiedDocument } from '@/types/work';
import { assertNever } from '@/utils/assertNever';

// ── API enum values and display labels ─────────────

export type ExpertiseLevel =
  | 'all_levels'
  | 'phd_postdocs'
  | 'early_career'
  | 'mid_career'
  | 'top_expert';

export type Region = 'all_regions' | 'us' | 'non_us' | 'europe' | 'asia_pacific' | 'africa_mena';

export type SearchStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type InputType = 'abstract' | 'pdf' | 'full_content';

export const EXPERTISE_LEVEL_ALL = 'all_levels' as const;

export const EXPERTISE_LEVEL_OPTIONS: { value: ExpertiseLevel; label: string }[] = [
  { value: 'all_levels', label: 'All Levels' },
  { value: 'phd_postdocs', label: 'PhD/PostDocs' },
  { value: 'early_career', label: 'Early Career Researchers' },
  { value: 'mid_career', label: 'Mid-Career Researchers' },
  { value: 'top_expert', label: 'Top Expert/World Renowned Expert' },
];

export const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: 'all_regions', label: 'All Regions' },
  { value: 'us', label: 'US' },
  { value: 'non_us', label: 'non-US' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia_pacific', label: 'Asia-Pacific' },
  { value: 'africa_mena', label: 'Africa & MENA' },
];

export const DEFAULT_REGION: Region = 'all_regions';

export function getExpertiseLevelLabel(value: ExpertiseLevel): string {
  return EXPERTISE_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getRegionLabel(value: Region): string {
  return REGION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export interface ExpertSearchCreatePayload {
  unified_document_id?: number | null;
  query?: string;
  input_type?: InputType;
  name?: string;
  config: {
    expert_count: number;
    expertise_level: ExpertiseLevel[];
    region: Region;
    state: string;
  };
  excluded_expert_names?: string[];
}

// ── Email template kind (purpose) ───────────────────

export type EmailTemplateKind =
  | 'collaboration'
  | 'consultation'
  | 'conference'
  | 'peer-review'
  | 'publication'
  | 'rfp-outreach'
  | 'custom';

// ── Generated emails API ───────────────────────────────────────────────────

export type GeneratedEmailStatus = 'draft' | 'sent';

export interface TemplateData {
  contact_name?: string;
  contact_title?: string;
  contact_institution?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
}

export interface GenerateEmailPayload {
  expert_name: string;
  template: string;
  expert_title?: string;
  expert_affiliation?: string;
  expert_email?: string;
  expertise?: string;
  notes?: string;
  expert_search_id?: number | null;
  outreach_context?: string;
  template_data?: TemplateData;
  template_id?: number | null;
}

export interface CreateDraftEmailPayload {
  expert_search?: number | null;
  expert_name?: string;
  expert_title?: string;
  expert_affiliation?: string;
  expert_email?: string;
  expertise?: string;
  email_subject?: string;
  email_body?: string;
  template?: string;
  status?: GeneratedEmailStatus;
  notes?: string;
}

export type UpdateGeneratedEmailPayload = Partial<CreateDraftEmailPayload>;

// ── Saved templates API ─────────────────────────────────────────────────────

export interface CreateSavedTemplatePayload {
  name: string;
  contact_name?: string;
  contact_title?: string;
  contact_institution?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  outreach_context?: string;
}

export interface UpdateSavedTemplatePayload {
  name?: string;
  contact_name?: string;
  contact_title?: string;
  contact_institution?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  outreach_context?: string;
  is_active?: boolean;
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
   * Fetches a work by content type and document ID (for preview, etc.).
   *
   * @throws {Error} if the document cannot be fetched
   */
  static async fetchWork(contentType: ContentType, documentId: string): Promise<Work> {
    switch (contentType) {
      case 'paper': {
        return PaperService.get(documentId);
      }
      case 'post':
      case 'question':
      case 'discussion':
      case 'preregistration':
      case 'funding_request': {
        return PostService.get(documentId);
      }
      default: {
        assertNever(contentType, true);
      }
    }
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

  /**
   * Fetch a work by unified document ID.
   */
  static async fetchWorkByUnifiedDocumentId(unifiedDocumentId: number): Promise<Work | null> {
    const response = await ApiClient.get<{ work: Record<string, unknown> | null }>(
      `${this.BASE_PATH}/work/${unifiedDocumentId}/`
    );
    if (!response.work) return null;
    return transformUnifiedDocument(response.work);
  }

  // ── Generated emails ─────────────────────────────────────────────────────

  static async generateEmail(
    payload: GenerateEmailPayload,
    options?: { save?: boolean; action?: 'generate' }
  ): Promise<any | GeneratedEmail> {
    const preview = options?.save === false || options?.action === 'generate';
    const query = preview
      ? `?${options?.action === 'generate' ? 'action=generate' : 'save=false'}`
      : '';
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/generate-email/${query}`,
      payload
    );
    if (preview) {
      return {
        subject: (raw.subject as string) ?? '',
        body: (raw.body as string) ?? '',
      };
    }
    return transformGeneratedEmail(raw);
  }

  static async listEmails(params?: {
    limit?: number;
    offset?: number;
  }): Promise<GeneratedEmailListResponse> {
    const limit = Math.min(params?.limit ?? 20, 100);
    const offset = params?.offset ?? 0;
    const response = await ApiClient.get<{
      emails: Record<string, unknown>[];
      total: number;
      limit: number;
      offset: number;
    }>(`${this.BASE_PATH}/emails/?limit=${limit}&offset=${offset}`);
    return {
      emails: Array.isArray(response.emails)
        ? response.emails.map((item) => transformGeneratedEmail(item))
        : [],
      total: response.total ?? 0,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
    };
  }

  static async getEmail(emailId: number | string): Promise<GeneratedEmail> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/emails/${emailId}/`
    );
    return transformGeneratedEmail(raw);
  }

  static async createDraftEmail(payload: CreateDraftEmailPayload = {}): Promise<GeneratedEmail> {
    const raw = await ApiClient.post<Record<string, unknown>>(`${this.BASE_PATH}/emails/`, payload);
    return transformGeneratedEmail(raw);
  }

  static async updateEmail(
    emailId: number | string,
    payload: UpdateGeneratedEmailPayload
  ): Promise<GeneratedEmail> {
    const raw = await ApiClient.patch<Record<string, unknown>>(
      `${this.BASE_PATH}/emails/${emailId}/`,
      payload
    );
    return transformGeneratedEmail(raw);
  }

  static async deleteEmail(emailId: number | string): Promise<void> {
    return ApiClient.deleteNoContent(`${this.BASE_PATH}/emails/${emailId}/`);
  }

  // ── Saved templates ──────────────────────────────────────────────────────

  static async listTemplates(params?: {
    limit?: number;
    offset?: number;
  }): Promise<SavedTemplateListResponse> {
    const limit = Math.min(params?.limit ?? 20, 100);
    const offset = params?.offset ?? 0;
    const response = await ApiClient.get<{
      templates: Record<string, unknown>[];
      total: number;
      limit: number;
      offset: number;
    }>(`${this.BASE_PATH}/templates/?limit=${limit}&offset=${offset}`);
    return {
      templates: Array.isArray(response.templates)
        ? response.templates.map((item) => transformSavedTemplate(item))
        : [],
      total: response.total ?? 0,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
    };
  }

  static async getTemplate(templateId: number | string): Promise<SavedTemplate> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/templates/${templateId}/`
    );
    return transformSavedTemplate(raw);
  }

  static async createTemplate(payload: CreateSavedTemplatePayload): Promise<SavedTemplate> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/templates/`,
      payload
    );
    return transformSavedTemplate(raw);
  }

  static async updateTemplate(
    templateId: number | string,
    payload: UpdateSavedTemplatePayload
  ): Promise<SavedTemplate> {
    const raw = await ApiClient.patch<Record<string, unknown>>(
      `${this.BASE_PATH}/templates/${templateId}/`,
      payload
    );
    return transformSavedTemplate(raw);
  }

  static async deleteTemplate(templateId: number | string): Promise<void> {
    return ApiClient.deleteNoContent(`${this.BASE_PATH}/templates/${templateId}/`);
  }
}
