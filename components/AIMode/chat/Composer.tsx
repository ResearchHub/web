'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, FileText, Link2, Paperclip, Square, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';
import { createId } from '../lib/ids';
import type { Attachment } from '../lib/types';

const MAX_HEIGHT_PX = 160;

export interface SlashCommand {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  run: () => void;
}

interface ComposerProps {
  readonly onSend: (value: string, attachments: Attachment[]) => void;
  readonly disabled: boolean;
  /** Shows a stop control in place of send while a turn is generating. */
  readonly isGenerating?: boolean;
  readonly onStop?: () => void;
  readonly placeholder?: string;
  readonly autoFocus?: boolean;
  readonly className?: string;
  /** Text to load into the input, e.g. a message being edited. */
  readonly draft?: string | null;
  readonly onDraftConsumed?: () => void;
  /** Offered when the input starts with `/`. */
  readonly commands?: SlashCommand[];
}

const URL_PATTERN = /^https?:\/\/\S+$/i;

const formatBytes = (bytes: number) =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;

const linkAttachment = (href: string): Attachment => {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/$/, '');
    const tail = path.split('/').filter(Boolean).slice(-2).join('/');
    return {
      id: createId('att'),
      kind: 'link',
      name: tail ? `${url.hostname}/${tail}` : url.hostname,
      meta: href,
    };
  } catch {
    return { id: createId('att'), kind: 'link', name: href, meta: href };
  }
};

/**
 * The input. Grows with its content, takes files and pasted links as chips,
 * offers slash commands, and turns into a stop control while the assistant is
 * mid-turn — the things a funder who has used any modern assistant expects.
 */
export const Composer = ({
  onSend,
  disabled,
  isGenerating = false,
  onStop,
  placeholder = 'Reply, or pick a suggestion above…',
  autoFocus = false,
  className,
  draft = null,
  onDraftConsumed,
  commands = [],
}: ComposerProps) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [commandIndex, setCommandIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  // An edited message lands here ready to change and resend.
  useEffect(() => {
    if (draft === null) return;
    setValue(draft);
    onDraftConsumed?.();
    requestAnimationFrame(() => {
      const element = textareaRef.current;
      element?.focus();
      element?.setSelectionRange(element.value.length, element.value.length);
    });
  }, [draft]);

  const commandQuery =
    value.startsWith('/') && !value.includes('\n') ? value.slice(1).trim() : null;
  const matchingCommands = useMemo(() => {
    if (commandQuery === null) return [];
    const query = commandQuery.toLowerCase();
    return commands.filter((command) => command.label.toLowerCase().includes(query));
  }, [commandQuery, commands]);
  const isMenuOpen = matchingCommands.length > 0;

  useEffect(() => {
    setCommandIndex(0);
  }, [commandQuery]);

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim(), attachments);
    setValue('');
    setAttachments([]);
  };

  const runCommand = (command: SlashCommand) => {
    setValue('');
    command.run();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isMenuOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCommandIndex((index) => (index + 1) % matchingCommands.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCommandIndex((index) => (index - 1 + matchingCommands.length) % matchingCommands.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        runCommand(matchingCommands[commandIndex]);
        return;
      }
      if (event.key === 'Escape') {
        // Closes the menu only; the overlay's own Escape handler must not
        // see this one and close AI Mode.
        event.preventDefault();
        event.stopPropagation();
        setValue('');
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  // A pasted link becomes a chip rather than a wall of URL in the input.
  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = event.clipboardData.getData('text').trim();
    if (!URL_PATTERN.test(text)) return;

    event.preventDefault();
    setAttachments((previous) => [...previous, linkAttachment(text)]);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added: Attachment[] = Array.from(files).map((file) => ({
      id: createId('att'),
      kind: 'file',
      name: file.name,
      meta: formatBytes(file.size),
    }));
    setAttachments((previous) => [...previous, ...added]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((previous) => previous.filter((attachment) => attachment.id !== id));
  };

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-[380px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
            role="listbox"
          >
            {matchingCommands.map((command, index) => {
              const Icon = command.icon;
              const isActive = index === commandIndex;
              return (
                <button
                  key={command.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setCommandIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runCommand(command)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                    isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  {Icon && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-gray-200">
                      <Icon className="h-3.5 w-3.5 text-gray-600" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900">{command.label}</span>
                    {command.description && (
                      <span className="block truncate text-xs text-gray-500">
                        {command.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm transition-[border-color,box-shadow]',
          'focus-within:border-primary-400 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
        )}
      >
        <AnimatePresence initial={false}>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-2 flex flex-wrap gap-1.5 px-1 pt-0.5">
                {attachments.map((attachment) => (
                  <span
                    key={attachment.id}
                    className="inline-flex max-w-[260px] items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 py-1 pl-2 pr-1 text-xs text-gray-700"
                  >
                    {attachment.kind === 'link' ? (
                      <Link2 className="h-3 w-3 shrink-0 text-gray-400" />
                    ) : (
                      <FileText className="h-3 w-3 shrink-0 text-gray-400" />
                    )}
                    <span className="truncate font-medium">{attachment.name}</span>
                    {attachment.kind === 'file' && attachment.meta && (
                      <span className="shrink-0 text-gray-400">{attachment.meta}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      aria-label={`Remove ${attachment.name}`}
                      className="ml-0.5 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
            title="Attach a file or paste a link"
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />

          <textarea
            ref={textareaRef}
            value={value}
            autoFocus={autoFocus}
            rows={1}
            placeholder={placeholder}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />

          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop"
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-700"
            >
              <Square className="h-3 w-3 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              className={cn(
                'mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                canSend
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
