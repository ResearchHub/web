import { createTransformer } from './transformer';
import type {
  CategoryKey,
  CategoryScoreLabel,
  EditorialCategoryScore,
  ItemDecisionValue,
  OverallConfidence,
  OverallRating,
  ReviewStatus,
  RfpStatus,
} from '@/services/aiPeerReview.service';

export type {
  CategoryKey,
  CategoryScoreLabel,
  EditorialCategoryScore,
  ItemDecisionValue,
  OverallConfidence,
  OverallRating,
  ReviewStatus,
  RfpStatus,
} from '@/services/aiPeerReview.service';

// ── Constants  ───────────────────────────────────

export const CATEGORY_KEYS: readonly CategoryKey[] = [
  'funding_opportunity_fit',
  'methods_rigor',
  'statistical_analysis_plan',
  'feasibility_and_execution',
  'scientific_impact',
  'clinical_or_translational_impact',
  'societal_and_broader_impact',
];

export const CATEGORY_ITEMS: Record<CategoryKey, readonly string[]> = {
  funding_opportunity_fit: ['fit_modality', 'fit_aims', 'fit_deliverables', 'fit_scope'],
  methods_rigor: [
    'methods_detail',
    'parameters_specified',
    'controls_defined',
    'model_choice_justified',
    'outcomes_linked_to_aims',
  ],
  statistical_analysis_plan: [
    'analysis_present',
    'power_analysis',
    'multiple_comparisons',
    'metrics_defined',
    'analysis_matches_design',
  ],
  feasibility_and_execution: [
    'recruitment_feasible',
    'procedures_feasible',
    'timeline_milestones',
    'team_environment',
    'ethics_data_quality',
  ],
  scientific_impact: ['advances_understanding', 'generalizability', 'opens_new_directions'],
  clinical_or_translational_impact: ['clinical_pathway', 'unmet_need', 'milestones_defined'],
  societal_and_broader_impact: [
    'societal_challenge',
    'public_communication',
    'commercial_potential',
  ],
};

export const OPTIONAL_CATEGORIES: readonly CategoryKey[] = [
  'statistical_analysis_plan',
  'clinical_or_translational_impact',
  'societal_and_broader_impact',
];

// ── Domain types  ────────────────────────────────────────────────

export interface ItemDecision {
  decision: ItemDecisionValue;
  justification: string;
}

export interface CategoryBlock {
  score: CategoryScoreLabel;
  rationale: string;
  items: Record<string, ItemDecision>;
}

export interface ProposalReviewResultData {
  overallSummary: string;
  overallRating: OverallRating | null;
  overallRationale: string;
  overallConfidence: OverallConfidence | null;
  overallScoreNumeric: number | null;
  majorStrengths: string[];
  majorWeaknesses: string[];
  fatalFlaws: string[];
  categories: Partial<Record<CategoryKey, CategoryBlock>>;
}

export interface EditorialCategory {
  categoryCode: CategoryKey;
  score: EditorialCategoryScore;
}

export interface EditorialFeedback {
  id: number;
  unifiedDocumentId: number;
  createdById: number | null;
  updatedById: number | null;
  categories: EditorialCategory[];
  expertInsights: string;
  createdDate: string;
  updatedDate: string;
}

export interface ProposalReview {
  id: number;
  unifiedDocumentId: number;
  grantId: number | null;
  createdById: number | null;
  status: ReviewStatus;
  overallRating: OverallRating | null;
  overallRationale: string;
  overallConfidence: OverallConfidence | null;
  overallScoreNumeric: number | null;
  resultData: ProposalReviewResultData | null;
  errorMessage: string;
  progress: number;
  currentStep: string;
  llmModel: string;
  processingTime: number | null;
  createdDate: string;
  updatedDate: string;
  editorialFeedback: EditorialFeedback | null;
  alreadyExists?: boolean;
}

export interface GrantComparisonRow {
  unifiedDocumentId: number;
  proposalTitle: string;
  reviewId: number | null;
  status: ReviewStatus | null;
  overallRating: OverallRating | null;
  overallScoreNumeric: number | null;
  categories: Record<CategoryKey, CategoryScoreLabel | null> | null;
  editorialFeedback: EditorialFeedback | null;
}

export interface GrantComparisonResponse {
  grantId: number;
  proposals: GrantComparisonRow[];
  executiveSummary: string;
}

