'use client';

import React from 'react';
import type { ChatMessage } from '@/types/assistant';

interface UserMessageProps {
  message: ChatMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-end px-4 py-2 animate-in fade-in slide-in-from-right-2 duration-200">
      <div className="max-w-[80%] bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );
};
