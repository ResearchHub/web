import { ApiClient } from './client';
import { ApiError } from './types';
import {
  transformExecutiveSummary,
  transformGrantComparisonResponse,
  transformProposalReview,
  transformRfpSummary,
  type ExecutiveSummaryResponse,
  type GrantComparisonResponse,
  type ProposalReview,
  type RfpSummary,
  type RfpSummaryMissing,
} from '@/types/aiPeerReview';

// ── API enums / unions  ─────────────────────────────

export type ReviewStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type OverallRating = 'excellent' | 'good' | 'poor';

export type OverallConfidence = 'High' | 'Medium' | 'Low';

export type CategoryScoreLabel = 'High' | 'Medium' | 'Low' | 'N/A';

export type ItemDecisionValue = 'Yes' | 'No' | 'Partial' | 'N/A';

export type RfpStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type EditorialCategoryScore = 'high' | 'medium' | 'low';

export type CategoryKey =
  | 'overall_impact'
  | 'importance_significance_innovation'
  | 'rigor_and_feasibility'
  | 'additional_review_criteria'
  | 'funding_opportunity_fit'
  | 'methods_rigor'
  | 'statistical_analysis_plan'
  | 'feasibility_and_execution'
  | 'scientific_impact'
  | 'clinical_or_translational_impact'
  | 'societal_and_broader_impact';

// ── Request payloads ──────────────────────────────

export interface CreateProposalReviewPayload {
  unified_document_id: number;
  grant_id?: number | null;
}

export interface RfpBriefRefreshPayload {
  force?: boolean;
}

const BASE_PATH = '/api/ai_peer_review';

const NO_RFP_SUMMARY_DETAIL = 'No RFP summary yet.';

function isRfpSummaryNotFoundBody(body: Record<string, unknown>): boolean {
  return body.detail === NO_RFP_SUMMARY_DETAIL;
}

export class AiPeerReviewService {
  /**
   * POST /api/ai_peer_review/proposal-review/
   */
  static async createProposalReview(payload: CreateProposalReviewPayload): Promise<ProposalReview> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${BASE_PATH}/proposal-review/`,
      payload
    );
    return transformProposalReview(raw);
  }

  /**
   * GET /api/ai_peer_review/proposal-review/<review_id>/
   */
  static async getProposalReview(reviewId: number | string): Promise<ProposalReview> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${BASE_PATH}/proposal-review/${reviewId}/`
    );
    return transformProposalReview(raw);
  }

  /**
   * GET /api/ai_peer_review/proposal-review/grant/<grant_id>/
   */
  static async getGrantComparison(grantId: number | string): Promise<GrantComparisonResponse> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${BASE_PATH}/proposal-review/grant/${grantId}/`
    );
    return transformGrantComparisonResponse(raw);
  }

  /**
   * GET /api/ai_peer_review/rfp/<grant_id>/
   * 404 with body `{ detail: "No RFP summary yet.", grant_id, status: null, ... }` → RfpSummaryMissing
   */
  static async getRfpSummary(grantId: number | string): Promise<RfpSummary | RfpSummaryMissing> {
    try {
      const raw = await ApiClient.get<Record<string, unknown>>(`${BASE_PATH}/rfp/${grantId}/`);
      return transformRfpSummary(raw);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const body = (error.errors ?? {}) as Record<string, unknown>;
        if (isRfpSummaryNotFoundBody(body)) {
          const id = body.grant_id;
          const gid =
            typeof id === 'number' && Number.isFinite(id)
              ? id
              : typeof grantId === 'number'
                ? grantId
                : Number(grantId);
          return {
            grantId: Number.isFinite(gid) ? gid : 0,
            status: null,
            summaryContent: typeof body.summary_content === 'string' ? body.summary_content : '',
            executiveComparisonSummary:
              typeof body.executive_comparison_summary === 'string'
                ? body.executive_comparison_summary
                : '',
            detail: typeof body.detail === 'string' ? body.detail : NO_RFP_SUMMARY_DETAIL,
          };
        }
      }
      throw error;
    }
  }

  /**
   * POST /api/ai_peer_review/rfp/<grant_id>/
   */
  static async refreshRfpSummary(
    grantId: number | string,
    payload?: RfpBriefRefreshPayload
  ): Promise<RfpSummary> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${BASE_PATH}/rfp/${grantId}/`,
      payload ?? {}
    );
    return transformRfpSummary(raw);
  }

  /**
   * POST /api/ai_peer_review/rfp/<grant_id>/executive-summary/
   */
  static async generateExecutiveSummary(
    grantId: number | string
  ): Promise<ExecutiveSummaryResponse> {
    const raw = await ApiClient.post<Record<string, unknown>>(
      `${BASE_PATH}/rfp/${grantId}/executive-summary/`,
      {}
    );
    return transformExecutiveSummary(raw);
  }
}
