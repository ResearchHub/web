import { AssistantChatService } from './assistantChat.service';
import { NotebookChatService } from './notebookChat.service';
import { WS_ROUTES } from './websocket';
import type {
  CancelTurnResponse,
  NotebookChat,
  NotebookChatListItem,
  SendMessageResponse,
} from '@/types/notebookChat';
import type { GenerationRequest } from '@/types/notebookModels';

type ChatId = string | number;

/**
 * Everything the chat hooks need from a backend surface. The notebook chat
 * (scoped to a note) and the research assistant (no note) share one wire
 * contract and one state machine; only the URLs differ, and this is where
 * that difference lives.
 *
 * Construct one per surface and keep it referentially stable (memoize on its
 * inputs) — the hooks reset their state whenever the transport changes.
 */
export interface ChatTransport {
  /** Identifies the surface + scope; the hooks key their resets on it. */
  readonly key: string;
  listChats(): Promise<NotebookChatListItem[]>;
  createChat(title?: string): Promise<NotebookChat>;
  getChat(chatId: ChatId, options?: { live?: boolean }): Promise<NotebookChat>;
  sendMessage(
    chatId: ChatId,
    message: string,
    generation?: GenerationRequest
  ): Promise<SendMessageResponse>;
  renameChat(chatId: ChatId, title: string): Promise<{ conversation_id: number; title: string }>;
  cancelTurn(chatId: ChatId): Promise<CancelTurnResponse>;
  socketUrl(chatId: ChatId): string;
}

export function notebookChatTransport(noteId: ChatId): ChatTransport {
  return {
    key: `notebook:${noteId}`,
    listChats: () => NotebookChatService.listChats(noteId),
    createChat: (title) => NotebookChatService.createChat(noteId, title),
    getChat: (chatId, options) => NotebookChatService.getChat(noteId, chatId, options),
    sendMessage: (chatId, message, generation) =>
      NotebookChatService.sendMessage(noteId, chatId, message, generation),
    renameChat: (chatId, title) => NotebookChatService.renameChat(noteId, chatId, title),
    cancelTurn: (chatId) => NotebookChatService.cancelTurn(noteId, chatId),
    socketUrl: (chatId) => WS_ROUTES.NOTEBOOK_CHAT(noteId, chatId),
  };
}

export function assistantChatTransport(): ChatTransport {
  return {
    key: 'assistant',
    listChats: () => AssistantChatService.listChats(),
    createChat: (title) => AssistantChatService.createChat(title),
    getChat: (chatId, options) => AssistantChatService.getChat(chatId, options),
    sendMessage: (chatId, message, generation) =>
      AssistantChatService.sendMessage(chatId, message, generation),
    renameChat: (chatId, title) => AssistantChatService.renameChat(chatId, title),
    cancelTurn: (chatId) => AssistantChatService.cancelTurn(chatId),
    socketUrl: (chatId) => WS_ROUTES.ASSISTANT_CHAT(chatId),
  };
}
