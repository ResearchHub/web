import { newConversationTitle } from '../copy';
import type { AIModeChatState } from '../useAIModeChat';

export interface ConversationTitle {
  /** The title as stored, with no fallback; null on a new conversation or while still unknown. */
  readonly currentTitle: string | null;
  /** What the panes show: the title, or a placeholder for a new or untitled conversation. */
  readonly title: string;
  /** A conversation is open but neither the listing nor the chat itself has named it yet. */
  readonly loading: boolean;
}

/**
 * The open conversation's title. The listing usually knows it before the
 * chat itself has loaded, so a refresh doesn't flash "Untitled" while the
 * transcript is fetched.
 */
export function conversationTitleFor(state: AIModeChatState): ConversationTitle {
  const { chatId, list, chat, target } = state;
  const listedTitle =
    chatId == null ? null : (list.chats.find((item) => item.id === chatId)?.title ?? null);
  const currentTitle =
    chatId == null ? null : state.titleFor(chatId, chat.chat?.title ?? listedTitle);
  const loading =
    chatId != null && currentTitle == null && (chat.chat == null || list.access === 'loading');
  const title =
    chatId == null
      ? target.kind === 'document'
        ? 'New chat'
        : newConversationTitle(state.intent)
      : (currentTitle?.trim() ?? '') || 'Untitled conversation';
  return { currentTitle, title, loading };
}
