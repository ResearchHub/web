'use client';

import { cn } from '@/utils/styles';
import type { NotebookChatRole } from '@/types/notebookChat';

interface ChatMessageItemProps {
  role: NotebookChatRole;
  content: string;
  /** Optimistic user message whose POST is still in flight. */
  isPending?: boolean;
}

export function ChatMessageItem({ role, content, isPending = false }: ChatMessageItemProps) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-primary-500 text-white'
            : 'rounded-bl-md bg-gray-100 text-gray-900',
          isPending && 'opacity-70'
        )}
      >
        {content}
      </div>
    </div>
  );
}
