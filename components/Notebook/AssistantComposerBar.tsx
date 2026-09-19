'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { chatPresetsFor, type ChatPresetContext } from '@/components/AgentChat/ChatPresets';
import { cn } from '@/utils/styles';

/** Tallest the input grows before it scrolls, in px: about five lines. */
const MAX_INPUT_HEIGHT = 120;
/** How long the pill takes to widen, matching its CSS transition. */
const EXPAND_MS = 200;

interface AssistantComposerBarProps extends ChatPresetContext {
  /** Hands the message to the conversation; the bar clears itself. */
  readonly onSubmit: (message: string) => void;
  /**
   * Folded into a single chip, as it is once the person starts typing in the
   * document: the chips fold away and the input shrinks in place. Clicking the
   * chip asks for the full bar back.
   */
  readonly collapsed: boolean;
  readonly onExpand: () => void;
  readonly className?: string;
}

/**
 * The composer over the document: a single input with the document's opening
 * moves as chips above it, in short form. A chip loads its full message into
 * the input for editing, the same as the panel's cards; Enter sends,
 * Shift+Enter breaks a line. The whole thing folds into one gray "Ask AI"
 * badge while the person is writing, animating as one element so nothing
 * jumps; phones start folded, since the full bar would cover most of a
 * small screen.
 */
export function AssistantComposerBar({
  noteIsEmpty,
  noteKind,
  hasSelectedRfp,
  onSubmit,
  collapsed,
  onExpand,
  className,
}: AssistantComposerBarProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const presets = chatPresetsFor({ noteIsEmpty, noteKind, hasSelectedRfp });

  // The input mounts once the pill has widened: mounted mid-transition it
  // would wrap its placeholder inside a still-narrow pill and jump in height.
  const [inputMounted, setInputMounted] = useState(!collapsed);
  // Unfolding was asked for, so the input takes focus once it exists; a note
  // switch that starts unfolded must not steal focus from the document.
  const focusOnMountRef = useRef(false);
  const wasCollapsedRef = useRef(collapsed);
  useEffect(() => {
    if (collapsed) {
      setInputMounted(false);
      wasCollapsedRef.current = true;
      return;
    }
    if (wasCollapsedRef.current) focusOnMountRef.current = true;
    wasCollapsedRef.current = false;
    const timer = window.setTimeout(() => setInputMounted(true), EXPAND_MS);
    return () => window.clearTimeout(timer);
  }, [collapsed]);
  useEffect(() => {
    if (!inputMounted || !focusOnMountRef.current) return;
    focusOnMountRef.current = false;
    textareaRef.current?.focus();
  }, [inputMounted]);

  // Grow with the text, then scroll.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [value, inputMounted]);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  const pick = (message: string) => {
    setValue(message);
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    requestAnimationFrame(() => el.setSelectionRange(message.length, message.length));
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div
        aria-hidden={collapsed}
        className={cn(
          'flex flex-wrap justify-center gap-2 overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none',
          collapsed
            ? 'pointer-events-none mb-0 max-h-0 -translate-y-1 opacity-0'
            : 'mb-2.5 max-h-24 opacity-100'
        )}
      >
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            tabIndex={collapsed ? -1 : 0}
            onClick={() => pick(preset.message)}
            title={preset.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5',
              'text-[13px] font-semibold text-gray-700 shadow-sm transition-colors',
              'hover:border-gray-300 hover:bg-gray-200 hover:text-gray-900',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <preset.icon className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            {preset.chipLabel}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex items-end gap-1.5 overflow-hidden rounded-[26px] border',
          'transition-[width,padding,background-color,box-shadow] duration-200 ease-out motion-reduce:transition-none',
          collapsed
            ? 'w-[7rem] border-gray-200 bg-gray-100 p-0 shadow-sm hover:border-gray-300 hover:bg-gray-200'
            : cn(
                'w-full border-gray-200 bg-white py-1 pl-2 pr-1 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.28)]',
                'focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100'
              )
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onExpand}
            title="Ask the research assistant"
            className="flex h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-semibold text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden="true" />
            Ask AI
          </button>
        ) : !inputMounted ? (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-600"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4" />
          </span>
        ) : (
          <>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-600"
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <label htmlFor="assistant-composer-bar" className="sr-only">
              Ask the research assistant
            </label>
            <textarea
              id="assistant-composer-bar"
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the research assistant…"
              className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-5 text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </form>
    </div>
  );
}
