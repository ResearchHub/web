'use client';

import { useState } from 'react';
import { AlertCircle, Ban, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import {
  isActiveExecutionStatus,
  type ChatActivityItem,
  type ChatExecution,
} from '@/types/notebookChat';
import { ActivityFeed, SourceChips, collectSources } from './ActivityFeed';

/** "Searched the web ×2 · Read the note" — tool labels in first-appearance order. */
function summarizeActivity(items: ChatActivityItem[]): string | null {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.type === 'tool_call') {
      counts.set(item.label, (counts.get(item.label) ?? 0) + 1);
    }
  }
  if (counts.size === 0) {
    return items.length > 0 ? 'Assistant notes' : null;
  }
  return Array.from(counts.entries())
    .map(([label, count]) => (count > 1 ? `${label} ×${count}` : label))
    .join(' · ');
}

export function LiveStatusLine({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 text-xs font-medium text-primary-600">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse-dot"
            style={{ animationDelay: `${dot * 260}ms` }}
          />
        ))}
      </span>
      <span aria-live="polite">{label}</span>
    </div>
  );
}

interface ExecutionProgressProps {
  readonly execution: ChatExecution;
}

/**
 * The progress block for one turn: the streaming activity feed plus the live
 * phase line while the turn runs, collapsing to a compact expandable summary
 * once it settles. Failed turns render their user-safe `error.message`;
 * cancelled turns render a "Stopped" marker; both keep their partial feed.
 */
export function ExecutionProgress({ execution }: ExecutionProgressProps) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  const activity = execution.activity ?? [];
  const active = isActiveExecutionStatus(execution.status);
  // SUCCEEDED can precede the answer landing in `messages`; stay visually live
  // until publication so we never render "done" with no answer bubble.
  const finishing = execution.status === 'SUCCEEDED' && execution.assistant_message_pending;
  const live = active || finishing;
  const expanded = userExpanded ?? live;

  const failed = execution.status === 'FAILED' || execution.status === 'INTERRUPTED';
  const cancelled = execution.status === 'CANCELLED';

  const summary = summarizeActivity(activity);
  const aggregatedSources = collectSources(activity);

  // A clean, tool-less success has nothing worth a progress block.
  if (!live && !failed && !cancelled && activity.length === 0) {
    return null;
  }

  const statusLabel = finishing
    ? 'Finishing up'
    : (execution.phase?.label ?? (execution.status === 'PENDING' ? 'Waiting to start' : 'Working'));

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
      {execution.attempt > 1 && (
        <p className="pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
          Retry attempt {execution.attempt}
        </p>
      )}

      {!live && summary && (
        <button
          type="button"
          onClick={() => setUserExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-1.5 text-left text-xs text-gray-500 transition-colors hover:text-gray-700"
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span className="min-w-0 truncate">{summary}</span>
        </button>
      )}

      {(live || expanded) && activity.length > 0 && (
        <ActivityFeed items={activity} className={cn(!live && summary && 'mt-2')} />
      )}

      {/* Citations stay reachable without expanding the settled feed. */}
      {!live && !expanded && aggregatedSources.length > 0 && (
        <SourceChips sources={aggregatedSources} />
      )}

      {live && <LiveStatusLine label={statusLabel} />}

      {failed && (
        <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{execution.error?.message ?? 'Something went wrong.'}</span>
        </div>
      )}

      {cancelled && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Ban className="h-3.5 w-3.5" aria-hidden="true" />
          Stopped
        </div>
      )}
    </div>
  );
}