export interface RfpSummary {
  id: number;
  grantId: number;
  status: RfpStatus;
  summaryContent: string;
  executiveComparisonSummary: string;
  executiveComparisonUpdatedDate: string | null;
  errorMessage: string;
  llmModel: string;
  processingTime: number | null;
  createdDate: string;
  updatedDate: string;
  alreadyExists?: boolean;
}

export interface RfpSummaryMissing {
  grantId: number;
  status: null;
  summaryContent: string;
  executiveComparisonSummary: string;
  detail: string;
}

export interface ExecutiveSummaryResponse {
  grantId: number;
  executiveSummary: string;
  updatedDate: string;
}

/** Compact AI peer review on `funding_feed` / `grant_feed`. */
export interface AiPeerReviewFeedSummary {
  id: number;
  status: ReviewStatus;
  overallRating: OverallRating | null;
  overallScoreNumeric: number | null;
  grantId: number | null;
  updatedDate: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function numOrNull(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function transformItemDecision(raw: Record<string, unknown> | null | undefined): ItemDecision {
  if (!raw || typeof raw !== 'object') {
    return { decision: 'N/A', justification: '' };
  }
  const decision = (raw.decision ?? raw.item_decision) as ItemDecisionValue | undefined;
  const allowed: ItemDecisionValue[] = ['Yes', 'No', 'Partial', 'N/A'];
  return {
    decision: decision && allowed.includes(decision) ? decision : 'N/A',
    justification: str(raw.justification ?? raw.justification_text),
  };
}

function transformCategoryBlock(
  raw: Record<string, unknown> | null | undefined
): CategoryBlock | null {
  if (!raw || typeof raw !== 'object') return null;
  const score = raw.score as CategoryScoreLabel | undefined;
  const allowedScores: CategoryScoreLabel[] = ['High', 'Medium', 'Low', 'N/A'];
  const itemsRaw = raw.items;
  const items: Record<string, ItemDecision> = {};
  if (itemsRaw && typeof itemsRaw === 'object' && !Array.isArray(itemsRaw)) {
    for (const [key, val] of Object.entries(itemsRaw as Record<string, unknown>)) {
      items[key] = transformItemDecision(val as Record<string, unknown>);
    }
  }
  return {
    score: score && allowedScores.includes(score) ? score : 'N/A',
    rationale: str(raw.rationale),
    items,
  };
}

export function transformResultData(raw: unknown): ProposalReviewResultData | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return null;

  const categoriesRaw = o.categories;
  const categories: Partial<Record<CategoryKey, CategoryBlock>> = {};
  if (categoriesRaw && typeof categoriesRaw === 'object' && !Array.isArray(categoriesRaw)) {
    const categoriesRecord = categoriesRaw as Record<string, unknown>;
    for (const key of Object.keys(categoriesRecord)) {
      if (!(CATEGORY_KEYS as readonly string[]).includes(key)) continue;
      const block = transformCategoryBlock(categoriesRecord[key] as Record<string, unknown>);
      if (block) categories[key as CategoryKey] = block;
    }
  }

  const or = (o.overall_rating ?? o.overallRating) as OverallRating | undefined;
  const ratings: OverallRating[] = ['excellent', 'good', 'poor'];
  const oc = (o.overall_confidence ?? o.overallConfidence) as OverallConfidence | undefined;
  const confidences: OverallConfidence[] = ['High', 'Medium', 'Low'];

  return {
    overallSummary: str(o.overall_summary ?? o.overallSummary),
    overallRating: or && ratings.includes(or) ? or : null,
    overallRationale: str(o.overall_rationale ?? o.overallRationale),
    overallConfidence: oc && confidences.includes(oc) ? oc : null,
    overallScoreNumeric: numOrNull(o.overall_score_numeric ?? o.overallScoreNumeric),
    majorStrengths: Array.isArray(o.major_strengths)
      ? (o.major_strengths as unknown[]).map((x) => String(x))
      : Array.isArray(o.majorStrengths)
        ? (o.majorStrengths as unknown[]).map((x) => String(x))
        : [],
    majorWeaknesses: Array.isArray(o.major_weaknesses)
      ? (o.major_weaknesses as unknown[]).map((x) => String(x))
      : Array.isArray(o.majorWeaknesses)
        ? (o.majorWeaknesses as unknown[]).map((x) => String(x))
        : [],
    fatalFlaws: Array.isArray(o.fatal_flaws)
      ? (o.fatal_flaws as unknown[]).map((x) => String(x))
      : Array.isArray(o.fatalFlaws)
        ? (o.fatalFlaws as unknown[]).map((x) => String(x))
        : [],
    categories,
  };
}

function transformEditorialCategory(raw: Record<string, unknown>): EditorialCategory | null {
  const code = (raw.category_code ?? raw.categoryCode) as string | undefined;
  if (!code || !(CATEGORY_KEYS as readonly string[]).includes(code)) return null;
  const scoreRaw = (raw.score as string | undefined)?.toLowerCase();
  const scores: EditorialCategoryScore[] = ['high', 'medium', 'low'];
  const score =
    scoreRaw && scores.includes(scoreRaw as EditorialCategoryScore)
      ? (scoreRaw as EditorialCategoryScore)
      : 'low';
  return { categoryCode: code as CategoryKey, score };
}

export function transformEditorialFeedback(raw: unknown): EditorialFeedback | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const catsRaw = o.categories;
  const categories: EditorialCategory[] = [];
  if (Array.isArray(catsRaw)) {
    for (const row of catsRaw) {
      if (row && typeof row === 'object') {
        const c = transformEditorialCategory(row as Record<string, unknown>);
        if (c) categories.push(c);
      }
    }
  }
  return {
    id: numOrNull(o.id) ?? 0,
    unifiedDocumentId: numOrNull(o.unified_document_id ?? o.unifiedDocumentId) ?? 0,
    createdById: numOrNull(o.created_by_id ?? o.createdById),
    updatedById: numOrNull(o.updated_by_id ?? o.updatedById),
    categories,
    expertInsights: str(o.expert_insights ?? o.expertInsights),
    createdDate: str(o.created_date ?? o.createdDate),
    updatedDate: str(o.updated_date ?? o.updatedDate),
  };
}

