'use client';

import { useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
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
  /** Fired when the dropdown opens — refresh the listing projection. */
  readonly onOpen: () => void;
  /**
   * Control for the open chat's title, seated between the label and the
   * chevron. A slot rather than a prop pair so the picker stays ignorant of
   * what the action is — it only owns where it sits.
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
    // Claims the row so the header's panel actions stay pinned right, but
    // nothing inside grows: label, title action and chevron sit together at the
    // left and the slack collects after them. Only a title long enough to need
    // the space takes it, truncating rather than shoving.
    <div ref={containerRef} className="relative flex min-w-0 flex-1 items-center">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-w-0 items-center rounded-md px-1.5 py-1 text-left transition-colors hover:bg-gray-100"
      >
        <span className="min-w-0 truncate text-sm font-medium text-gray-800">{currentLabel}</span>
      </button>

      {titleAction}

      {/* Opens the same menu as the label — split off only so the title action
          can sit between them. Kept out of the tab order and the a11y tree:
          the label button already announces and operates the menu, and a
          second stop on the same control is noise. */}
      <button
        type="button"
        onClick={toggle}
        tabIndex={-1}
        aria-hidden="true"
        className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="animate-in absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {/* The listing is empty until the first chat is saved, and the menu
              would otherwise open as a bare box. */}
          {chats.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">No chats on this note yet.</p>
          )}

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
