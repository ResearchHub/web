'use client';

import { useState } from 'react';
import { Loader } from '@/components/ui/Loader';
import { ConversationListSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { Button } from '@/components/ui/Button';
import type { ChatListAccess } from '@/hooks/useAgentChat';
import type { AgentChatListItem, ChatNoteRef } from '@/types/agentChat';
import { ConversationTitleField } from '../chat/ConversationTitleField';
import { ConversationMenu } from './ConversationMenu';
import { SidebarGroupHeading } from './SidebarGroupHeading';
import { SidebarRow } from './SidebarRow';

const UNTITLED = 'Untitled conversation';
/** Recent conversations shown before the list asks to be expanded. */
const RECENT_COUNT = 8;

interface ConversationsSectionProps {
  readonly chats: AgentChatListItem[];
  readonly access: ChatListAccess;
  readonly accessDetail: string | null;
  readonly activeChatId: number | null;
  /** Resolves a row's title, showing a rename before the server confirms it. */
  readonly titleFor: (chatId: number, fallback: string | null) => string | null;
  readonly onSelect: (item: AgentChatListItem) => void;
  readonly onRename: (chatId: number, title: string) => Promise<boolean>;
  readonly onDelete: (chatId: number, options: { deleteNotes: boolean }) => Promise<boolean>;
  readonly loadNotes: (chatId: number) => Promise<ChatNoteRef[]>;
  readonly onRetry: () => void;
}

/**
 * The user's conversations, newest activity first as the server orders them,
 * the most recent few at a time. Rows rename and delete through a menu.
 */
export function ConversationsSection({
  chats,
  access,
  accessDetail,
  activeChatId,
  titleFor,
  onSelect,
  onRename,
  onDelete,
  loadNotes,
  onRetry,
}: ConversationsSectionProps) {
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  // The open conversation always shows, so selecting an older one from the
  // full list does not fold it back out of sight.
  const shown = showAll
    ? chats
    : chats.filter((item, index) => index < RECENT_COUNT || item.id === activeChatId);
  const hiddenCount = chats.length - shown.length;

  return (
    <section aria-label="Conversations">
      <SidebarGroupHeading>Conversations</SidebarGroupHeading>

      {access === 'loading' && <ConversationListSkeleton />}

      {access === 'hidden' && (
        <p className="px-3 py-2 text-xs leading-relaxed text-red-600">
          {accessDetail ?? 'You don’t have access to the assistant.'}
        </p>
      )}

      {access === 'error' && (
        <div className="flex flex-col items-start gap-2 px-3 py-2">
          <p className="text-xs leading-relaxed text-gray-600">
            {accessDetail ?? 'Couldn’t load your conversations.'}
          </p>
          <Button variant="outlined" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}

      {access === 'ok' && chats.length === 0 && (
        <p className="px-3 py-2 text-xs text-gray-400">No conversations yet.</p>
      )}

      {shown.map((item) => {
        const isActive = item.id === activeChatId;
        const resolved = titleFor(item.id, item.title);
        const title = resolved?.trim() || UNTITLED;
        return (
          <SidebarRow
            key={item.id}
            title={title}
            isActive={isActive}
            onSelect={() => onSelect(item)}
            titleAdornment={
              item.has_active_turn && (
                <Loader size="sm" className="!h-3 !w-3 shrink-0 text-primary-500" />
              )
            }
            editing={
              renamingId === item.id && (
                <ConversationTitleField
                  initialValue={title === UNTITLED ? '' : title}
                  onCancel={() => setRenamingId(null)}
                  onCommit={async (value) => {
                    setRenamingId(null);
                    const next = value.trim();
                    if (!next || next === (resolved ?? '')) return;
                    await onRename(item.id, next);
                  }}
                  className="text-[13px]"
                />
              )
            }
            menu={
              <ConversationMenu
                title={title}
                onRename={() => setRenamingId(item.id)}
                onDelete={(options) => onDelete(item.id, options)}
                loadNotes={() => loadNotes(item.id)}
              />
            }
          />
        );
      })}

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="ml-1 mt-0.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900"
        >
          Show all ({chats.length})
        </button>
      )}
    </section>
  );
}
