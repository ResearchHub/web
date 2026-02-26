import { ApiClient } from './client';
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantSessionResponse,
  CreateSessionRequest,
  CreateSessionResponse,
} from '@/types/assistant';
import type { SearchSuggestion, UserSuggestion } from '@/types/search';
import type { Topic } from '@/types/topic';
import type { NonprofitOrg } from '@/types/nonprofit';
import { SearchService } from './search.service';
import { HubService } from './hub.service';
import { NonprofitService } from './nonprofit.service';

// ── Main Assistant Service ──────────────────────────────────────────────────

export class AssistantService {
  private static readonly BASE_PATH = '/api/assistant';

  /**
   * Create a new assistant session.
   *
   * POST /api/assistant/sessions/
   */
  static async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    return ApiClient.post<CreateSessionResponse>(`${this.BASE_PATH}/session/`, {
      role: request.role,
    });
  }

  /**
   * Send a message to the assistant and receive a response.
   *
   * POST /api/assistant/chat/
   */
  static async chat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    const body: Record<string, unknown> = {
      action: request.action,
    };

    if (request.session_id) {
      body.session_id = request.session_id;
    }

    if (request.role) {
      body.role = request.role;
    }

    if (request.message) {
      body.message = request.message;
    }

    if (request.note_id) {
      body.note_id = request.note_id;
    }

    if (request.structured_input) {
      body.structured_input = request.structured_input;
    }

    return ApiClient.post<AssistantChatResponse>(`${this.BASE_PATH}/chat/`, body);
  }

  /**
   * Load an existing session by ID (for resuming).
   *
   * GET /api/assistant/session/{session_id}/
   */
  static async getSession(sessionId: string): Promise<AssistantSessionResponse> {
    return ApiClient.get<AssistantSessionResponse>(`${this.BASE_PATH}/session/${sessionId}/`);
  }

  // ── Search APIs (delegates to existing services) ────────────────────────

  /**
   * Search for authors/users via SearchService.
   * Returns UserSuggestion[] filtered to user/author entity types.
   */
  static async searchAuthors(query: string): Promise<UserSuggestion[]> {
    if (!query.trim()) return [];
    const results = await SearchService.getSuggestions(query, 'user', 10);
    return results.filter(
      (r): r is UserSuggestion => r.entityType === 'user' || r.entityType === 'author'
    );
  }

  /**
   * Search for hubs/topics via HubService.
   * Returns Topic[].
   */
  static async searchHubs(query?: string): Promise<Topic[]> {
    if (query?.trim()) {
      // HubService.getHubs doesn't support search query, use API directly
      const raw = await ApiClient.get<{ results: any[] }>(
        `/api/hub/?exclude_journals=true&ordering=-paper_count&search=${encodeURIComponent(query.trim())}`
      );
      const { transformTopic } = await import('@/types/topic');
      return (raw?.results ?? []).map(transformTopic);
    }
    return HubService.getHubs({ excludeJournals: true });
  }

  /**
   * Search for non-profit organizations via NonprofitService.
   * Returns NonprofitOrg[].
   */
  static async searchNonprofits(query: string): Promise<NonprofitOrg[]> {
    if (!query.trim()) return [];
    return NonprofitService.searchNonprofitOrgs(query, { count: 15 });
  }
}
