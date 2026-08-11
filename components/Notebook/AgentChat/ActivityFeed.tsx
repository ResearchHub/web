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
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import type {
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
};

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Citation chips — always external links opening in a new tab. */
export function SourceChips({ sources }: { readonly sources: ChatActivitySource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {sources.map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          title={source.title ?? source.url}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-700"
        >
          <Globe className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
          <span className="truncate">{source.title || hostnameOf(source.url)}</span>
        </a>
      ))}
    </div>
  );
}

function ToolCallRow({ call }: { readonly call: ChatToolCallActivity }) {
  const ToolIcon = TOOL_ICONS[call.tool] ?? Wrench;

  return (
    <div>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
          {call.status === 'in_progress' ? (
            <Loader size="sm" className="!h-3.5 !w-3.5 text-primary-500" />
          ) : call.status === 'succeeded' ? (
            <Check className="h-3.5 w-3.5 text-green-600" aria-label="Succeeded" />
          ) : call.status === 'interrupted' ? (
            <Ban className="h-3.5 w-3.5 text-gray-400" aria-label="Interrupted" />
          ) : (
            <X className="h-3.5 w-3.5 text-red-500" aria-label="Failed" />
          )}
        </span>
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span className="inline-flex items-center gap-1 font-medium text-gray-700">
            <ToolIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
            {call.label}
          </span>
          {call.detail && (
            <span className="min-w-0 truncate text-gray-500" title={call.detail}>
              {call.detail}
            </span>
          )}
        </span>
      </div>
      {call.sources && call.sources.length > 0 && (
        <div className="pl-6">
          <SourceChips sources={call.sources} />
        </div>
      )}
    </div>
  );
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
    <ol className={cn('space-y-1.5', className)}>
      {items.map((item, index) => (
        // Feed items are append-only and have no ids; index keys are stable here.
        // eslint-disable-next-line react/no-array-index-key
        <li key={index} className="text-xs">
          {item.type === 'narration' ? (
            <p className="whitespace-pre-wrap break-words pl-6 italic text-gray-500">{item.text}</p>
          ) : item.type === 'tool_call' ? (
            <ToolCallRow call={item} />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** Unique sources across a whole turn, for the collapsed summary state. */
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
