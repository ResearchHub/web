'use client';

import React from 'react';
import { Sparkles, PenLine } from 'lucide-react';
import type { ChatMessage } from '@/types/assistant';
import { AssistantInlineComponent } from './AssistantInlineComponent';

interface BotMessageProps {
  message: ChatMessage;
  isLatest: boolean;
  onStructuredInput?: (field: string, value: any, displayText: string) => void;
  onOpenEditor?: () => void;
}

function renderFormattedText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (part === '\n') return <br key={i} />;
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

export const BotMessage: React.FC<BotMessageProps> = ({
  message,
  isLatest,
  onStructuredInput,
  onOpenEditor,
}) => {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
        <Sparkles size={16} className="text-primary-600" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-700 leading-relaxed">
          {renderFormattedText(message.content)}
        </div>

        {/* Follow-up content — hidden when content goes to editor */}
        {message.followUp && message.inputType !== 'rich_editor' && (
          <div className="relative bg-white border border-primary-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
            <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-[10px] font-semibold text-primary-500 uppercase tracking-wider">
              <Sparkles size={10} />
              AI Draft
            </span>
            {renderFormattedText(message.followUp)}
          </div>
        )}

        {/* Editor changes card — shown when AI has updated the draft */}
        {message.inputType === 'rich_editor' && onOpenEditor && (
          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 shrink-0">
              <PenLine size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Draft Updated</p>
              <p className="text-xs text-gray-500">Changes were made to your document</p>
            </div>
            <button
              onClick={onOpenEditor}
              className="shrink-0 px-4 py-2 text-sm font-medium text-gray-700
                bg-white border border-gray-300 rounded-lg
                hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Review
            </button>
          </div>
        )}

        {/* Inline component (only on latest message) */}
        {isLatest && message.inputType && onStructuredInput && (
          <div className="mt-2">
            <AssistantInlineComponent inputType={message.inputType} onSubmit={onStructuredInput} />
          </div>
        )}
      </div>
    </div>
  );
};