const reviewStatuses: ReviewStatus[] = ['pending', 'processing', 'completed', 'failed'];
const rfpStatuses: RfpStatus[] = ['pending', 'processing', 'completed', 'failed'];

function parseReviewStatus(v: unknown): ReviewStatus {
  return reviewStatuses.includes(v as ReviewStatus) ? (v as ReviewStatus) : 'pending';
}

function parseRfpStatus(v: unknown): RfpStatus {
  return rfpStatuses.includes(v as RfpStatus) ? (v as RfpStatus) : 'pending';
}

function parseOverallRating(v: unknown): OverallRating | null {
  if (v == null || v === '') return null;
  const r = String(v).toLowerCase() as OverallRating;
  return ['excellent', 'good', 'poor'].includes(r) ? r : null;
}

function parseOverallConfidence(v: unknown): OverallConfidence | null {
  if (v == null || v === '') return null;
  const c = v as OverallConfidence;
  return ['High', 'Medium', 'Low'].includes(c) ? c : null;
}

export function transformAiPeerReviewFeedSummary(raw: unknown): AiPeerReviewFeedSummary | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = numOrNull(o.id);
  if (id == null) return null;
  const ud = o.updated_date ?? o.updatedDate;
  const updatedDate = ud == null || ud === '' ? null : str(ud);
  return {
    id,
    status: parseReviewStatus(o.status),
    overallRating: parseOverallRating(o.overall_rating ?? o.overallRating),
    overallScoreNumeric: numOrNull(o.overall_score_numeric ?? o.overallScoreNumeric),
    grantId: numOrNull(o.grant_id ?? o.grantId),
    updatedDate,
  };
}

export const transformProposalReview = createTransformer<any, ProposalReview>((raw) => {
  const status = parseReviewStatus(raw.status);
  const rd = transformResultData(raw.result_data ?? raw.resultData);
  return {
    id: numOrNull(raw.id) ?? 0,
    unifiedDocumentId: numOrNull(raw.unified_document_id ?? raw.unifiedDocumentId) ?? 0,
    grantId: numOrNull(raw.grant_id ?? raw.grantId),
    createdById: numOrNull(raw.created_by_id ?? raw.createdById),
    status,
    overallRating: parseOverallRating(raw.overall_rating ?? raw.overallRating),
    overallRationale: str(raw.overall_rationale ?? raw.overallRationale),
    overallConfidence: parseOverallConfidence(raw.overall_confidence ?? raw.overallConfidence),
    overallScoreNumeric: numOrNull(raw.overall_score_numeric ?? raw.overallScoreNumeric),
    resultData: rd,
    errorMessage: str(raw.error_message ?? raw.errorMessage),
    progress: Number.isFinite(Number(raw.progress)) ? Number(raw.progress) : 0,
    currentStep: str(raw.current_step ?? raw.currentStep),
    llmModel: str(raw.llm_model ?? raw.llmModel),
    processingTime: (() => {
      const p = raw.processing_time ?? raw.processingTime;
      if (p == null || p === '') return null;
      const n = Number(p);
      return Number.isFinite(n) ? n : null;
    })(),
    createdDate: str(raw.created_date ?? raw.createdDate),
    updatedDate: str(raw.updated_date ?? raw.updatedDate),
    editorialFeedback: transformEditorialFeedback(raw.editorial_feedback ?? raw.editorialFeedback),
    alreadyExists:
      raw.already_exists !== undefined || raw.alreadyExists !== undefined
        ? Boolean(raw.already_exists ?? raw.alreadyExists)
        : undefined,
  };
});

