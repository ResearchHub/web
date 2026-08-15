'use client';

import type { ComponentType } from 'react';
import {
  Ban,
  BookOpen,
  Building2,
  Check,
  FileSearch,
  FileText,
  Globe,
  SquarePen,
  SquareTerminal,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import type {
  ActivityCallStatus,
  ChatActivityItem,
  ChatActivitySource,
  ChatToolCallActivity,
} from '@/types/notebookChat';

/**
 * Icons for the tools we know about today. The backend adds tools without
 * notice, so this is cosmetic only — unknown tools fall back to a wrench and
 * always render their server-supplied `label` verbatim.
 */
const TOOL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  read_note: FileText,
  edit_note: SquarePen,
  web_search: Globe,
  search_institutions: Building2,
  search_authors: Users,
  get_author: User,
  get_author_works: BookOpen,
  get_work_fulltext: FileSearch,
  code_execution: SquareTerminal,
};

/**
 * The backend labels tools it knows; for new ones it can fall back to copy
 * that embeds the machine name ("Used code_execution"). Soften any
 * identifier-looking token to plain words so raw snake_case never reaches the
 * feed, whatever tools the backend grows next.
 */
export function humanizeLabel(label: string): string {
  return label.replace(/[a-z0-9]+(?:_[a-z0-9]+)+/g, (token) => token.replace(/_/g, ' '));
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Citations — always external links opening in a new tab.
 *
 * Rendered as a plain list rather than bordered pills: several wrapped chips
 * turn into a dense block that's hard to scan, and each one's border competes
 * with the chrome-free feed around it. A standing underline carries the
 * affordance without link colour, which would pull focus from the answer, and
 * one source per line keeps long titles readable. The Sources tab is where the
 * full detail (title + host) lives.
 */
function SourceLinks({ sources }: { readonly sources: ChatActivitySource[] }) {
  if (sources.length === 0) return null;
  return (
    <ul className="mt-2.5 space-y-2">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={source.title ?? source.url}
            className="group inline-flex max-w-full items-center gap-1.5 text-xs text-gray-900"
          >
            <Globe
              className="h-3 w-3 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600"
              aria-hidden="true"
            />
            <span className="truncate underline decoration-gray-300 underline-offset-[3px] transition-colors group-hover:decoration-gray-600">
              {source.title || hostnameOf(source.url)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function CallStatusIcon({ status }: { readonly status: ActivityCallStatus }) {
  switch (status) {
    case 'in_progress':
      return <Loader size="sm" className="!h-3.5 !w-3.5 text-primary-500" />;
    case 'succeeded':
      return <Check className="h-3.5 w-3.5 text-green-600" aria-label="Succeeded" />;
    case 'interrupted':
      return <Ban className="h-3.5 w-3.5 text-gray-400" aria-label="Interrupted" />;
    default:
      return <X className="h-3.5 w-3.5 text-red-500" aria-label="Failed" />;
  }
}

/**
 * One tool call. The status icon sits in a fixed 16px gutter and everything
 * else stacks in the column beside it: label, then the query on its own line
 * (wrapped, not truncated — a clipped search string is unreadable), then any
 * citations. Narration indents to the same column so the feed reads as one
 * left-aligned list rather than a ragged mix.
 */
function ToolCallRow({ call }: { readonly call: ChatToolCallActivity }) {
  const ToolIcon = TOOL_ICONS[call.tool] ?? Wrench;

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        <CallStatusIcon status={call.status} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-medium text-gray-800">
          <ToolIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
          <span className="min-w-0 truncate">{humanizeLabel(call.label)}</span>
        </div>
        {call.detail && (
          <p className="mt-1.5 break-words leading-relaxed text-gray-500">{call.detail}</p>
        )}
        {call.sources && call.sources.length > 0 && <SourceLinks sources={call.sources} />}
      </div>
    </div>
  );
}

/** Unknown item types from newer backends render nothing (never crash the feed). */
function ActivityItemBody({ item }: { readonly item: ChatActivityItem }) {
  if (item.type === 'narration') {
    return (
      <p className="whitespace-pre-wrap break-words pl-6 leading-relaxed text-gray-500">
        {item.text}
      </p>
    );
  }
  if (item.type === 'tool_call') {
    return <ToolCallRow call={item} />;
  }
  return null;
}

interface ActivityFeedProps {
  readonly items: ChatActivityItem[];
  readonly className?: string;
}

/**
 * The ordered account of what the agent did during a turn: narration prose
 * between tool calls, and one row per tool call with status + citations.
 */
export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) return null;

  return (
    <ol className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        // Feed items are append-only and have no ids; index keys are stable here.
        // eslint-disable-next-line react/no-array-index-key
        <li key={index} className="text-sm leading-relaxed">
          <ActivityItemBody item={item} />
        </li>
      ))}
    </ol>
  );
}

/** Unique sources across a whole turn, for the Sources tab. */
export function collectSources(items: ChatActivityItem[]): ChatActivitySource[] {
  const byUrl = new Map<string, ChatActivitySource>();
  for (const item of items) {
    if (item.type === 'tool_call' && item.sources) {
      for (const source of item.sources) {
        if (!byUrl.has(source.url)) byUrl.set(source.url, source);
      }
    }
  }
  return Array.from(byUrl.values());
}
