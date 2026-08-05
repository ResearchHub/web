'use client';

import { useCallback, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

interface ChatComposerProps {
  /** Blocks sending (e.g. while a turn is already running). */
  disabled: boolean;
  error: string | null;
  onClearError: () => void;
  /** Resolves true when the message was accepted; the input clears then. */
  onSend: (text: string) => Promise<boolean>;
}

const MAX_TEXTAREA_HEIGHT_PX = 140;

export function ChatComposer({ disabled, error, onClearError, onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, []);

  const submit = useCallback(async () => {
    if (disabled || !text.trim()) return;
    const accepted = await onSend(text);
    if (accepted) {
      setText('');
      const el = textareaRef.current;
      if (el) el.style.height = 'auto';
    }
  }, [disabled, text, onSend]);

  return (
    <div className="border-t border-gray-200 p-3">
      {error && (
        <p className="mb-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2',
          'focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20'
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          rows={1}
          placeholder="Ask about this note or request an edit…"
          className="max-h-[140px] min-h-[24px] flex-1 resize-none border-none bg-transparent text-sm leading-6 outline-none placeholder:text-gray-400"
          onChange={(event) => {
            setText(event.target.value);
            if (error) onClearError();
            resize();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          disabled={disabled || !text.trim()}
          onClick={() => void submit()}
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
