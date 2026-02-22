import type { Work } from './work';
import { transformWork } from './work';
import { InputType, SearchStatus } from '@/services/expertFinder.service';

/** Single expert as displayed in the app (detail/list rows). */
export interface ExpertResult {
  name: string;
  title: string;
  affiliation: string;
  expertise: string;
  email: string;
  notes?: string;
  sources?: string[] | null;
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

function transformExpertResult(raw: Record<string, unknown>): ExpertResult {
  return {
    name: (raw.name ?? raw.first_name ?? raw.full_name ?? '') as string,
    title: (raw.title ?? raw.job_title ?? raw.position ?? '') as string,
    affiliation: (raw.affiliation ?? raw.organization ?? raw.institution ?? '') as string,
    expertise: (raw.expertise ?? raw.expertise_areas ?? '') as string,
    email: (raw.email ?? '') as string,
    notes: (raw.notes ?? raw.recommendation_notes) as string | undefined,
    sources: Array.isArray(raw.sources) ? (raw.sources as string[]) : null,
  };
}

export function transformExpertSearch(raw: Record<string, unknown>): ExpertSearchResult {
  return {
    searchId: (raw.search_id ?? raw.searchId ?? 0) as number,
    name: (raw.name ?? '') as string,
    query: (raw.query as string) || '',
    inputType: (raw.input_type as InputType) || 'abstract',
    config: (raw.config as Record<string, unknown>) || {},
    excludedExpertNames: Array.isArray(raw.excluded_expert_names) ? raw.excluded_expert_names : [],
    llmModel: (raw.llm_model as string) || '',
    status: (raw.status as SearchStatus) || 'pending',
    progress: (raw.progress as number) ?? 0,
    currentStep: (raw.current_step as string) || '',
    expertResults: Array.isArray(raw.expert_results)
      ? (raw.expert_results as Record<string, unknown>[]).map(transformExpertResult)
      : [],
    expertCount: (raw.expert_count as number) ?? 0,
    expertNames: Array.isArray(raw.expert_names) ? raw.expert_names : [],
    reportUrls: (raw.report_urls as ReportUrls | null) || null,
    reportPdfUrl: (raw.report_pdf_url as string) || '',
    reportCsvUrl: (raw.report_csv_url as string) || '',
    processingTime: (raw.processing_time as number | null) ?? null,
    errorMessage: (raw.error_message as string) || '',
    createdAt: (raw.created_at as string) || '',
    updatedAt: (raw.updated_at as string) || '',
    completedAt: (raw.completed_at as string | null) ?? null,
    work: raw.work ? transformWork(raw.work as Record<string, unknown>) : null,
  };
}

export function transformExpertSearchListItem(raw: Record<string, unknown>): ExpertSearchListItem {
  return {
    searchId: (raw.search_id ?? raw.searchId ?? 0) as number,
    name: (raw.name ?? '') as string,
    query: (raw.query as string) || '',
    status: (raw.status as SearchStatus) || 'pending',
    expertCount: (raw.expert_count as number) ?? 0,
    expertNames: Array.isArray(raw.expert_names) ? raw.expert_names : [],
    createdAt: (raw.created_at as string) || '',
    completedAt: (raw.completed_at as string | null) ?? null,
  };
}

export function transformExpertSearchCreateResponse(
  raw: Record<string, unknown>
): ExpertSearchCreated {
  return {
    searchId: (raw.search_id ?? raw.searchId ?? 0) as number,
    status: (raw.status as SearchStatus) || 'pending',
    message: (raw.message as string) || '',
    sseUrl: (raw.sse_url as string | null) ?? null,
  };
}

export function transformExpertSearchProgressEvent(
  raw: Record<string, unknown>
): ExpertSearchProgress {
  return {
    status: (raw.status as ExpertSearchProgress['status']) || 'pending',
    progress: (raw.progress as number) ?? undefined,
    currentStep: (raw.current_step ?? raw.currentStep) as string | undefined,
    taskType: (raw.task_type ?? raw.taskType) as string | undefined,
    taskId: (raw.task_id ?? raw.taskId) as string | undefined,
    error: raw.error as string | undefined,
  };
}

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
}

export interface GeneratedEmailListResponse {
  emails: GeneratedEmail[];
  total: number;
  limit: number;
  offset: number;
}

export function transformGeneratedEmail(raw: Record<string, unknown>): GeneratedEmail {
  return {
    id: (raw.id ?? 0) as number,
    expertSearch: (raw.expert_search ?? null) as number | null,
    expertName: (raw.expert_name ?? '') as string,
    expertTitle: (raw.expert_title ?? '') as string,
    expertAffiliation: (raw.expert_affiliation ?? '') as string,
    expertEmail: (raw.expert_email ?? '') as string,
    expertise: (raw.expertise ?? '') as string,
    emailSubject: (raw.email_subject ?? '') as string,
    emailBody: (raw.email_body ?? '') as string,
    template: (raw.template ?? '') as string,
    status: (raw.status ?? 'draft') as string,
    notes: (raw.notes ?? '') as string,
    createdAt: (raw.created_at as string) ?? '',
    updatedAt: (raw.updated_at as string) ?? '',
  };
}

// ── Saved templates (app-level, camelCase) ───────────────────────────────────

export interface SavedTemplate {
  id: number;
  createdBy: number;
  name: string;
  contactName: string;
  contactTitle: string;
  contactInstitution: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;
  outreachContext: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface SavedTemplateListResponse {
  templates: SavedTemplate[];
  total: number;
  limit: number;
  offset: number;
}

export function transformSavedTemplate(raw: Record<string, unknown>): SavedTemplate {
  return {
    id: (raw.id ?? 0) as number,
    createdBy: (raw.created_by ?? 0) as number,
    name: (raw.name ?? '') as string,
    contactName: (raw.contact_name ?? '') as string,
    contactTitle: (raw.contact_title ?? '') as string,
    contactInstitution: (raw.contact_institution ?? '') as string,
    contactEmail: (raw.contact_email ?? '') as string,
    contactPhone: (raw.contact_phone ?? '') as string,
    contactWebsite: (raw.contact_website ?? '') as string,
    outreachContext: (raw.outreach_context ?? '') as string,
    isActive: (raw.is_active ?? false) as boolean,
    createdDate: (raw.created_date as string) ?? '',
    updatedDate: (raw.updated_date as string) ?? '',
  };
}
