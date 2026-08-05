import { ApiClient } from './client';
import {
  transformNotebookChatConversation,
  type NotebookChatConversation,
  type NotebookChatSubmitResult,
} from '@/types/notebookChat';

/** Ceiling on one chat message; mirrors the backend request serializer. */
export const NOTEBOOK_CHAT_MESSAGE_MAX_LENGTH = 20_000;

/**
 * The notebook chat assistant API: one conversation per (note, user).
 *
 * Sending a message returns 202 immediately; the agent turn runs in a
 * background worker. Callers poll `getConversation` until the execution
 * reaches a terminal status and its assistant message is published.
 */
export class NotebookChatService {
  private static readonly BASE_PATH = '/api/research_ai/notebook';

  /**
   * Fetch the current user's chat conversation on a note.
   * Returns an empty conversation (`conversationId: null`) if none exists.
   */
  static async getConversation(noteId: number | string): Promise<NotebookChatConversation> {
    const raw = await ApiClient.get<Record<string, unknown>>(
      `${this.BASE_PATH}/notes/${noteId}/chat/`
    );
    return transformNotebookChatConversation(raw);
  }

  /**
   * Send a message to the note's assistant and start an agent turn.
   *
   * Throws `ApiError` with status 409 when a turn is already running on the
   * conversation, and 400 for an empty or oversized message.
   */
  static async sendMessage(
    noteId: number | string,
    message: string
  ): Promise<NotebookChatSubmitResult> {
    const raw = await ApiClient.post<{ conversation_id: number; execution_id: number }>(
      `${this.BASE_PATH}/notes/${noteId}/chat/messages/`,
      { message }
    );
    return {
      conversationId: raw.conversation_id,
      executionId: raw.execution_id,
    };
  }
}
