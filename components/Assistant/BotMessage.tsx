'use client';

import React from 'react';
import { Sparkles, PenLine } from 'lucide-react';
import type { ChatMessage } from '@/types/assistant';
import { InlineComponent } from './InlineComponent';

interface BotMessageProps {
  message: ChatMessage;
  isLatest: boolean;
  onStructuredInput?: (field: string, value: any, displayText: string) => void;
}

/**
 * Renders markdown-like bold text (**text**) and newlines in the message.
 */
function renderFormattedText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (part === '\n') {
      return <br key={i} />;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export const BotMessage: React.FC<BotMessageProps> = ({ message, isLatest, onStructuredInput }) => {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Avatar */}
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
        <Sparkles size={16} className="text-indigo-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Main message */}
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-700 leading-relaxed">
          {renderFormattedText(message.content)}
        </div>

        {/* Follow-up content (AI-drafted content) — hidden when shown in editor panel */}
        {message.followUp && message.inputType !== 'rich_editor' && (
          <div className="relative bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
            <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">
              <Sparkles size={10} />
              AI Draft
            </span>
            {renderFormattedText(message.followUp)}
          </div>
        )}

        {/* Editor panel indicator */}
        {message.inputType === 'rich_editor' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-600 font-medium">
            <PenLine size={13} />
            Editing in the side panel
          </div>
        )}

        {/* Inline component (only on latest message) */}
        {isLatest && message.inputType && onStructuredInput && (
          <div className="mt-2">
            <InlineComponent inputType={message.inputType} onSubmit={onStructuredInput} />
          </div>
        )}
      </div>
    </div>
  );
};
