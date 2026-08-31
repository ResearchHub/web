import { ApiClient } from './client';
import { ApiError } from './types';
import type {
  CancelTurnResponse,
  NotebookChat,
  NotebookChatListItem,
  SendMessageResponse,
} from '@/types/notebookChat';
import type { GenerationRequest } from '@/types/notebookModels';
import { ID } from '@/types/root';

/**
 * REST layer for the notebook AI assistant chat.
 *
 * REST is the source of truth for chat state — the WebSocket only nudges the
 * client to refetch. All reads go through {@link getChat}; pass `live: true`
 * for every poll/nudge refetch after the initial load so the server can omit
 * settled activity feeds (see the `activity` merge semantics in
 * `types/notebookChat.ts`).
 */
export class NotebookChatService {
  private static basePath(noteId: ID): string {
    return `/api/research_ai/notebook/notes/${noteId}/chats/`;
  }

  /** Cheap listing projection for the picker — never fetch full chats to build the list. */
  static async listChats(noteId: ID): Promise<NotebookChatListItem[]> {
    const response = await ApiClient.get<{ chats: NotebookChatListItem[] }>(this.basePath(noteId));
    return response.chats ?? [];
  }

  /** A chat created without a title is auto-named from its first message. */
  static async createChat(noteId: ID, title?: string): Promise<NotebookChat> {
    return ApiClient.post<NotebookChat>(this.basePath(noteId), title ? { title } : {});
  }

  static async getChat(
    noteId: ID,
    chatId: ID,
    options?: { live?: boolean }
  ): Promise<NotebookChat> {
    const suffix = options?.live ? '?activity=live' : '';
    return ApiClient.get<NotebookChat>(`${this.basePath(noteId)}${chatId}/${suffix}`);
  }

  /**
   * Starts an asynchronous turn. 202 means the user message is already recorded
   * server-side. Throws ApiError with status 409 while a previous turn is still
   * running (one turn per chat), 400 for empty/oversized messages.
   *
   * `generation` carries the model and its controls; every field is optional
   * and an omitted one runs the server's configured default. `model` is only
   * honoured on a conversation's first turn — naming a different one later is
   * a 400, so send it only while the conversation is still unpinned.
   */
  static async sendMessage(
    noteId: ID,
    chatId: ID,
    message: string,
    generation?: GenerationRequest
  ): Promise<SendMessageResponse> {
    return ApiClient.post<SendMessageResponse>(`${this.basePath(noteId)}${chatId}/messages/`, {
      message,
      ...generation,
    });
  }

  static async renameChat(
    noteId: ID,
    chatId: ID,
    title: string
  ): Promise<{ conversation_id: number; title: string }> {
    return ApiClient.patch(`${this.basePath(noteId)}${chatId}/`, { title });
  }

  /**
   * Stop the in-flight turn. Idempotent — cancelling when nothing is running
   * resolves with `cancelled: false`, not an error.
   */
  static async cancelTurn(noteId: ID, chatId: ID): Promise<CancelTurnResponse> {
    return ApiClient.post<CancelTurnResponse>(`${this.basePath(noteId)}${chatId}/cancel/`);
  }
}

/** HTTP status from a thrown service error, or undefined for network failures. */
export function chatErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

/**
 * User-facing detail from a DRF error response (`{"detail": "..."}`), e.g. the
 * 409 "assistant is still working" copy. Falls back to the generic message.
 */
export function chatErrorDetail(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    const detail = (error.errors as Record<string, unknown> | undefined)?.detail;
    if (typeof detail === 'string' && detail.length > 0) return detail;
    return error.message;
  }
  return error instanceof Error ? error.message : undefined;
}
