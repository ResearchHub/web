'use client';

import { useState } from 'react';
import { AlertCircle, Ban, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import {
  isActiveExecutionStatus,
  type ChatActivityItem,
  type ChatExecution,
  type ChatStreamItem,
} from '@/types/notebookChat';
import { ActivityFeed, humanizeLabel } from './ActivityFeed';
import { LivingFlask, type FlaskState } from './LivingFlask';

/**
 * Stream item ids are stable only within one provider iteration; namespaced
 * with the stream identity they stay unique feed-wide, so a reused id in the
 * next iteration mounts a fresh row instead of inheriting the old one's state.
 */
function namespaceStreamItems(stream: ChatExecution['stream']): ChatStreamItem[] {
  if (stream == null) return [];
  return stream.items.map((item) => ({ ...item, id: `${stream.id}:${item.id}` }));
}

/** "Searched the web ×2 · Read the note" — tool labels in first-appearance order. */
function summarizeActivity(items: ChatActivityItem[]): string | null {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.type === 'tool_call') {
      const label = humanizeLabel(item.label);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  if (counts.size === 0) {
    return items.length > 0 ? 'Assistant notes' : null;
  }
  return Array.from(counts.entries())
    .map(([label, count]) => (count > 1 ? `${label} ×${count}` : label))
    .join(' · ');
}

/** Announced copy for the live status line, which otherwise shows no words. */
function liveStatusLabel(execution: ChatExecution, finishing: boolean): string {
  if (finishing) return 'Finishing up';
  const phaseLabel = execution.phase?.label;
  if (phaseLabel != null) return phaseLabel;
  return execution.status === 'PENDING' ? 'Waiting to start' : 'Working';
}

/**
 * How the flask plays the turn: waiting to be started, then head-down working,
 * then a pop as the answer arrives. `phase.state` is the backend's coarse
 * machine state and grows without notice, so anything unrecognised reads as
 * plain work rather than being branched on exhaustively.
 */
function liveFlaskState(execution: ChatExecution, finishing: boolean): FlaskState {
  if (finishing) return 'delivered';
  if (execution.status === 'PENDING') return 'listen';
  switch (execution.phase?.state) {
    case 'queued':
      return 'listen';
    case 'responding':
      return 'delivered';
    default:
      return 'active';
  }
}

/**
 * The turn's live phase, carried by the flask instead of by words. The words
 * the backend sends — "Thinking", or a tool's own label — are already a line
 * above in the feed, so printing them again here only reads as duplication;
 * the flask says the same thing without competing for the same words. The
 * label stays as the announced text, the one place it was never redundant.
 */
export function LiveStatusLine({
  state,
  label,
}: {
  readonly state: FlaskState;
  readonly label: string;
}) {
  return (
    <div className="flex items-center pt-1 text-primary-500">
      <LivingFlask state={state} />
      <span aria-live="polite" className="sr-only">
        {label}
      </span>
    </div>
  );
}

interface ExecutionProgressProps {
  readonly execution: ChatExecution;
}

/**
 * The progress block for one turn: the streaming activity feed plus the live
 * phase line while the turn runs, keeping the same feed once it settles so the
 * turn doesn't reformat under the reader. The summary row can collapse it by
 * hand. Failed turns render their user-safe `error.message`; cancelled turns
 * render a "Stopped" marker; both keep their partial feed.
 */
export function ExecutionProgress({ execution }: ExecutionProgressProps) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  // Durable activity is followed by the current provider iteration's
  // transient preview. A lifecycle refetch replaces the preview with the
  // newly durable rows/message once the complete turn is recorded.
  const streamItems = namespaceStreamItems(execution.stream);
  const activity: ChatActivityItem[] = [...(execution.activity ?? []), ...streamItems];
  const active = isActiveExecutionStatus(execution.status);
  // SUCCEEDED can precede the answer landing in `messages`; stay visually live
  // until publication so we never render "done" with no answer bubble.
  const finishing = execution.status === 'SUCCEEDED' && execution.assistant_message_pending;
  const live = active || finishing;
  // Settling a turn used to collapse it, which swapped the feed for a flat list
  // of aggregated links — the same sources in a different shape. Stay expanded
  // so the turn reads the same before and after it finishes.
  const expanded = userExpanded ?? true;

  const failed = execution.status === 'FAILED' || execution.status === 'INTERRUPTED';
  const cancelled = execution.status === 'CANCELLED';

  const summary = summarizeActivity(activity);

  // A clean, tool-less success has nothing worth a progress block.
  if (!live && !failed && !cancelled && activity.length === 0) {
    return null;
  }

  const statusLabel = liveStatusLabel(execution, finishing);
  const flaskState = liveFlaskState(execution, finishing);

  const showsSummaryRow = !live && Boolean(summary);
  const showsFeed = (live || expanded) && activity.length > 0;
  // A failed turn with no tool activity has nothing above the error, so the
  // usual separating margin would just be dead space.
  const hasBodyAbove = showsSummaryRow || showsFeed;

  return (
    // Tool activity reads as quiet prose in the transcript, not a boxed
    // sidebar — only a failed turn earns a surface of its own, so the error
    // stands out against the otherwise chrome-free feed.
    <div className={cn(failed && 'rounded-lg border border-red-200 bg-red-50 px-3 py-2.5')}>
      {showsSummaryRow && (
        <button
          type="button"
          onClick={() => setUserExpanded(!expanded)}
          aria-expanded={expanded}
          className={cn(
            'flex w-full items-center gap-1.5 text-left text-sm transition-colors',
            failed ? 'text-red-700/80 hover:text-red-800' : 'text-gray-500 hover:text-gray-800'
          )}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span className="min-w-0 truncate">{summary}</span>
        </button>
      )}

      {showsFeed && (
        <ActivityFeed
          items={activity}
          // Deltas always append to the newest stream item, so while the turn
          // is live the tail is the block currently being written.
          streamingItemId={live ? streamItems.at(-1)?.id : undefined}
          className={cn(showsSummaryRow && 'mt-3')}
        />
      )}

      {live && <LiveStatusLine state={flaskState} label={statusLabel} />}

      {failed && (
        <div
          className={cn(
            'flex items-start gap-2 text-sm leading-relaxed text-red-700',
            hasBodyAbove && 'mt-2.5'
          )}
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{execution.error?.message ?? 'Something went wrong.'}</span>
        </div>
      )}

      {cancelled && (
        <div
          className={cn(
            'flex items-center gap-2 text-sm font-medium text-gray-500',
            hasBodyAbove && 'mt-2.5'
          )}
        >
          <Ban className="h-3.5 w-3.5" aria-hidden="true" />
          Stopped
        </div>
      )}
    </div>
  );
}
