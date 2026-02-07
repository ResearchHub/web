'use client';

import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/assistant';
import { BotMessage } from './BotMessage';
import { UserMessage } from './UserMessage';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onStructuredInput?: (field: string, value: any, displayText: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  onStructuredInput,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {messages.length === 0 && !isTyping && (
        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
          Starting conversation...
        </div>
      )}

      {messages.map((msg, index) => {
        const isLatest = index === messages.length - 1;
        if (msg.role === 'bot') {
          return (
            <BotMessage
              key={msg.id}
              message={msg}
              isLatest={isLatest}
              onStructuredInput={onStructuredInput}
            />
          );
        }
        return <UserMessage key={msg.id} message={msg} />;
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-start gap-3 px-4 py-3 animate-in fade-in duration-300">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-2xl rounded-tl-md px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="text-xs text-primary-400 ml-1">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
