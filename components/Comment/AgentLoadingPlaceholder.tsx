'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface AgentLoadingPlaceholderProps {
  fields: string[]; // e.g., ["neuroimaging", "glymphatic system", "alzheimer's disease"]
  durationMs?: number; // total duration for the placeholder
  onDone?: () => void;
}

const defaultSequence = (fields: string[]) => [
  `Contacting experts in ${fields.join(', ')}...`,
  'Organizing conference of ideas...',
  'Sipping coffee...',
  'Preempting reviewer 2...',
  'Eureka moment...',
];

export const AgentLoadingPlaceholder: React.FC<AgentLoadingPlaceholderProps> = ({
  fields,
  durationMs = 5500,
  onDone,
}) => {
  const messages = useMemo(() => defaultSequence(fields), [fields]);
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!messages.length) return;
    const step = Math.max(700, Math.floor(durationMs / messages.length));
    const interval = setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= messages.length) {
          clearInterval(interval);
          return i;
        }
        return next;
      });
    }, step);
    const exitTimeout = setTimeout(
      () => {
        setExiting(true);
      },
      Math.max(0, durationMs - 260)
    );
    const doneTimeout = setTimeout(() => {
      clearInterval(interval);
      if (onDone) onDone();
    }, durationMs);
    return () => {
      clearInterval(interval);
      clearTimeout(exitTimeout);
      clearTimeout(doneTimeout);
    };
  }, [messages, durationMs, onDone]);

  return (
    <div className="pl-6 border-l border-gray-200">
      <div
        className={
          'relative rounded-lg border border-gray-200 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-transform duration-200 ' +
          (exiting ? 'animate-card-exit' : 'animate-card-in')
        }
      >
        <div className="flex items-center gap-3">
          {/* Animated ring with ResearchCoinIcon */}
          <div className="relative h-7 w-7">
            <svg
              className="absolute inset-0 h-full w-full animate-rotate"
              viewBox="0 0 44 44"
              fill="none"
            >
              <circle
                className="text-gray-200"
                cx="22"
                cy="22"
                r="19"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.6"
              />
              <circle
                className="text-blue-500 animate-dash"
                cx="22"
                cy="22"
                r="19"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="80 140"
                strokeDashoffset="0"
              />
              <circle
                className="text-blue-500/80 animate-dot"
                cx="22"
                cy="22"
                r="19"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="1 180"
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ResearchCoinIcon size={16} variant="solid" color="#2563EB" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-800">ResearchHub Agents</span>
              <span className="text-gray-400">is thinking…</span>
            </div>
            <div className="mt-0.5 min-h-[18px] text-[13px] text-gray-600">
              <span key={index} className="inline-block animate-message-in">
                {messages[index]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          0% {
            stroke-dasharray: 1 180;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 120 60;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 1 180;
            stroke-dashoffset: -125;
          }
        }
        @keyframes dotMove {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -200;
            opacity: 0.6;
          }
        }
        @keyframes messageIn {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: translateY(4px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes cardExit {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-2px) scale(0.98);
          }
        }
        .animate-rotate {
          animation: rotate 1.2s linear infinite;
        }
        .animate-dash {
          animation: dash 1.5s ease-in-out infinite;
        }
        .animate-dot {
          animation: dotMove 1.8s ease-in-out infinite;
        }
        .animate-message-in {
          animation: messageIn 220ms ease-out;
        }
        .animate-card-in {
          animation: cardIn 180ms ease-out;
        }
        .animate-card-exit {
          animation: cardExit 220ms ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default AgentLoadingPlaceholder;
