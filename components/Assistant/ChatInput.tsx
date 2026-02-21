'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isTyping: boolean;
  hasQuickReplies: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isTyping,
  hasQuickReplies,
  inputRef: externalRef,
}) => {
  const [value, setValue] = useState('');
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

  const placeholder = hasQuickReplies ? 'Or type your own response...' : 'Type your message...';

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [value, textareaRef]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isTyping) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isTyping}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50
            px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isTyping}
          className="flex items-center justify-center w-10 h-10 rounded-xl
            bg-primary-600 text-white
            hover:bg-primary-700
            disabled:bg-gray-200 disabled:text-gray-400
            active:scale-95
            transition-all duration-150
            flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
      {/* Powered by AI footer */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <Sparkles size={10} className="text-primary-400" />
        <span className="text-[10px] text-gray-400">Powered by AI — responses may need review</span>
      </div>
    </div>
  );
};
