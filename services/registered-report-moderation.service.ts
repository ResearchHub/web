import { ApiClient } from '@/services/client';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ApiError } from '@/services/types';
import { type FeedEntry, type RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import { normalizeRegisteredReportId } from '@/utils/registeredReportPrefill';

interface RegisteredReportCandidateResponse {
  next: string | null;
  results: RawApiFeedEntry[];
}

interface RegisteredReportDraftResponse {
  id: number;
}

interface RegisteredReportCandidates {
  entries: FeedEntry[];
  hasMore: boolean;
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

function transformCandidate(entry: RawApiFeedEntry): FeedEntry | null {
  try {
    const timestamp =
      entry.action_date || entry.created_date || entry.content_object?.created_date || '';
    const candidate = transformFeedEntry({
      ...entry,
      action: entry.action || 'PUBLISH',
      action_date: timestamp,
      created_date: entry.created_date || timestamp,
      recommendation_id: entry.recommendation_id ?? null,
    });
    const proposalId = normalizeRegisteredReportId(candidate.content.id);

    if (candidate.content.contentType !== 'PREREGISTRATION' || !proposalId) return null;

    return {
      ...candidate,
      content: { ...candidate.content, id: proposalId },
    };
  } catch (error) {
    console.warn('Skipping invalid Registered Report candidate:', error);
    return null;
  }
}

export class RegisteredReportModerationService {
  private static readonly CANDIDATES_PATH = '/api/moderator_feed/registered_report_candidates/';
  private static readonly CREATE_DRAFT_PATH =
    '/api/researchhubpost/create_registered_report_draft/';

  static async fetchCandidates(page = 1, pageSize = 30): Promise<RegisteredReportCandidates> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await ApiClient.get<RegisteredReportCandidateResponse>(
        `${this.CANDIDATES_PATH}?${params.toString()}`
      );
      if (!Array.isArray(response.results)) {
        throw new TypeError('The eligible proposals response was invalid.');
      }

      const entries = response.results
        .map(transformCandidate)
        .filter((entry): entry is FeedEntry => entry !== null);
      if (response.results.length > 0 && entries.length === 0) {
        throw new TypeError('The eligible proposals response contained no valid candidates.');
      }

      return {
        entries,
        hasMore: Boolean(response.next),
      };
    } catch (error) {
      throw this.createError(error, 'Failed to load eligible proposals.');
    }
  }

  static async createDraft(proposalId: number): Promise<number> {
    const normalizedProposalId = normalizeRegisteredReportId(proposalId);
    if (!normalizedProposalId) {
      throw new RegisteredReportModerationError('A valid proposal is required to create a draft.');
    }

    try {
      const response = await ApiClient.post<RegisteredReportDraftResponse>(this.CREATE_DRAFT_PATH, {
        proposal_id: normalizedProposalId,
      });
      const noteId = normalizeRegisteredReportId(response.id);

      if (!noteId) {
        throw new Error('The Registered Report draft response was invalid.');
      }

      return noteId;
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
