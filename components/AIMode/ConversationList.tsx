'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MoreHorizontal, Pencil, Plus } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';
import {
  MAX_CHAT_TITLE_LENGTH,
  type ChatNoteRef,
  type NotebookChatListItem,
} from '@/types/notebookChat';
import type { ChatListAccess } from '@/hooks/useNotebookChat';

const UNTITLED = 'Untitled conversation';

interface ConversationListProps {
  readonly chats: NotebookChatListItem[];
  readonly access: ChatListAccess;
  readonly accessDetail: string | null;
  readonly activeChatId: number | null;
  /** Live title of the open chat — fresher than the listing after renames and derives. */
  readonly activeTitle: string | null;
  readonly onSelect: (chatId: number) => void;
  readonly onNew: () => void;
  readonly onRename: (chatId: number, title: string) => Promise<boolean>;
  readonly onRetry: () => void;
}

/**
 * The left pane: the user's assistant conversations, newest activity first
 * as the server orders them. Rows rename through a menu; nothing deletes,
 * because the backend has no endpoint for it.
 */
export function ConversationList({
  chats,
  access,
  accessDetail,
  activeChatId,
  activeTitle,
  onSelect,
  onNew,
  onRename,
  onRetry,
}: ConversationListProps) {
  const [renamingId, setRenamingId] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-3">
        <button
          type="button"
          onClick={onNew}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50',
            activeChatId == null && 'border-primary-200 bg-primary-50 hover:bg-primary-50'
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New conversation
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {access === 'loading' && (
          <div className="flex justify-center py-6">
            <Loader size="sm" className="text-primary-500" />
          </div>
        )}

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

        {chats.map((item) => {
          const isActive = item.id === activeChatId;
          const title = (isActive ? activeTitle : null) ?? item.title;
          return (
            <ConversationRow
              key={item.id}
              item={item}
              title={title?.trim() || UNTITLED}
              isActive={isActive}
              renaming={renamingId === item.id}
              onSelect={() => onSelect(item.id)}
              onStartRename={() => setRenamingId(item.id)}
              onCancelRename={() => setRenamingId(null)}
              onCommitRename={async (value) => {
                setRenamingId(null);
                const next = value.trim();
                if (!next || next === (title ?? '')) return;
                await onRename(item.id, next);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ConversationRowProps {
  readonly item: NotebookChatListItem;
  readonly title: string;
  readonly isActive: boolean;
  readonly renaming: boolean;
  readonly onSelect: () => void;
  readonly onStartRename: () => void;
  readonly onCancelRename: () => void;
  readonly onCommitRename: (value: string) => void;
}

function ConversationRow({
  item,
  title,
  isActive,
  renaming,
  onSelect,
  onStartRename,
  onCancelRename,
  onCommitRename,
}: ConversationRowProps) {
  return (
    <div
      className={cn(
        'group relative mb-1 rounded-lg transition-colors',
        isActive ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-100'
      )}
    >
      {renaming ? (
        <RenameField
          initialValue={item.title ?? ''}
          onCommit={onCommitRename}
          onCancel={onCancelRename}
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-current={isActive ? 'true' : undefined}
          className="w-full px-3 py-2 pr-9 text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="min-w-0 truncate text-sm font-medium text-gray-900">{title}</span>
            {item.has_active_turn && (
              <Loader size="sm" className="!h-3 !w-3 shrink-0 text-primary-500" />
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-gray-400">{formatTimeAgo(item.updated_date)}</p>
        </button>
      )}

      {!renaming && (
        <div
          className={cn(
            'absolute right-1.5 top-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100',
            isActive && 'opacity-100'
          )}
        >
          <BaseMenu
            align="end"
            trigger={
              <button
                type="button"
                aria-label="Conversation options"
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
          >
            <BaseMenuItem onSelect={onStartRename} className="gap-2 text-gray-700">
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Rename
            </BaseMenuItem>
          </BaseMenu>
        </div>
      )}
    </div>
  );
}

function RenameField({
  initialValue,
  onCommit,
  onCancel,
}: {
  readonly initialValue: string;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCommit(value);
    } else if (event.key === 'Escape') {
      // Claimed here so the overlay's own Esc handler doesn't close it.
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className="px-2 py-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCommit(value)}
        maxLength={MAX_CHAT_TITLE_LENGTH}
        aria-label="Conversation title"
        className="w-full rounded-md border border-primary-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none ring-2 ring-primary-100"
      />
    </div>
  );
}
