'use client';

import { useState } from 'react';
import { AlertCircle, Ban, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import {
  isActiveExecutionStatus,
  type ChatFeedItem,
  type ChatExecution,
  type ChatStreamItem,
  type ChatToolCallActivity,
} from '@/types/notebookChat';
import {
  ActivityFeed,
  carriesSweep,
  drawsAsRow,
  humanizeLabel,
  PendingThinkingRow,
} from './ActivityFeed';

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
function summarizeActivity(items: ChatFeedItem[]): string | null {
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

/**
 * What a screen reader is told while a real row carries the sweep. A sweep
 * can't be heard, so without this an active turn goes silent to assistive
 * technology the moment its first row arrives and the placeholder — which
 * announces itself — stands down.
 *
 * Names the row the sweep is on and nothing more: it changes when the turn
 * moves to a new step, never per delta, so the streaming prose is never read
 * out as it is written.
 */
function liveRowLabel(items: ChatFeedItem[], streamingItem: ChatStreamItem | undefined): string {
  // Same emptiness check `carriesSweep` makes: a draft with no label of its own
  // has nothing to announce either, so fall through to whatever else is live.
  if (streamingItem?.type === 'tool_draft' && streamingItem.label.length > 0) {
    return humanizeLabel(streamingItem.label);
  }
  if (streamingItem?.type === 'thinking') return 'Thinking';
  const running = items.find(
    (item): item is ChatToolCallActivity =>
      item.type === 'tool_call' && item.status === 'in_progress'
  );
  return running ? humanizeLabel(running.label) : 'Thinking';
}

interface ExecutionProgressProps {
  readonly execution: ChatExecution;
}

/**
 * The progress block for one turn: the streaming activity feed, keeping its
 * shape once the turn settles so the turn doesn't reformat under the reader.
 * The summary row can collapse it by hand.
 *
 * Nothing here announces that the turn is running — the sweep on whichever row
 * is moving is the whole visible signal, with a polite live region saying the
 * same thing for anyone who can't see it. When no row can carry the sweep a
 * placeholder does; after the last row settles, while the answer is published,
 * the composer's Stop button is what's left.
 *
 * Failed turns render their user-safe `error.message`; cancelled turns render a
 * "Stopped" marker; both keep their partial feed.
 */
export function ExecutionProgress({ execution }: ExecutionProgressProps) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  // Durable activity is followed by the current provider iteration's
  // transient preview. A lifecycle refetch replaces the preview with the
  // newly durable rows/message once the complete turn is recorded.
  const streamItems = namespaceStreamItems(execution.stream);
  const activity: ChatFeedItem[] = [...(execution.activity ?? []), ...streamItems];
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

  // A settled, tool-less success has nothing worth a progress block. A live
  // turn always has something: at worst the placeholder below.
  if (!live && !failed && !cancelled && activity.length === 0) {
    return null;
  }

  const showsSummaryRow = !live && Boolean(summary);
  const showsFeed = (live || expanded) && activity.some(drawsAsRow);
  // Deltas always append to the newest stream item, so while the turn is live
  // the tail is the block currently being written.
  const streamingItem = live ? streamItems.at(-1) : undefined;
  const streamingItemId = streamingItem?.id;
  // The sweep needs a row that wears it: the block taking deltas, or a tool
  // still running. When there is neither — before the first row arrives, while
  // narration streams with no label to shimmer, or when the newest stream item
  // is a kind this build doesn't draw — the placeholder carries it, so the
  // transcript is never dead while the turn is.
  const sweepHasARow =
    (streamingItem != null && carriesSweep(streamingItem)) ||
    activity.some((item) => item.type === 'tool_call' && item.status === 'in_progress');
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

      {/* `active`, not `live`: a SUCCEEDED turn waiting on its answer has
          finished thinking, and its terminal response drops `stream` anyway, so
          `live` here would label every successful turn "Thinking" on its way
          out. The composer's Stop button covers that window. */}
      {active && !sweepHasARow && <PendingThinkingRow className={cn(showsFeed && 'mt-4')} />}

      {/* Exactly complementary to the placeholder, which carries its own live
          region — between them one polite region is mounted for the whole
          active turn, and never two saying the same thing. */}
      {active && sweepHasARow && (
        <span className="sr-only" aria-live="polite">
          {liveRowLabel(activity, streamingItem)}
        </span>
      )}

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
