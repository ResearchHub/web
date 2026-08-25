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
import { ActivityFeed, humanizeLabel, TEXT_SHINE } from './ActivityFeed';

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

/** Copy for the live status line while a turn runs or finishes up. */
function liveStatusLabel(execution: ChatExecution, finishing: boolean): string {
  if (finishing) return 'Finishing up';
  const phaseLabel = execution.phase?.label;
  if (phaseLabel != null) return phaseLabel;
  return execution.status === 'PENDING' ? 'Waiting to start' : 'Working';
}

/**
 * The turn's live phase, e.g. "Thinking" (the label is the backend's — see
 * `liveStatusLabel`). The sweep across the word is the running signal, so the
 * pulsing dots that used to sit beside it are gone; `--shine` keeps the line in
 * its own primary colour rather than the feed's gray.
 *
 * Shown only in the gaps the feed can't cover — before the first block arrives,
 * and while the turn finishes up. Once the feed has something moving, that is
 * the live signal and this line stays out of its way.
 */
export function LiveStatusLine({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 text-sm font-medium text-primary-600">
      <span aria-live="polite" className={cn('[--shine:theme(colors.primary.600)]', TEXT_SHINE)}>
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

  const showsSummaryRow = !live && Boolean(summary);
  const showsFeed = (live || expanded) && activity.length > 0;
  // Deltas always append to the newest stream item, so while the turn is live
  // the tail is the block currently being written.
  const streamingItemId = live ? streamItems.at(-1)?.id : undefined;
  // Whatever is moving in the feed — the streaming block's shimmering label,
  // or a tool still running — already says the turn is alive, and says it in
  // the same words the phase line would use. Only one of them shows.
  const feedCarriesLive =
    showsFeed &&
    (streamingItemId != null ||
      activity.some((item) => item.type === 'tool_call' && item.status === 'in_progress'));
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
          streamingItemId={streamingItemId}
          className={cn(showsSummaryRow && 'mt-3')}
        />
      )}

      {live && !feedCarriesLive && <LiveStatusLine label={statusLabel} />}

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
