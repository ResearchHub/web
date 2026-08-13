'use client';

import { useRef, useState } from 'react';
import { ChevronDown, MessageSquarePlus } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import { useOutsidePointerDown } from '@/hooks/useOutsidePointerDown';
import { formatTimeAgo } from '@/utils/date';
import type { NotebookChatListItem } from '@/types/notebookChat';

interface ChatPickerProps {
  readonly chats: NotebookChatListItem[];
  readonly activeChatId: number | null;
  /** Live title of the open chat — fresher than the listing after renames/derives. */
  readonly activeTitle: string | null;
  readonly onSelect: (chatId: number) => void;
  readonly onNewChat: () => void;
  /** Fired when the dropdown opens — refresh the listing projection. */
  readonly onOpen: () => void;
}

/**
 * Header dropdown for switching between the note's chats. Built on the cheap
 * listing projection: title, preview, activity spinner — never full chats.
 */
export function ChatPicker({
  chats,
  activeChatId,
  activeTitle,
  onSelect,
  onNewChat,
  onOpen,
}: ChatPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsidePointerDown(containerRef, () => setOpen(false), open);

  const currentLabel = activeChatId == null ? 'New chat' : activeTitle?.trim() || 'Untitled chat';

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onOpen();
  };

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-gray-100"
      >
        <span className="min-w-0 truncate text-sm font-medium text-gray-800">{currentLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="animate-in absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNewChat();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            <MessageSquarePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            New chat
          </button>

          {chats.length > 0 && <div className="my-1 border-t border-gray-100" />}

          {chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(chat.id);
              }}
              className={cn(
                'flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-50',
                chat.id === activeChatId && 'bg-primary-50/60'
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
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {chat.last_message_preview}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {formatTimeAgo(chat.updated_date)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
