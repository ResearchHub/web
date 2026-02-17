// ── Enums (matching Django TextChoices; used in UI) ───────────────────────────

export type ExpertiseLevel =
  | 'PhD/PostDocs'
  | 'Early Career Researchers'
  | 'Mid-Career Researchers'
  | 'Top Expert/World Renowned Expert'
  | 'All Levels';

export type Region = 'US' | 'non-US' | 'Europe' | 'Asia-Pacific' | 'Africa & MENA' | 'All Regions';

export type Gender = 'Male' | 'Female' | 'All Genders';

export type SearchStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type InputType = 'abstract' | 'pdf' | 'custom_query' | 'full_content';

/** Form and UI config (camelCase); used in components. */
export interface ExpertSearchConfig {
  expertCount: number;
  expertiseLevel: ExpertiseLevel;
  region: Region;
  state: string;
  gender: Gender;
}

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
}

/** Search list item as used by the app (library table, etc.). */
export interface ExpertSearchListItem {
  searchId: number;
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

export function transformExpertSearch(raw: Record<string, unknown>): ExpertSearchResult {
  return {
    searchId: (raw.search_id ?? raw.searchId ?? 0) as number,
    query: (raw.query as string) || '',
    inputType: (raw.input_type as InputType) || 'abstract',
    config: (raw.config as Record<string, unknown>) || {},
    excludedExpertNames: Array.isArray(raw.excluded_expert_names) ? raw.excluded_expert_names : [],
    llmModel: (raw.llm_model as string) || '',
    status: (raw.status as SearchStatus) || 'pending',
    progress: (raw.progress as number) ?? 0,
    currentStep: (raw.current_step as string) || '',
    expertResults: Array.isArray(raw.expert_results) ? raw.expert_results : [],
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
  };
}

export function transformExpertSearchListItem(raw: Record<string, unknown>): ExpertSearchListItem {
  return {
    searchId: (raw.search_id ?? raw.searchId ?? 0) as number,
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
