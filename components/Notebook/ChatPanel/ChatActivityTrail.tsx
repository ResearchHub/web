'use client';

import { useState } from 'react';
import { AlertCircle, Check, ChevronRight, CircleDashed, Loader2 } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { NotebookChatActivityEvent } from '@/types/notebookChat';

interface ChatActivityTrailProps {
  events: NotebookChatActivityEvent[];
  /**
   * Live turn: the trail stays open, since the steps are the only feedback
   * the user gets before the reply lands. A settled turn collapses to a
   * one-line summary.
   */
  isRunning?: boolean;
}

function StatusIcon({ status }: { status: NotebookChatActivityEvent['status'] }) {
  switch (status) {
    case 'in_progress':
      return <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary-500" />;
    case 'failed':
      return <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />;
    case 'interrupted':
      return <CircleDashed className="h-3 w-3 shrink-0 text-amber-500" />;
    default:
      return <Check className="h-3 w-3 shrink-0 text-green-600" />;
  }
}

function ActivityStep({ event }: { event: NotebookChatActivityEvent }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-[3px]">
        <StatusIcon status={event.status} />
      </span>
      <span className="min-w-0 leading-relaxed">
        <span className={cn(event.status === 'in_progress' ? 'text-gray-700' : 'text-gray-500')}>
          {event.label}
        </span>
        {event.detail && (
          <span className="text-gray-400 break-words"> — &ldquo;{event.detail}&rdquo;</span>
        )}
      </span>
    </li>
  );
}

/** Sentence describing a settled turn's steps, e.g. "3 steps · 1 failed". */
function summarize(events: NotebookChatActivityEvent[]): string {
  const failed = events.filter(
    (event) => event.status === 'failed' || event.status === 'interrupted'
  ).length;
  const steps = `${events.length} ${events.length === 1 ? 'step' : 'steps'}`;
  return failed > 0 ? `${steps} · ${failed} failed` : steps;
}

/**
 * The tool calls behind one assistant turn. While the turn runs this is the
 * only sign of progress, so it renders expanded; afterwards it folds away so
 * the conversation stays readable.
 */
export function ChatActivityTrail({ events, isRunning = false }: ChatActivityTrailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (events.length === 0) return null;

  const showSteps = isRunning || isExpanded;

  return (
    <div className="flex w-full flex-col gap-1 text-xs">
      {!isRunning && (
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
          className="flex items-center gap-1 self-start rounded text-gray-400 transition-colors hover:text-gray-600"
        >
          <ChevronRight className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-90')} />
          <span>{summarize(events)}</span>
        </button>
      )}
      {showSteps && (
        <ul className={cn('flex flex-col gap-1', !isRunning && 'pl-4')}>
          {events.map((event, index) => (
            <ActivityStep key={`${event.tool}-${index}`} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
}
