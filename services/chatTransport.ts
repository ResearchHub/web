import { AssistantChatService } from './assistantChat.service';
import { NotebookChatService } from './notebookChat.service';
import { WS_ROUTES } from './websocket';
import type {
  CancelTurnResponse,
  AgentChat,
  AgentChatListItem,
  SendMessageResponse,
} from '@/types/agentChat';
import type { GenerationRequest } from '@/types/agentModels';
import type { FundingIntent } from '@/components/Funding/fundingDirection';

type ChatId = string | number;

/**
 * What a chat starts out knowing, before its first message. The intent and
 * the RFP are the assistant surface's; a note-scoped chat ignores them.
 */
export interface ChatCreateInit {
  readonly title?: string;
  readonly intent?: FundingIntent;
  /** The Request for Proposals a proposal this chat drafts will answer. */
  readonly selectedGrantId?: ChatId | null;
}

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
  listChats(): Promise<AgentChatListItem[]>;
  createChat(init?: ChatCreateInit): Promise<AgentChat>;
  getChat(chatId: ChatId, options?: { live?: boolean }): Promise<AgentChat>;
  sendMessage(
    chatId: ChatId,
    message: string,
    generation?: GenerationRequest
  ): Promise<SendMessageResponse>;
  renameChat(chatId: ChatId, title: string): Promise<{ conversation_id: number; title: string }>;
  cancelTurn(chatId: ChatId): Promise<CancelTurnResponse>;
  socketUrl(chatId: ChatId): string;
  /** The notebook's chats keep their note: `deleteNotes` is the assistant surface's. */
  deleteChat(chatId: ChatId, options?: { deleteNotes?: boolean }): Promise<void>;
}

const transports = new Map<string, ChatTransport>();

/**
 * The transport for a scope, the same object every time it is asked for: the
 * hooks reset on the transport's identity, so a scope must not get a fresh
 * one per render.
 */
export function getChatTransport(scope: { noteId: ChatId | null }): ChatTransport {
  const key = scope.noteId == null ? 'assistant' : `notebook:${scope.noteId}`;
  let transport = transports.get(key);
  if (!transport) {
    transport =
      scope.noteId == null ? assistantChatTransport() : notebookChatTransport(scope.noteId);
    transports.set(key, transport);
  }
  return transport;
}

export function notebookChatTransport(noteId: ChatId): ChatTransport {
  return {
    key: `notebook:${noteId}`,
    listChats: () => NotebookChatService.listChats(noteId),
    createChat: (init) => NotebookChatService.createChat(noteId, init?.title),
    getChat: (chatId, options) => NotebookChatService.getChat(noteId, chatId, options),
    sendMessage: (chatId, message, generation) =>
      NotebookChatService.sendMessage(noteId, chatId, message, generation),
    renameChat: (chatId, title) => NotebookChatService.renameChat(noteId, chatId, title),
    cancelTurn: (chatId) => NotebookChatService.cancelTurn(noteId, chatId),
    socketUrl: (chatId) => WS_ROUTES.NOTEBOOK_CHAT(noteId, chatId),
    deleteChat: (chatId) => NotebookChatService.deleteChat(noteId, chatId),
  };
}

export function assistantChatTransport(): ChatTransport {
  return {
    key: 'assistant',
    listChats: () => AssistantChatService.listChats(),
    createChat: (init) => AssistantChatService.createChat(init),
    getChat: (chatId, options) => AssistantChatService.getChat(chatId, options),
    sendMessage: (chatId, message, generation) =>
      AssistantChatService.sendMessage(chatId, message, generation),
    renameChat: (chatId, title) => AssistantChatService.renameChat(chatId, title),
    cancelTurn: (chatId) => AssistantChatService.cancelTurn(chatId),
    socketUrl: (chatId) => WS_ROUTES.ASSISTANT_CHAT(chatId),
    deleteChat: (chatId, options) => AssistantChatService.deleteChat(chatId, options),
  };
}
