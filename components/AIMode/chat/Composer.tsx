'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/utils/styles';

const MAX_HEIGHT_PX = 160;

interface ComposerProps {
  readonly onSend: (value: string) => void;
  readonly disabled: boolean;
  readonly placeholder?: string;
  readonly autoFocus?: boolean;
  readonly className?: string;
}

export const Composer = ({
  onSend,
  disabled,
  placeholder = 'Reply, or pick a suggestion above…',
  autoFocus = false,
  className,
}: ComposerProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors',
        'focus-within:border-primary-400',
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        autoFocus={autoFocus}
        rows={1}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="Send message"
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
          canSend
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'cursor-not-allowed bg-gray-100 text-gray-400'
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
};
