'use client';

import { useEffect, type KeyboardEvent, type RefObject } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/utils/styles';
import { MAX_CHAT_MESSAGE_LENGTH } from '@/types/notebookChat';

export interface ComposerNotice {
  tone: 'warning' | 'error';
  text: string;
}

interface ChatComposerProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSend: () => void;
  readonly onStop: () => void;
  /** A turn is running: send is disabled and the action button becomes Stop. */
  readonly busy: boolean;
  /**
   * Something cancellable exists server-side. Busy without this (message POST
   * still in flight, chat being created) keeps the disabled send button —
   * offering Stop then would no-op and the turn would start anyway.
   */
  readonly canStop: boolean;
  /** Hard-disable everything (chat unavailable). */
  readonly disabled: boolean;
  readonly notice: ComposerNotice | null;
  readonly placeholder?: string;
  /**
   * The textarea itself, owned by the parent: a preset drops its text into the
   * draft and then has to hand the caret over to the box the user edits.
   */
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const COUNTER_THRESHOLD = MAX_CHAT_MESSAGE_LENGTH - 1000;

/**
 * Message input. The draft is owned by the parent so it survives failed sends
 * (409 races, validation errors) and chat switches.
 */
export function ChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  busy,
  canStop,
  disabled,
  notice,
  placeholder = 'Ask the assistant…',
  textareaRef,
}: ChatComposerProps) {
  // Grow with content up to ~6 lines, then scroll.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const canSend = !disabled && !busy && value.trim().length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-3 pb-3 pt-2">
      {notice && (
        // <output> carries an implicit status role (polite live region).
        <output
          className={cn(
            'mb-1.5 block text-xs',
            notice.tone === 'warning' ? 'text-amber-600' : 'text-red-600'
          )}
        >
          {notice.text}
        </output>
      )}
      <div
        className={cn(
          'flex items-end gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all',
          'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500',
          disabled && 'opacity-60'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message the assistant"
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed"
        />
        {busy && canStop ? (
          <button
            type="button"
            onClick={onStop}
            title="Stop the assistant"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span className="sr-only">Stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            title="Send message"
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
              canSend
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            )}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Send</span>
          </button>
        )}
      </div>
      {value.length >= COUNTER_THRESHOLD && (
        <p className="mt-1 text-right text-[11px] text-gray-400">
          {value.length.toLocaleString()} / {MAX_CHAT_MESSAGE_LENGTH.toLocaleString()}
        </p>
      )}
    </div>
  );
}