function transformComparisonCategories(
  raw: unknown
): Record<CategoryKey, CategoryScoreLabel | null> | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out = {} as Record<CategoryKey, CategoryScoreLabel | null>;
  const allowed: CategoryScoreLabel[] = ['High', 'Medium', 'Low', 'N/A'];
  for (const key of CATEGORY_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (v == null) {
      out[key] = null;
    } else if (
      typeof v === 'string' &&
      (allowed.includes(v as CategoryScoreLabel) || v === 'N/A')
    ) {
      out[key] = v as CategoryScoreLabel;
    } else {
      out[key] = null;
    }
  }
  return out;
}

export const transformGrantComparisonRow = createTransformer<any, GrantComparisonRow>((raw) => {
  const st = raw.status;
  return {
    unifiedDocumentId: numOrNull(raw.unified_document_id ?? raw.unifiedDocumentId) ?? 0,
    proposalTitle: str(raw.proposal_title ?? raw.proposalTitle),
    reviewId: numOrNull(raw.review_id ?? raw.reviewId),
    status: st == null || st === '' ? null : parseReviewStatus(st),
    overallRating: parseOverallRating(raw.overall_rating ?? raw.overallRating),
    overallScoreNumeric: numOrNull(raw.overall_score_numeric ?? raw.overallScoreNumeric),
    categories: transformComparisonCategories(raw.categories),
    editorialFeedback: transformEditorialFeedback(raw.editorial_feedback ?? raw.editorialFeedback),
  };
});

export const transformGrantComparisonResponse = createTransformer<any, GrantComparisonResponse>(
  (raw) => ({
    grantId: numOrNull(raw.grant_id ?? raw.grantId) ?? 0,
    proposals: Array.isArray(raw.proposals)
      ? raw.proposals.map((p: any) => transformGrantComparisonRow(p))
      : [],
    executiveSummary: str(raw.executive_summary ?? raw.executiveSummary),
  })
);

export const transformRfpSummary = createTransformer<any, RfpSummary>((raw) => ({
  id: numOrNull(raw.id) ?? 0,
  grantId: numOrNull(raw.grant_id ?? raw.grantId) ?? 0,
  status: parseRfpStatus(raw.status),
  summaryContent: str(raw.summary_content ?? raw.summaryContent),
  executiveComparisonSummary: str(
    raw.executive_comparison_summary ?? raw.executiveComparisonSummary
  ),
  executiveComparisonUpdatedDate:
    raw.executive_comparison_updated_date != null && raw.executive_comparison_updated_date !== ''
      ? str(raw.executive_comparison_updated_date)
      : raw.executiveComparisonUpdatedDate != null && raw.executiveComparisonUpdatedDate !== ''
        ? str(raw.executiveComparisonUpdatedDate)
        : null,
  errorMessage: str(raw.error_message ?? raw.errorMessage),
  llmModel: str(raw.llm_model ?? raw.llmModel),
  processingTime: (() => {
    const p = raw.processing_time ?? raw.processingTime;
    if (p == null || p === '') return null;
    const n = Number(p);
    return Number.isFinite(n) ? n : null;
  })(),
  createdDate: str(raw.created_date ?? raw.createdDate),
  updatedDate: str(raw.updated_date ?? raw.updatedDate),
  alreadyExists:
    raw.already_exists !== undefined || raw.alreadyExists !== undefined
      ? Boolean(raw.already_exists ?? raw.alreadyExists)
      : undefined,
}));

export const transformExecutiveSummary = createTransformer<any, ExecutiveSummaryResponse>(
  (raw) => ({
    grantId: numOrNull(raw.grant_id ?? raw.grantId) ?? 0,
    executiveSummary: str(raw.executive_summary ?? raw.executiveSummary),
    updatedDate: str(raw.updated_date ?? raw.updatedDate),
  })
);

export function isRfpSummaryMissing(x: RfpSummary | RfpSummaryMissing): x is RfpSummaryMissing {
  return x.status === null;
}
