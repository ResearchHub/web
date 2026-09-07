import { ApiClient } from './client';
import type {
  CancelTurnResponse,
  NotebookChat,
  NotebookChatListItem,
  SendMessageResponse,
} from '@/types/notebookChat';
import type { GenerationRequest } from '@/types/notebookModels';
import { ID } from '@/types/root';

const BASE_PATH = '/api/research_ai/assistant/chats/';

/** `GET /api/research_ai/usage-budget/` — the user's daily Research AI budget. */
export interface UsageBudget {
  tier: string;
  daily_budget: string;
  spent_today: string;
  remaining: string;
  turns_used: number;
  turn_cap: number;
  /** ISO timestamp of the next daily reset. */
  resets_at: string;
  credits?: { daily_limit: number; used: number; remaining: number };
}

/**
 * REST layer for the research assistant chat — the notebook chat without a
 * note. Same representation and semantics as {@link NotebookChatService};
 * only the URL prefix differs, plus the `notes` field the assistant surface
 * adds to a chat (the documents the agent created from it).
 */
export class AssistantChatService {
  static async listChats(): Promise<NotebookChatListItem[]> {
    const response = await ApiClient.get<{ chats: NotebookChatListItem[] }>(BASE_PATH);
    return response.chats ?? [];
  }

  static async createChat(title?: string): Promise<NotebookChat> {
    return ApiClient.post<NotebookChat>(BASE_PATH, title ? { title } : {});
  }

  static async getChat(chatId: ID, options?: { live?: boolean }): Promise<NotebookChat> {
    const suffix = options?.live ? '?activity=live' : '';
    return ApiClient.get<NotebookChat>(`${BASE_PATH}${chatId}/${suffix}`);
  }

  static async sendMessage(
    chatId: ID,
    message: string,
    generation?: GenerationRequest
  ): Promise<SendMessageResponse> {
    return ApiClient.post<SendMessageResponse>(`${BASE_PATH}${chatId}/messages/`, {
      message,
      ...generation,
    });
  }

  static async renameChat(
    chatId: ID,
    title: string
  ): Promise<{ conversation_id: number; title: string }> {
    return ApiClient.patch(`${BASE_PATH}${chatId}/`, { title });
  }

  static async cancelTurn(chatId: ID): Promise<CancelTurnResponse> {
    return ApiClient.post<CancelTurnResponse>(`${BASE_PATH}${chatId}/cancel/`);
  }

  /** Deletes the conversation and its messages; notes it created are kept. */
  static async deleteChat(chatId: ID): Promise<void> {
    await ApiClient.deleteNoContent(`${BASE_PATH}${chatId}/`);
  }

  static async getUsageBudget(): Promise<UsageBudget> {
    return ApiClient.get<UsageBudget>('/api/research_ai/usage-budget/');
  }
}
