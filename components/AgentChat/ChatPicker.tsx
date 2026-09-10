'use client';

import type { ReactNode } from 'react';
import { Loader } from '@/components/ui/Loader';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { MenuTrigger } from '@/components/ui/MenuTrigger';
import { cn } from '@/utils/styles';
import { formatTimeAgo } from '@/utils/date';
import type { AgentChatListItem } from '@/types/agentChat';

interface ChatPickerProps {
  readonly chats: AgentChatListItem[];
  readonly activeChatId: number | null;
  /** Live title of the open chat — fresher than the listing after renames/derives. */
  readonly activeTitle: string | null;
  readonly onSelect: (chatId: number) => void;
  /** Fired when the dropdown opens — refresh the listing projection. */
  readonly onOpen: () => void;
  /**
   * Control for the open chat's title, seated right after the picker. A slot
   * rather than a prop pair so the picker stays ignorant of what the action
   * is — it only owns where it sits.
   */
  readonly titleAction?: ReactNode;
}

/**
 * Header dropdown for switching between the note's chats. Built on the cheap
 * listing projection: title, preview, activity spinner — never full chats.
 *
 * Switching is all it does. Starting a chat lives on the header button beside
 * it, where it is one tap rather than two.
 */
export function ChatPicker({
  chats,
  activeChatId,
  activeTitle,
  onSelect,
  onOpen,
  titleAction,
}: ChatPickerProps) {
  const currentLabel = activeChatId == null ? 'New chat' : activeTitle?.trim() || 'Untitled chat';

  return (
    // Claims the row so the header's panel actions stay pinned right, but
    // nothing inside grows: the picker and the title action sit together at
    // the left and the slack collects after them. Only a title long enough to
    // need the space takes it, truncating rather than shoving.
    <div className="flex min-w-0 flex-1 items-center">
      <BaseMenu
        align="start"
        className="w-[320px] max-w-[calc(100vw-1rem)] rounded-lg"
        onOpenChange={(open) => {
          if (open) onOpen();
        }}
        trigger={
          <MenuTrigger srLabel="Chat:" className="text-sm text-gray-800">
            {currentLabel}
          </MenuTrigger>
        }
      >
        {/* The listing is empty until the first chat is saved, and the menu
            would otherwise open as a bare box. */}
        {chats.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500">No chats on this note yet.</p>
        )}

        {chats.map((chat) => (
          <BaseMenuItem
            key={chat.id}
            onSelect={() => onSelect(chat.id)}
            aria-current={chat.id === activeChatId}
            className={cn(
              'cursor-pointer items-start rounded-md px-3 py-2',
              'focus:bg-gray-50 data-[highlighted]:bg-gray-50',
              chat.id === activeChatId &&
                'bg-primary-50/60 focus:bg-primary-50/60 data-[highlighted]:bg-primary-50/60'
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="min-w-0 truncate text-sm font-medium text-gray-800">
                  {chat.title?.trim() || 'Untitled chat'}
                </span>
                {chat.has_active_turn && (
                  <Loader size="sm" className="!h-3 !w-3 shrink-0 text-primary-500" />
                )}
              </div>
              {chat.last_message_preview && (
                <p className="mt-0.5 truncate text-xs text-gray-500">{chat.last_message_preview}</p>
              )}
              <p className="mt-0.5 text-[11px] text-gray-400">{formatTimeAgo(chat.updated_date)}</p>
            </div>
          </BaseMenuItem>
        ))}
      </BaseMenu>

      {titleAction}
    </div>
  );
}
