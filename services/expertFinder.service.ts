import { EXPERT_FINDER_LIST_PAGE_SIZE } from '@/app/expert-finder/lib/paginationParams';
import { ApiClient } from './client';
import { PaperService } from './paper.service';
import { PostService } from './post.service';
import {
  transformExpertResult,
  transformExpertSearch,
  transformExpertSearchCreateResponse,
  transformExpertSearchListItem,
  transformGeneratedEmail,
  transformOutreachCampaign,
  transformOutreachCapacity,
  transformOutreachMailbox,
  transformOutreachOAuthInitResponse,
  transformOutreachOAuthSession,
  transformSavedTemplate,
  transformInvitedExperts,
  transformProposalDraft,
  type ProposalDraft,
  type InvitedExperts,
  type ExpertResult,
  type ExpertSearchCreated,
  type ExpertSearchResult,
  type ExpertSearchListItem,
  type ExpertSearchListResponse,
  type GeneratedEmail,
  type GeneratedEmailListResponse,
  type OutreachCampaign,
  type OutreachCampaignCancelQueuedResponse,
  type OutreachCampaignListResponse,
  type OutreachCampaignPreviewRequest,
  type OutreachCampaignPreviewResponse,
  type OutreachCampaignSendResponse,
  transformOutreachCampaignPreviewResponse,
  type OutreachCapacity,
  type OutreachChannel,
  type OutreachMailbox,
  type OutreachMailboxUpdatePayload,
  type OutreachOAuthInitResponse,
  type OutreachOAuthProvider,
  type OutreachOAuthSession,
  type SavedTemplate,
  type SavedTemplateListResponse,
} from '@/types/expertFinder';
import type { ContentType, Work } from '@/types/work';
import { transformUnifiedDocument } from '@/types/work';
import { assertNever } from '@/utils/assertNever';
import { ApiError } from './types/api';

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

export const EXPERT_SEARCH_ADDITIONAL_CONTEXT_MAX_LENGTH = 10_000;

