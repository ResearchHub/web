'use client';

import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
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
  /** Start a fresh conversation; always the first entry in the menu. */
  readonly onNew: () => void;
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
 * Header dropdown for the note's conversations. Built on the cheap listing
 * projection: title, preview, activity spinner — never full chats.
 *
 * The trigger always reads "Conversations" so it never looks like an action;
 * the open conversation's title sits beside it. Opening the menu always
 * offers "New conversation" first, as the same bordered button the assistant
 * uses at the top of its own list, then the conversations.
 */
export function ChatPicker({
  chats,
  activeChatId,
  activeTitle,
  onSelect,
  onNew,
  onOpen,
  titleAction,
}: ChatPickerProps) {
  return (
    // Claims the row so the header's panel actions stay pinned right, but
    // nothing inside grows: the picker and the title action sit together at
    // the left and the slack collects after them. Only a title long enough to
    // need the space takes it, truncating rather than shoving.
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <BaseMenu
        align="start"
        className="w-[320px] max-w-[calc(100vw-1rem)] rounded-lg"
        onOpenChange={(open) => {
          if (open) onOpen();
        }}
        trigger={
          <MenuTrigger className="shrink-0 text-sm text-gray-800">Conversations</MenuTrigger>
        }
      >
        <BaseMenuItem
          onSelect={onNew}
          className={cn(
            'mb-1 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2',
            'text-sm font-medium text-gray-900 shadow-sm focus:bg-gray-50 data-[highlighted]:bg-gray-50',
            activeChatId == null &&
              'border-primary-200 bg-primary-50 data-[highlighted]:bg-primary-50'
          )}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          New conversation
        </BaseMenuItem>
        <div role="separator" aria-orientation="horizontal" className="my-1 h-px bg-gray-100" />

        {/* The listing is empty until the first conversation is saved, and
            the menu would otherwise end on a bare divider. */}
        {chats.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500">No conversations on this note yet.</p>
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
                  {chat.title?.trim() || 'Untitled conversation'}
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

      {activeChatId != null && (
        <>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-gray-200" />
          <span className="min-w-0 truncate text-sm text-gray-600">
            {activeTitle?.trim() || 'Untitled conversation'}
          </span>
        </>
      )}

      {titleAction}
    </div>
  );
}
