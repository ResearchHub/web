import { ApiClient } from '@/services/client';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types';
import { type FeedEntry, type RawApiFeedEntry } from '@/types/feed';
import { transformRegisteredReportCandidate } from '@/types/moderation';

interface RegisteredReportCandidateResponse {
  next: string | null;
  results: RawApiFeedEntry[];
}

interface RegisteredReportDraftResponse {
  id: number;
}

export interface RegisteredReportCandidates {
  entries: FeedEntry[];
  next: string | null;
}

export class RegisteredReportModerationError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'RegisteredReportModerationError';
  }
}

export class RegisteredReportModerationService {
  private static readonly CANDIDATES_PATH = '/api/moderator_feed/registered_report_candidates/';
  private static readonly CREATE_DRAFT_PATH =
    '/api/researchhubpost/create_registered_report_draft/';

  static async fetchCandidates(
    nextUrl?: string,
    pageSize = 30
  ): Promise<RegisteredReportCandidates> {
    try {
      const params = new URLSearchParams({
        page: '1',
        page_size: pageSize.toString(),
      });
      const url = nextUrl ?? `${this.CANDIDATES_PATH}?${params.toString()}`;
      const response = await ApiClient.get<RegisteredReportCandidateResponse>(url);

      if (!response || !Array.isArray(response.results)) {
        throw new TypeError('The eligible proposals response was invalid.');
      }

      const entries = response.results
        .map(transformRegisteredReportCandidate)
        .filter((entry): entry is FeedEntry => entry !== null);

      if (response.results.length > 0 && entries.length === 0) {
        throw new TypeError('The eligible proposals response contained no valid candidates.');
      }

      return {
        entries,
        next: response.next || null,
      };
    } catch (error) {
      throw this.createError(error, 'Failed to load eligible proposals.');
    }
  }

  static async createDraft(proposalId: number): Promise<number> {
    try {
      const response = await ApiClient.post<RegisteredReportDraftResponse>(this.CREATE_DRAFT_PATH, {
        proposal_id: proposalId,
      });
      return response.id;
    } catch (error) {
      throw this.createError(error, 'Failed to create the Registered Report draft.');
    }
  }

  private static createError(
    error: unknown,
    fallbackMessage: string
  ): RegisteredReportModerationError {
    const status = error instanceof ApiError ? error.status : undefined;

    if (status === 401 || status === 403) {
      return new RegisteredReportModerationError(
        'You no longer have access to the moderator Registered Report workflow.',
        status
      );
    }

    return new RegisteredReportModerationError(
      extractApiErrorMessage(error, fallbackMessage),
      status
    );
  }
}
