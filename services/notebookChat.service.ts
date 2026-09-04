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
    const fields = error.errors as Record<string, unknown> | undefined;
    const detail = fields?.detail;
    if (typeof detail === 'string' && detail.length > 0) return detail;
    if (fields) {
      const messages = Object.entries(fields).flatMap(([field, value]) =>
        Array.isArray(value)
          ? value
              .filter((entry): entry is string => typeof entry === 'string')
              .map((entry) => `${field}: ${entry}`)
          : []
      );
      if (messages.length) return messages.join(' ');
    }
    return error.message;
  }
  return error instanceof Error ? error.message : undefined;
}

export function chatErrorCode(error: unknown): string | undefined {
  const code = chatErrorBody(error)?.code;
  return typeof code === 'string' ? code : undefined;
}

export function chatErrorBody(error: unknown): Record<string, unknown> | undefined {
  return error instanceof ApiError
    ? (error.errors as Record<string, unknown> | undefined)
    : undefined;
}

export type SendOutcome =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'usage_limit'
        | 'account_busy'
        | 'model_not_allowed'
        | 'busy'
        | 'invalid'
        | 'not_found'
        | 'unauthorized'
        | 'error';
      detail?: string;
    };

/** Maps a failed send POST to its outcome; the state side-effects stay in `send`. */
export function sendFailureOutcome(err: unknown): Extract<SendOutcome, { ok: false }> {
  const detail = chatErrorDetail(err);
  const code = chatErrorCode(err);
  switch (chatErrorStatus(err)) {
    case 429:
      return code === 'usage_limit_exceeded'
        ? { ok: false, reason: 'usage_limit', detail: 'Daily AI usage limit reached.' }
        : { ok: false, reason: 'error', detail };

    case 409:
      return code === 'usage_work_in_progress'
        ? { ok: false, reason: 'account_busy', detail: 'Another AI request is still running.' }
        : { ok: false, reason: 'busy', detail: 'This conversation already has an active turn.' };
    case 400:
      return {
        ok: false,
        reason: code === 'model_not_allowed' ? 'model_not_allowed' : 'invalid',
        detail,
      };
    case 401:
    case 403:
      return { ok: false, reason: 'unauthorized', detail };
    case 404:
      return { ok: false, reason: 'not_found', detail };
    default:
      return { ok: false, reason: 'error', detail };
  }
}
