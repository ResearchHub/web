import { ApiClient } from './client';
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantSubmitRequest,
  AssistantSubmitResponse,
  AuthorSearchResult,
  HubSearchResult,
  NonprofitSearchResult,
} from '@/types/assistant';

// ── Main Assistant Service ──────────────────────────────────────────────────

export class AssistantService {
  private static readonly BASE_PATH = '/api/assistant';

  /**
   * Send a message to the assistant and receive a response.
   *
   * POST /api/assistant/chat/
   *
   * On the first message, omit `session_id` and include `role`.
   * The server returns a `session_id` that must be sent on all subsequent messages.
   */
  static async chat(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    const body: Record<string, unknown> = {
      message: request.message,
    };

    if (request.session_id) {
      body.session_id = request.session_id;
    }

    if (request.role) {
      body.role = request.role;
    }

    if (request.structured_input) {
      body.structured_input = request.structured_input;
    }

    return ApiClient.post<AssistantChatResponse>(`${this.BASE_PATH}/chat/`, body);
  }

  /**
   * Submit the completed session to create the actual post/grant.
   *
   * POST /api/assistant/submit/
   */
  static async submit(request: AssistantSubmitRequest): Promise<AssistantSubmitResponse> {
    return ApiClient.post<AssistantSubmitResponse>(`${this.BASE_PATH}/submit/`, {
      session_id: request.session_id,
    });
  }

  // ── Inline Component Search APIs ────────────────────────────────────────

  /**
   * Search for authors/users.
   *
   * GET /api/search/suggest/?q=<query>&index=author,user&limit=10
   */
  static async searchAuthors(query: string): Promise<AuthorSearchResult[]> {
    if (!query.trim()) return [];

    const encoded = encodeURIComponent(query.trim());
    const raw = await ApiClient.get<any[]>(
      `/api/search/suggest/?q=${encoded}&index=author,user&limit=10`
    );

    return (raw ?? []).map((item) => ({
      id: item.author_profile?.id ?? item.id,
      name:
        item.display_name ??
        item.full_name ??
        [item.first_name, item.last_name].filter(Boolean).join(' ') ??
        'Unknown',
      headline:
        typeof item.headline === 'string'
          ? item.headline
          : (item.headline?.title ?? item.author_profile?.headline?.title ?? undefined),
      profileImage: item.profile_image ?? item.author_profile?.profile_image ?? undefined,
    }));
  }

  /**
   * Search for hubs/topics.
   *
   * GET /api/hub/?search=<query>&exclude_journals=true
   * Falls back to GET /api/hub/?exclude_journals=true when no query.
   */
  static async searchHubs(query?: string): Promise<HubSearchResult[]> {
    let path = '/api/hub/?exclude_journals=true&ordering=-paper_count';
    if (query?.trim()) {
      path += `&search=${encodeURIComponent(query.trim())}`;
    }

    const raw = await ApiClient.get<{ results: any[] }>(path);

    return (raw?.results ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      imageUrl: item.hub_image ?? undefined,
    }));
  }

  /**
   * Search for non-profit organizations.
   *
   * GET /api/organizations/non-profit/search/?searchTerm=<query>&count=15
   */
  static async searchNonprofits(query: string): Promise<NonprofitSearchResult[]> {
    if (!query.trim()) return [];

    const encoded = encodeURIComponent(query.trim());
    const raw = await ApiClient.get<any[]>(
      `/api/organizations/non-profit/search/?searchTerm=${encoded}&count=15`
    );

    return (raw ?? []).map((item) => ({
      id: item.endaomentOrgId ?? item.id,
      name: item.name,
      ein: item.ein ?? undefined,
      description: item.description ?? undefined,
      logoUrl: item.logoUrl ?? undefined,
    }));
  }
}