export function getRegionLabel(value: Region): string {
  return REGION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** Allowed `expert_count` values (API: 5–25). */
export const EXPERT_COUNT_OPTIONS = [5, 10, 25] as const;

export type ExpertCountOption = (typeof EXPERT_COUNT_OPTIONS)[number];

export function getExpertCountOptions(): readonly ExpertCountOption[] {
  return EXPERT_COUNT_OPTIONS;
}

/** Coerce a count into a valid option; default 10. */
export function clampExpertCount(count: unknown): ExpertCountOption {
  const n = Number(count);
  if ((EXPERT_COUNT_OPTIONS as readonly number[]).includes(n)) {
    return n as ExpertCountOption;
  }
  return 10;
}

export interface ExpertSearchCreatePayload {
  unified_document_id: number;
  input_type: InputType;
  name?: string;
  config: {
    expert_count: number;
    expertise_level: ExpertiseLevel[];
    region: Region;
    state: string;
  };
  additional_context?: string;
}

/** POST body for find-more on an existing search. */
export interface FindMoreExpertsPayload {
  expert_count?: number;
  additional_context?: string;
}

/** PATCH body for canonical expert (wire format, snake_case). */
export type PatchExpertPayload = Partial<{
  honorific: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  name_suffix: string;
  academic_title: string;
  affiliation: string;
  expertise: string;
  notes: string;
  email: string;
}>;

// ── Email template kind (purpose) ───────────────────

export type EmailTemplateKind =
  | 'collaboration'
  | 'consultation'
  | 'conference'
  | 'peer-review'
  | 'publication'
  | 'rfp-outreach'
  | 'proposal-draft-outreach'
  | 'custom';

/** Purpose that links a completed proposal draft and embeds a note invite link. */
export const PROPOSAL_DRAFT_OUTREACH_TEMPLATE: EmailTemplateKind = 'proposal-draft-outreach';

// ── Generated emails API ───────────────────────────────────────────────────

/** GeneratedEmail.status */
export const GENERATED_EMAIL_STATUS_VALUES = [
  'draft',
  'processing',
  'sending',
  'sent',
  'bounced',
  'failed',
  'send_failed',
  'complained',
  'closed',
] as const;

export type GeneratedEmailStatus = (typeof GENERATED_EMAIL_STATUS_VALUES)[number];

export interface GenerateEmailPayload {
  expert_search_id: number;
  expert_email: string;
  template?: string | null;
  template_id?: number | null;
  /** Requires template 'proposal-draft-outreach'; the draft must be completed. */
  proposal_draft_id?: number | null;
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
  channels?: OutreachChannel[];
}

export type UpdateGeneratedEmailPayload = Partial<CreateDraftEmailPayload>;

export interface AddExpertPayload {
  email: string;
  honorific?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  name_suffix?: string;
  academic_title?: string;
  affiliation?: string;
  expertise?: string;
  notes?: string;
}

export interface CreateSavedTemplatePayload {
  name: string;
  email_subject?: string;
  email_body?: string;
}

interface RawInviteApplicantsResponse {
  queued: number;
  skipped_existing: string[];
  generated_email_ids: number[];
}

export interface InviteApplicantsResponse {
  queued: number;
  skippedExisting: string[];
  generatedEmailIds: number[];
}

export interface UpdateSavedTemplatePayload {
  name?: string;
  email_subject?: string;
  email_body?: string;
}

export class ExpertFinderService {
  private static readonly BASE_PATH = '/api/research_ai/expert-finder';

  /**
   * Submit a new expert search.
   * POST /api/research_ai/expert-finder/searches/
   */
  static async createSearch(payload: ExpertSearchCreatePayload): Promise<ExpertSearchCreated> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/searches/`,
      payload
    );
    return transformExpertSearchCreateResponse(raw);
  }

  /**
   * Request additional experts for an existing search (appended when done).
   * POST /api/research_ai/expert-finder/searches/:searchId/find-more/
   */
  static async findMoreExperts(
    searchId: number | string,
    payload?: FindMoreExpertsPayload
  ): Promise<ExpertSearchCreated> {
    const body: Record<string, unknown> = {};
    if (payload?.expert_count != null) body.expert_count = payload.expert_count;
    if (payload && 'additional_context' in payload) {
      body.additional_context = payload.additional_context ?? '';
    }
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/searches/${searchId}/find-more/`,
      body
    );
    return transformExpertSearchCreateResponse(raw);
  }

  /**
   * Fetch full detail for a single expert search.
   * GET /api/research_ai/expert-finder/searches/:searchId/
   */
  static async getSearch(searchId: number | string): Promise<ExpertSearchResult> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/searches/${searchId}/`);
    return transformExpertSearch(response);
  }

  /**
   * Partial update of a canonical expert row.
   * PATCH /api/research_ai/expert-finder/experts/:expertId/
   */
  static async patchExpert(expertId: number | string, payload: PatchExpertPayload): Promise<void> {
    await ApiClient.patch<void>(`${this.BASE_PATH}/experts/${expertId}/`, payload);
  }

  /**
   * Manually add an expert to an existing search.
   * POST /api/research_ai/expert-finder/searches/:searchId/experts/
   */
  static async addExpert(
    searchId: number | string,
    payload: AddExpertPayload
  ): Promise<ExpertResult> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/searches/${searchId}/experts/`,
      payload
    );
    return transformExpertResult(raw);
  }

  /**
   * List the current user's expert searches with pagination.
   * GET /api/research_ai/expert-finder/searches/?limit=&offset=
   */
  static async listSearches(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ExpertSearchListResponse> {
    const limit = params?.limit ?? EXPERT_FINDER_LIST_PAGE_SIZE;
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
   * Fetch a work by unified document ID.
   */
  static async fetchWorkByUnifiedDocumentId(unifiedDocumentId: number): Promise<Work | null> {
    const response = await ApiClient.get<{ work: Record<string, unknown> | null }>(
      `${this.BASE_PATH}/work/${unifiedDocumentId}/`
    );
    if (!response.work) return null;
    return transformUnifiedDocument(response.work);
  }

  /**
   * Fetch invited experts for a unified document.
   * GET /api/research_ai/expert-finder/documents/:unifiedDocumentId/invited/
   */
  static async getDocumentInvited(unifiedDocumentId: number): Promise<InvitedExperts> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/documents/${unifiedDocumentId}/invited/`
    );
    return transformInvitedExperts(raw);
  }

  // ── Proposal drafts ──────────────────────────────────────────────────────

  /**
   * Kick off an AI proposal draft for one expert in a search.
   * POST /api/research_ai/expert-finder/proposal-drafts/
   */
  static async createProposalDraft(searchExpertId: number): Promise<ProposalDraft> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/proposal-drafts/`,
      { search_expert_id: searchExpertId }
    );
    return transformProposalDraft(raw);
  }

  /**
   * Fetch the current state of a proposal draft (used for polling).
   * GET /api/research_ai/expert-finder/proposal-drafts/:draftId/
   */
  static async getProposalDraft(draftId: number | string): Promise<ProposalDraft> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/proposal-drafts/${draftId}/`
    );
    return transformProposalDraft(raw);
  }

  /**
   * Start a proposal draft, attaching to the already-running one if the API
   * answers 409 with the active draft's id.
   */
  static async startProposalDraft(searchExpertId: number): Promise<ProposalDraft> {
    try {
      return await this.createProposalDraft(searchExpertId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const existingId = Number(
          (err.errors as Record<string, unknown> | undefined)?.proposal_draft_id
        );
        if (Number.isInteger(existingId) && existingId >= 1) {
          return this.getProposalDraft(existingId);
        }
      }
      throw err;
    }
  }

  // ── Generated emails ─────────────────────────────────────────────────────

  static async generateEmail(payload: GenerateEmailPayload): Promise<GeneratedEmail> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/generate-email/`,
      payload
    );
    return transformGeneratedEmail(raw);
  }

  static async listEmails(params?: {
    limit?: number;
    offset?: number;
    search_id?: number | string;
    campaign_id?: number | string;
    status?: string;
  }): Promise<GeneratedEmailListResponse> {
    const limit = params?.limit ?? EXPERT_FINDER_LIST_PAGE_SIZE;
    const offset = params?.offset ?? 0;
    const searchParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (params?.search_id != null && params.search_id !== '') {
      searchParams.set('search_id', String(params.search_id));
    }
    if (params?.campaign_id != null && params.campaign_id !== '') {
      searchParams.set('campaign_id', String(params.campaign_id));
    }
    if (params?.status != null && params.status.trim() !== '') {
      searchParams.set('status', params.status.trim());
    }
    const response = await ApiClient.get<{
      emails: Record<string, unknown>[];
      total: number;
      limit: number;
      offset: number;
    }>(`${this.BASE_PATH}/emails/?${searchParams.toString()}`);
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

  // ── Outreach mailboxes (Instantly) ───────────────────────────────────────

  static async listOutreachMailboxes(params?: {
    /** Moderator-only: all mailboxes (admin shape with editor/warmup fields). */
    scope?: 'all';
  }): Promise<OutreachMailbox[]> {
    const query = params?.scope === 'all' ? '?scope=all' : '';
    const response = await ApiClient.get<{ mailboxes: Record<string, unknown>[] }>(
      `${this.BASE_PATH}/outreach-mailboxes/${query}`
    );
    return Array.isArray(response.mailboxes)
      ? response.mailboxes.map((item) => transformOutreachMailbox(item))
      : [];
  }

  /**
   * Connect a personal Gmail mailbox via Google app password.
   * The app password is sent only in this request and is never returned or stored client-side.
   */
  static async connectOutreachMailbox(payload: {
    email: string;
    app_password: string;
    reply_to?: string;
  }): Promise<OutreachMailbox> {
    const body: Record<string, unknown> = {
      email: payload.email,
      app_password: payload.app_password,
    };
    if (payload.reply_to != null) body.reply_to = payload.reply_to;
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-mailboxes/`,
      body
    );
    return transformOutreachMailbox(raw);
  }

  /**
   * Update mailbox fields. `daily_limit` and `warmup_enabled` are moderator-only on the API.
   */
  static async updateOutreachMailbox(
    mailboxId: number | string,
    payload: OutreachMailboxUpdatePayload
  ): Promise<OutreachMailbox> {
    const raw = await ApiClient.patch<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-mailboxes/${mailboxId}/`,
      payload
    );
    return transformOutreachMailbox(raw);
  }

  static async detachOutreachMailbox(mailboxId: number | string): Promise<void> {
    return ApiClient.deleteNoContent(`${this.BASE_PATH}/outreach-mailboxes/${mailboxId}/`);
  }

  /**
   * Start Google Workspace OAuth for an outreach mailbox.
   * Returns a session id + auth URL; the browser should open auth_url and poll the session.
   */
  static async initOutreachOAuth(
    provider: OutreachOAuthProvider,
    payload?: { reply_to?: string }
  ): Promise<OutreachOAuthInitResponse> {
    const body: Record<string, unknown> = {};
    if (payload?.reply_to != null && payload.reply_to.trim() !== '') {
      body.reply_to = payload.reply_to.trim();
    }
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-mailboxes/oauth/${provider}/init/`,
      body
    );
    return transformOutreachOAuthInitResponse(raw);
  }

  /** Poll an in-flight outreach OAuth session until it reaches a terminal status. */
  static async pollOutreachOAuthSession(sessionId: string): Promise<OutreachOAuthSession> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-mailboxes/oauth/session/${encodeURIComponent(sessionId)}/`
    );
    return transformOutreachOAuthSession(raw);
  }

  static async getOutreachCapacity(): Promise<OutreachCapacity> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-capacity/`
    );
    return transformOutreachCapacity(raw);
  }

  // ── Saved templates ──────────────────────────────────────────────────────

  static async listTemplates(params?: {
    limit?: number;
    offset?: number;
  }): Promise<SavedTemplateListResponse> {
    const limit = params?.limit ?? EXPERT_FINDER_LIST_PAGE_SIZE;
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

  /**
   * Rewrite a shared template via Bedrock into a new EmailTemplate (placeholders preserved).
   * POST /api/research_ai/expert-finder/templates/<id>/rewrite/
   */
  static async rewriteTemplate(templateId: number | string): Promise<SavedTemplate> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/templates/${templateId}/rewrite/`
    );
    return transformSavedTemplate(raw);
  }

  /**
   * Publish a shared template into this editor's outreach campaign (idempotent upsert).
   * Requires a campaign name. Does not send leads.
   * POST /api/research_ai/expert-finder/templates/<id>/publish/
   */
  static async publishTemplate(
    templateId: number | string,
    payload: { name: string }
  ): Promise<OutreachCampaign> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/templates/${templateId}/publish/`,
      { name: payload.name.trim() }
    );
    return transformOutreachCampaign(raw);
  }

  // ── Outreach campaigns ───────────────────────────────────────────────────

  static async listOutreachCampaigns(params?: {
    limit?: number;
    offset?: number;
  }): Promise<OutreachCampaignListResponse> {
    const limit = params?.limit ?? EXPERT_FINDER_LIST_PAGE_SIZE;
    const offset = params?.offset ?? 0;
    const response = await ApiClient.get<{
      campaigns?: Record<string, unknown>[];
      total?: number;
      limit?: number;
      offset?: number;
    }>(`${this.BASE_PATH}/outreach-campaigns/?limit=${limit}&offset=${offset}`);
    const items = Array.isArray(response.campaigns) ? response.campaigns : [];
    return {
      campaigns: items.map((item) => transformOutreachCampaign(item)),
      total: response.total ?? items.length,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
    };
  }

  static async getOutreachCampaign(campaignId: number | string): Promise<OutreachCampaign | null> {
    const { campaigns } = await this.listOutreachCampaigns({ limit: 100, offset: 0 });
    const id = Number(campaignId);
    return campaigns.find((c) => c.id === id) ?? null;
  }

  /**
   * Activate (restore) a paused outreach campaign after reconnecting a mailbox.
   * POST /api/research_ai/expert-finder/outreach-campaigns/<id>/activate/
   * Requires ≥1 active mailbox; returns the updated campaign (200).
   */
  static async activateOutreachCampaign(campaignId: number | string): Promise<OutreachCampaign> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-campaigns/${campaignId}/activate/`,
      {}
    );
    return transformOutreachCampaign(raw);
  }

  /**
   * Queue selected experts onto a published campaign.
   * POST /api/research_ai/expert-finder/outreach-campaigns/<id>/send/
   * 202: { emails, queued }. Capacity does not gate; Instantly drips over days.
   */
  static async sendOutreachCampaign(
    campaignId: number | string,
    payload: { expert_search_id: number; expert_ids: number[] }
  ): Promise<OutreachCampaignSendResponse> {
    const raw = await ApiClient.post<{
      emails?: Record<string, unknown>[];
      queued?: number;
    }>(`${this.BASE_PATH}/outreach-campaigns/${campaignId}/send/`, payload);
    return {
      emails: Array.isArray(raw.emails)
        ? raw.emails.map((item) => transformGeneratedEmail(item))
        : [],
      queued: raw.queued ?? 0,
    };
  }

  /**
   * Cancel pending-delivery leads on a campaign (status=sending only).
   * POST /api/research_ai/expert-finder/outreach-campaigns/<id>/cancel-queued/
   */
  static async cancelQueuedOutreachCampaign(
    campaignId: number | string,
    payload: { generated_email_ids: number[] }
  ): Promise<OutreachCampaignCancelQueuedResponse> {
    const raw = await ApiClient.post<{
      cancelled?: number;
      skipped_ids?: number[];
      emails?: Record<string, unknown>[];
    }>(`${this.BASE_PATH}/outreach-campaigns/${campaignId}/cancel-queued/`, payload);
    return {
      cancelled: raw.cancelled ?? 0,
      skippedIds: Array.isArray(raw.skipped_ids)
        ? raw.skipped_ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
        : [],
      emails: Array.isArray(raw.emails)
        ? raw.emails.map((item) => transformGeneratedEmail(item))
        : [],
    };
  }

  /**
   * Send an Instantly test email for a published campaign (no GeneratedEmail / lead).
   * POST /api/research_ai/expert-finder/outreach-campaigns/<id>/preview/
   */
  static async previewOutreachCampaign(
    campaignId: number | string,
    payload: OutreachCampaignPreviewRequest
  ): Promise<OutreachCampaignPreviewResponse> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${this.BASE_PATH}/outreach-campaigns/${campaignId}/preview/`,
      payload
    );
    return transformOutreachCampaignPreviewResponse(raw);
  }

  // ── RFP applicant invitations ────────────────────────────────────────────

  /**
   * Create draft invitation emails for RFP applicants (does not send via Instantly).
   * POST /api/research_ai/expert-finder/rfp/:grantId/invite-applicants/
   */
  static async inviteApplicants(
    grantId: string | number,
    params: { emails: string[] }
  ): Promise<InviteApplicantsResponse> {
    const response = await ApiClient.post<RawInviteApplicantsResponse>(
      `${this.BASE_PATH}/rfp/${grantId}/invite-applicants/`,
      { emails: params.emails }
    );
    return {
      queued: response.queued ?? 0,
      skippedExisting: response.skipped_existing ?? [],
      generatedEmailIds: response.generated_email_ids ?? [],
    };
  }
}
