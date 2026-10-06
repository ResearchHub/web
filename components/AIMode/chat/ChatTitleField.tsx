'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MAX_CHAT_TITLE_LENGTH } from '@/types/agentChat';
import { cn } from '@/utils/styles';

interface ChatTitleFieldProps {
  readonly initialValue: string;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
  readonly className?: string;
}

/**
 * Inline title editor for a chat: Enter or blur commits, Escape cancels.
 * Escape is claimed here so nothing around the field — an overlay, a menu —
 * also acts on it.
 */
export function ChatTitleField({
  initialValue,
  onCommit,
  onCancel,
  className,
}: ChatTitleFieldProps) {
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
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onCommit(value)}
      maxLength={MAX_CHAT_TITLE_LENGTH}
      aria-label="Chat title"
      className={cn(
        'w-full min-w-0 rounded-md border border-primary-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none ring-2 ring-primary-100',
        className
      )}
    />
  );
}
