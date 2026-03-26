import type { Work } from './work';
import { transformUnifiedDocument, transformWork } from './work';
import { createTransformer } from './transformer';
import { InputType, SearchStatus, type SavedTemplateType } from '@/services/expertFinder.service';
import type { AuthorProfile } from './authorProfile';
import { transformAuthorProfile } from './authorProfile';

export interface CreatedByInfo {
  userId: number;
  author: AuthorProfile | null;
}

function transformCreatedBy(raw: any): CreatedByInfo | null {
  if (!raw) return null;
  const userId = raw.user_id ?? 0;
  const author = raw.author ? transformAuthorProfile(raw.author) : null;

  return { userId, author };
}

export interface ExpertSourceLink {
  url: string;
  text: string;
}

/** Single expert as displayed in the app (detail/list rows). */
export interface ExpertResult {
  name: string;
  title: string;
  affiliation: string;
  expertise: string;
  email: string;
  notes?: string;
  sources?: ExpertSourceLink[] | null;
}

export interface ReportUrls {
  pdf?: string;
  csv?: string;
}

/** Full search detail as used by the app (detail page, etc.). */
export interface ExpertSearchResult {
  searchId: number;
  name: string;
  query: string;
  inputType: InputType;
  config: Record<string, unknown>;
  excludedExpertNames: string[];
  llmModel: string;
  status: SearchStatus;
  progress: number;
  currentStep: string;
  expertResults: ExpertResult[];
  expertCount: number;
  expertNames: string[];
  reportUrls: ReportUrls | null;
  reportPdfUrl: string;
  reportCsvUrl: string;
  processingTime: number | null;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  work: Work | null;
  createdBy: CreatedByInfo | null;
}

/** Search list item as used by the app (library table, etc.). */
export interface ExpertSearchListItem {
  searchId: number;
  name: string;
  query: string;
  status: SearchStatus;
  expertCount: number;
  expertNames: string[];
  createdAt: string;
  completedAt: string | null;
  createdBy: CreatedByInfo | null;
}

/** List response shape as consumed by the app. */
export interface ExpertSearchListResponse {
  searches: ExpertSearchListItem[];
  total: number;
  limit: number;
  offset: number;
}

/** Result of creating an expert search. */
export interface ExpertSearchCreated {
  searchId: number;
  status: SearchStatus;
  message: string;
  sseUrl: string | null;
}

/** SSE progress event. */
export interface ExpertSearchProgress {
  status: SearchStatus | 'connected';
  progress?: number;
  currentStep?: string;
  taskType?: string;
  taskId?: string;
  error?: string;
}

function transformExpertSource(raw: string | Record<string, unknown>): ExpertSourceLink | null {
  if (typeof raw === 'string') {
    const url = raw.trim();
    if (!url) return null;
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      return { url, text: host || 'Source' };
    } catch {
      return { url, text: 'Source' };
    }
  }
  const url = String(raw?.url ?? '').trim();
  if (!url) return null;
  const text = String(raw?.text ?? '').trim() || 'Source';
  return { url, text };
}

function transformExpertResult(raw: any): ExpertResult {
  const sourcesRaw = Array.isArray(raw.sources) ? raw.sources : null;
  const sources = sourcesRaw
    ? sourcesRaw
        .map((item: unknown) => transformExpertSource(item as string | Record<string, unknown>))
        .filter((s: ExpertSourceLink | null): s is ExpertSourceLink => s !== null)
    : null;

  return {
    name: raw.name ?? raw.first_name ?? raw.full_name ?? '',
    title: raw.title ?? raw.job_title ?? raw.position ?? '',
    affiliation: raw.affiliation ?? raw.organization ?? raw.institution ?? '',
    expertise: raw.expertise ?? raw.expertise_areas ?? '',
    email: raw.email ?? '',
    notes: raw.notes ?? raw.recommendation_notes,
    sources: sources?.length ? sources : null,
  };
}

export const transformExpertSearch = createTransformer<any, ExpertSearchResult>((raw) => ({
  searchId: raw.search_id ?? raw.searchId ?? 0,
  name: raw.name ?? '',
  query: raw.query ?? '',
  inputType: raw.input_type ?? 'abstract',
  config: raw.config ?? {},
  excludedExpertNames: Array.isArray(raw.excluded_expert_names) ? raw.excluded_expert_names : [],
  llmModel: raw.llm_model ?? '',
  status: raw.status ?? 'pending',
  progress: raw.progress ?? 0,
  currentStep: raw.current_step ?? '',
  expertResults: Array.isArray(raw.expert_results)
    ? raw.expert_results.map(transformExpertResult)
    : [],
  expertCount: raw.expert_count ?? 0,
  expertNames: Array.isArray(raw.expert_names) ? raw.expert_names : [],
  reportUrls: raw.report_urls ?? null,
  reportPdfUrl: raw.report_pdf_url ?? '',
  reportCsvUrl: raw.report_csv_url ?? '',
  processingTime: raw.processing_time ?? null,
  errorMessage: raw.error_message ?? '',
  createdAt: raw.created_at ?? '',
  updatedAt: raw.updated_at ?? '',
  completedAt: raw.completed_at ?? null,
  work: raw.work ? transformUnifiedDocument(raw.work) : null,
  createdBy: transformCreatedBy(raw.created_by),
}));

