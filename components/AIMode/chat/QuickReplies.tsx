'use client';

import { ArrowRight } from 'lucide-react';
import type { QuickReply } from '../lib/types';

interface QuickRepliesProps {
  readonly replies: QuickReply[];
  readonly disabled: boolean;
  readonly onSelect: (reply: QuickReply) => void;
}

/**
 * Suggested responses under an assistant turn. These are the reason the whole
 * demo can be driven without typing.
 */
export const QuickReplies = ({ replies, disabled, onSelect }: QuickRepliesProps) => {
  if (replies.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {replies.map((reply) => (
        <button
          key={reply.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-left text-sm text-gray-800 shadow-sm transition-colors hover:border-primary-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {reply.label}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary-500 transition-transform group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
};
