'use client';

import React from 'react';
import type { QuickReply } from '@/types/assistant';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSelect }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-end px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {replies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
            border border-primary-200 text-primary-700 bg-white
            hover:bg-primary-50 hover:border-primary-300
            active:scale-95
            transition-all duration-150 ease-in-out
            cursor-pointer"
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
};
