'use client';

import type { ReactNode } from 'react';
import { SquarePen } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { MenuTrigger } from '@/components/ui/MenuTrigger';
import { cn } from '@/utils/styles';
import { formatTimeAgo } from '@/utils/date';
import type { AgentChatListItem } from '@/types/agentChat';
import { AssistantActivityDot } from './AssistantActivityDot';

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
  /** What opens the menu, in place of the open chat's title. */
  readonly trigger?: ReactNode;
  /** Offers a new chat as the menu's first item. */
  readonly onNewChat?: () => void;
  /** The listing could not be loaded; the menu offers to try again. */
  readonly failed?: boolean;
  readonly className?: string;
}

/**
 * A dropdown for switching between a document's chats. Built on the cheap
 * listing projection: title, preview, activity dot — never full chats.
 *
 * In the notebook it is the header's title and switching is all it does;
 * starting a chat lives on the header button beside it, where it is one tap
 * rather than two. The workspace opens it from an icon, with "New chat" first.
 */
export function ChatPicker({
  chats,
  activeChatId,
  activeTitle,
  onSelect,
  onOpen,
  titleAction,
  trigger,
  onNewChat,
  failed = false,
  className,
}: ChatPickerProps) {
  const currentLabel = activeChatId == null ? 'New chat' : activeTitle?.trim() || 'Untitled chat';

  return (
    // Claims the row so the header's panel actions stay pinned right, but
    // nothing inside grows: the picker and the title action sit together at
    // the left and the slack collects after them. Only a title long enough to
    // need the space takes it, truncating rather than shoving.
    <div className={cn('flex min-w-0 flex-1 items-center', className)}>
      <BaseMenu
        align={trigger ? 'end' : 'start'}
        className="w-[320px] max-w-[calc(100vw-1rem)] rounded-lg"
        onOpenChange={(open) => {
          if (open) onOpen();
        }}
        trigger={
          trigger ?? (
            <MenuTrigger srLabel="Chat:" className="text-sm text-gray-800">
              {currentLabel}
            </MenuTrigger>
          )
        }
      >
        {onNewChat && (
          <>
            <BaseMenuItem
              onSelect={onNewChat}
              className="cursor-pointer gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-900 focus:bg-gray-50 data-[highlighted]:bg-gray-50"
            >
              <SquarePen className="h-4 w-4 text-primary-600" aria-hidden="true" />
              New chat
            </BaseMenuItem>
            {chats.length > 0 && (
              <div aria-hidden="true" className="mx-1.5 my-1 h-px bg-gray-200" />
            )}
          </>
        )}

        {failed && chats.length === 0 && (
          <BaseMenuItem
            onSelect={(event) => {
              // Stays open to show what the retry brings back.
              event.preventDefault();
              onOpen();
            }}
            className="cursor-pointer flex-col items-start gap-0.5 rounded-md px-3 py-2 focus:bg-gray-50 data-[highlighted]:bg-gray-50"
          >
            <span className="text-sm text-gray-600">Couldn’t load chats.</span>
            <span className="text-xs font-medium text-primary-600">Try again</span>
          </BaseMenuItem>
        )}

        {/* The listing is empty until the first chat is saved, and the menu
            would otherwise open as a bare box. */}
        {chats.length === 0 && !onNewChat && !failed && (
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
                  <AssistantActivityDot state="working" className="ml-auto shrink-0 pl-1" />
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
