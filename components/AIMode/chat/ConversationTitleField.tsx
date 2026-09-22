'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { MAX_CHAT_TITLE_LENGTH } from '@/types/agentChat';
import { cn } from '@/utils/styles';

interface ConversationTitleFieldProps {
  readonly initialValue: string;
  readonly onCommit: (value: string) => void;
  readonly onCancel: () => void;
  readonly className?: string;
}

/**
 * Inline title editor: Enter or blur commits, Escape cancels. Escape is
 * claimed here so the overlay's own Esc handler doesn't close it.
 */
export function ConversationTitleField({
  initialValue,
  onCommit,
  onCancel,
  className,
}: ConversationTitleFieldProps) {
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
      aria-label="Conversation title"
      className={cn(
        'w-full min-w-0 rounded-md border border-primary-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none ring-2 ring-primary-100',
        className
      )}
    />
  );
}
