'use client';

import {
  useEffect,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { ArrowUp, Paperclip, Square } from 'lucide-react';
import { pastedFiles } from '@/utils/pastedFiles';
import { cn } from '@/utils/styles';
import { useAgentFileLimits, type ChatAttachments } from '@/hooks/useChatAttachments';
import { useFileDrop } from '@/hooks/useFileDrop';
import { MAX_CHAT_MESSAGE_LENGTH } from '@/types/agentChat';
import { agentFileExtensions, maxFileMegabytes } from '@/types/agentFile';
import { ComposerAttachmentList } from './ChatAttachments';

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
  readonly sendDisabled?: boolean;
  readonly footer?: ReactNode;
  readonly notice: ComposerNotice | null;
  readonly placeholder?: string;
  /**
   * The textarea itself, owned by the parent: a preset drops its text into the
   * draft and then has to hand the caret over to the box the user edits.
   */
  readonly textareaRef: RefObject<HTMLTextAreaElement | null>;
  /**
   * Controls seated on the action row, left of the send button — the model
   * picker today. A slot rather than props so the composer stays ignorant of
   * what is being configured and owns only where it sits.
   */
  readonly toolbar?: ReactNode;
  /** Extra classes for the outer wrapper — a host can drop the top border it already draws. */
  readonly className?: string;
  /** Files to send with the message; left out, the composer takes none. */
  readonly attachments?: Pick<
    ChatAttachments,
    'items' | 'notice' | 'ready' | 'sendableAlone' | 'add' | 'remove'
  >;
  /** What takes file drops for this composer: the whole pane, say. Itself by default. */
  readonly dropTargetRef?: RefObject<HTMLElement | null>;
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
  sendDisabled = false,
  footer,
  notice,
  placeholder = 'Ask the assistant…',
  textareaRef,
  toolbar,
  className,
  attachments,
  dropTargetRef,
}: ChatComposerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileLimits = useAgentFileLimits();
  const addFiles = attachments?.add ?? null;
  const dragging = useFileDrop(dropTargetRef ?? wrapperRef, disabled ? null : addFiles);

  // Grow with content up to ~6 lines, then scroll.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  // The server refuses the whole message if any of its files cannot be sent.
  const filesReady = attachments?.ready ?? true;
  const hasContent = value.trim().length > 0 || (attachments?.sendableAlone ?? false);
  const canSend = !disabled && !sendDisabled && !busy && hasContent && filesReady;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleFilesPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    // Cleared so picking the same file again still fires a change.
    event.target.value = '';
    if (picked.length > 0) addFiles?.(picked);
    textareaRef.current?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!addFiles) return;
    const pasted = pastedFiles(event.clipboardData);
    // Anything else, text above all, is left for the browser to paste.
    if (pasted.length === 0) return;
    event.preventDefault();
    addFiles(pasted);
  };

  const handleRemoveFile = (key: string) => {
    attachments?.remove(key);
    // The chip's button is gone; keep focus in the composer.
    textareaRef.current?.focus();
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('border-t border-gray-100 bg-white px-3 pb-3 pt-2', className)}
    >
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
      {attachments?.notice && (
        <output className="mb-1.5 block text-xs text-red-600">{attachments.notice}</output>
      )}
      {/* Two rows rather than one: the message sits above its own controls, so
          the toolbar can grow without the send button drifting off the text.
          Positioned, because the toolbar's menus open against this box —
          anchored to their own buttons they would run off a 360px panel. */}
      <div
        className={cn(
          'relative rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all',
          'focus-within:border-gray-400',
          disabled && 'opacity-60'
        )}
      >
        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary-400 bg-primary-50/95 text-sm font-medium text-primary-700">
            Drop files to attach
          </div>
        )}
        {attachments && (
          <ComposerAttachmentList items={attachments.items} onRemove={handleRemoveFile} />
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message the assistant"
          className="block max-h-40 min-h-[24px] w-full resize-none bg-transparent text-md text-gray-800 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="mt-1.5 flex items-center gap-2">
          {attachments && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={agentFileExtensions(fileLimits).join(',')}
                onChange={handleFilesPicked}
                disabled={disabled}
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                title={`Attach files: PDF, Word, text, or images, up to ${maxFileMegabytes(fileLimits)} MB each`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Paperclip className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Attach files</span>
              </button>
            </>
          )}
          <div className="min-w-0 flex-1">{toolbar}</div>
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
              title={filesReady ? 'Send message' : 'Waiting for attached files'}
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
      </div>
      {footer}
      {value.length >= COUNTER_THRESHOLD && (
        <p className="mt-1 text-right text-[11px] text-gray-400">
          {value.length.toLocaleString()} / {MAX_CHAT_MESSAGE_LENGTH.toLocaleString()}
        </p>
      )}
    </div>
  );
}