export const transformExpertSearchListItem = createTransformer<any, ExpertSearchListItem>(
  (raw) => ({
    searchId: raw.search_id ?? raw.searchId ?? 0,
    name: raw.name ?? '',
    query: raw.query ?? '',
    status: raw.status ?? 'pending',
    expertCount: raw.expert_count ?? 0,
    expertNames: Array.isArray(raw.expert_names) ? raw.expert_names : [],
    createdAt: raw.created_at ?? '',
    completedAt: raw.completed_at ?? null,
    createdBy: transformCreatedBy(raw.created_by),
  })
);

export const transformExpertSearchCreateResponse = createTransformer<any, ExpertSearchCreated>(
  (raw) => ({
    searchId: raw.search_id ?? raw.searchId ?? 0,
    status: raw.status ?? 'pending',
    message: raw.message ?? '',
    sseUrl: raw.sse_url ?? null,
  })
);

export const transformExpertSearchProgressEvent = createTransformer<any, ExpertSearchProgress>(
  (raw) => ({
    status: raw.status ?? 'pending',
    progress: raw.progress,
    currentStep: raw.current_step ?? raw.currentStep,
    taskType: raw.task_type ?? raw.taskType,
    taskId: raw.task_id ?? raw.taskId,
    error: raw.error,
  })
);

// ── Generated emails (app-level, camelCase) ─────────────────────────────────

export interface GeneratedEmail {
  id: number;
  expertSearch: number | null;
  expertName: string;
  expertTitle: string;
  expertAffiliation: string;
  expertEmail: string;
  expertise: string;
  emailSubject: string;
  emailBody: string;
  template: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedByInfo | null;
}

export interface GeneratedEmailListResponse {
  emails: GeneratedEmail[];
  total: number;
  limit: number;
  offset: number;
}

export const transformGeneratedEmail = createTransformer<any, GeneratedEmail>((raw) => ({
  id: raw.id ?? 0,
  expertSearch: raw.expert_search ?? null,
  expertName: raw.expert_name ?? '',
  expertTitle: raw.expert_title ?? '',
  expertAffiliation: raw.expert_affiliation ?? '',
  expertEmail: raw.expert_email ?? '',
  expertise: raw.expertise ?? '',
  emailSubject: raw.email_subject ?? '',
  emailBody: raw.email_body ?? '',
  template: raw.template ?? '',
  status: raw.status ?? 'draft',
  notes: raw.notes ?? '',
  createdAt: raw.created_at ?? '',
  updatedAt: raw.updated_at ?? '',
  createdBy: transformCreatedBy(raw.created_by),
}));

// ── Document invited experts (app-level, camelCase) ───────────────────────────

export interface InvitedExpert {
  author: AuthorProfile;
  expertSearchId: number;
  generatedEmailId: number;
  invitedAt?: string;
}

export interface InvitedExperts {
  unifiedDocumentId: number;
  invited: InvitedExpert[];
  totalCount: number;
}

export const transformInvitedExpert = createTransformer<any, InvitedExpert>((raw) => ({
  author: transformAuthorProfile(raw.author),
  expertSearchId: raw.expert_search_id ?? raw.expertSearchId ?? 0,
  generatedEmailId: raw.generated_email_id ?? raw.generatedEmailId ?? 0,
  invitedAt: raw.invited_at ?? raw.created_at,
}));

export const transformInvitedExperts = createTransformer<any, InvitedExperts>((raw) => ({
  unifiedDocumentId: raw.unified_document_id ?? raw.unifiedDocumentId ?? 0,
  invited: Array.isArray(raw.invited)
    ? raw.invited.map((item: any) => transformInvitedExpert(item))
    : [],
  totalCount: raw.total_count ?? raw.totalCount ?? 0,
}));

// ── Saved templates (app-level, camelCase) ───────────────────────────────────

export interface SavedTemplate {
  id: number;
  createdBy: CreatedByInfo | null;
  name: string;
  templateType: SavedTemplateType;
  contactName: string;
  contactTitle: string;
  contactInstitution: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;
  outreachContext: string;
  emailSubject: string;
  emailBody: string;
  createdDate: string;
  updatedDate: string;
}

export interface SavedTemplateListResponse {
  templates: SavedTemplate[];
  total: number;
  limit: number;
  offset: number;
}

export const transformSavedTemplate = createTransformer<any, SavedTemplate>((raw) => ({
  id: raw.id ?? 0,
  createdBy: transformCreatedBy(raw.created_by),
  name: raw.name ?? '',
  templateType: raw.template_type ?? 'prompt-context',
  contactName: raw.contact_name ?? '',
  contactTitle: raw.contact_title ?? '',
  contactInstitution: raw.contact_institution ?? '',
  contactEmail: raw.contact_email ?? '',
  contactPhone: raw.contact_phone ?? '',
  contactWebsite: raw.contact_website ?? '',
  outreachContext: raw.outreach_context ?? '',
  emailSubject: raw.email_subject ?? '',
  emailBody: raw.email_body ?? '',
  createdDate: raw.created_date ?? '',
  updatedDate: raw.updated_date ?? '',
}));
