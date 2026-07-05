'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ConnectorsCard } from './ConnectorsCard';
import {
  CANNED_REPLIES,
  ChatMessage,
  RH_AI_AVATAR_SRC,
  SEED_MESSAGES,
  SUGGESTION_CHIPS,
} from './mockData';

function AiAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-600"
      style={{ width: size, height: size }}
    >
      <Image src={RH_AI_AVATAR_SRC} alt="ResearchHub AI" width={size} height={size} />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const replyIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isBusy = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const streamReply = (text: string) => {
    const words = text.split(' ');
    const id = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: 'assistant', content: '' }]);
    let i = 0;
    const tick = () => {
      i += 1;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: words.slice(0, i).join(' ') } : m))
      );
      if (i < words.length) {
        window.setTimeout(tick, 32);
      } else {
        isBusy.current = false;
      }
    };
    tick();
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || isBusy.current) return;
    isBusy.current = true;
    setShowChips(false);
    setInput('');
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text }]);
    setIsTyping(true);

    window.setTimeout(() => {
      setIsTyping(false);
      const reply = CANNED_REPLIES[replyIndex.current % CANNED_REPLIES.length];
      replyIndex.current += 1;
      streamReply(reply);
    }, 900);
  };

  return (
    <div
      data-tour="proposal-demo-chat"
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white"
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <AiAvatar size={28} />
        <span className="text-sm font-semibold text-gray-900">ResearchHub AI</span>
        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
          Beta
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) =>
          m.role === 'assistant' ? (
            <div key={m.id} className="flex items-start gap-2">
              <AiAvatar size={24} />
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-800">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary-600 px-3 py-2 text-sm leading-relaxed text-white">
                {m.content}
              </div>
            </div>
          )
        )}

        {isTyping && (
          <div className="flex items-start gap-2">
            <AiAvatar size={24} />
            <div className="rounded-2xl rounded-tl-sm bg-gray-50 px-2 py-1">
              <TypingIndicator />
            </div>
          </div>
        )}

        {showChips && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => send(chip)}
                className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-3">
        <div className="rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:border-primary-400">
          <div className="mb-2 flex items-center justify-between gap-2">
            <ConnectorsCard />
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask ResearchHub AI to revise your proposal…"
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim()}
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                input.trim()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-400'
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
