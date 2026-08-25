'use client';

import { useMemo, useState, type ComponentType } from 'react';
import {
  Ban,
  BookOpen,
  Brain,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
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
import { MarkdownMessage } from './MarkdownMessage';
import type {
  ActivityCallStatus,
  ChatFeedItem,
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
  // Each underscore sandwiched between alphanumerics becomes a space; edge or
  // doubled underscores stay, so only identifier-looking tokens are touched.
  return label.replaceAll(/([a-z0-9])_(?=[a-z0-9])/g, '$1 ');
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
 * A faded band sweeping through the word itself, clipped to the glyphs, marking
 * a label as live. The motion carries the "still working" signal on its own,
 * which is why the labels that wear it need no icon or dots beside them.
 *
 * Callers must set `--shine` to the label's color — the gradient is drawn from
 * it, and `text-transparent` rules out `currentColor`.
 * `-webkit-text-fill-color` is what actually reveals the gradient in WebKit, so
 * both it and `text-transparent` have to be set, and both have to be put back
 * when motion is reduced or the label would render invisible rather than merely
 * unanimated.
 */
const TEXT_SHINE = cn(
  'bg-text-shine bg-[length:300%_100%] bg-clip-text text-transparent',
  '[-webkit-text-fill-color:transparent] animate-text-shine',
  'motion-reduce:animate-none motion-reduce:bg-none',
  'motion-reduce:[color:var(--shine)] motion-reduce:[-webkit-text-fill-color:var(--shine)]'
);

/**
 * One tool call. A call still running wears the sweep on its label, the same
 * mark the streaming reasoning block gets, so the one live row in the feed is
 * always the one that's moving.
 *
 * The status icon sits in a fixed 16px gutter and everything
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
          <span
            className={cn(
              'min-w-0 truncate',
              call.status === 'in_progress' && cn('[--shine:theme(colors.gray.800)]', TEXT_SHINE)
            )}
          >
            {humanizeLabel(call.label)}
          </span>
        </div>
        {call.detail && (
          <p className="mt-1.5 break-words leading-relaxed text-gray-500">{call.detail}</p>
        )}
        {call.sources && call.sources.length > 0 && <SourceLinks sources={call.sources} />}
      </div>
    </div>
  );
}

/**
 * Markdown markers dropped for the collapsed one-line preview, where markup
 * can't render and would read as clutter. Underscores stay: intraword `_`
 * isn't emphasis, and thinking text is full of snake_case identifiers.
 */
function stripMarkdown(text: string): string {
  return text
    .replaceAll(/```[a-z]*\n?/g, '')
    .replaceAll(/^#{1,6}\s+/gm, '')
    .replaceAll(/^[-*+]\s+/gm, '')
    .replaceAll(/\[([^\][]*)\]\([^()]*\)/g, '$1')
    .replaceAll(/(\*\*|\*|`|~~)/g, '');
}

/**
 * A block of text the model is writing: its readable reasoning, or the prose
 * inside a tool call it is still composing. Both grow incrementally and both
 * run long — 4000 chars of reasoning, a whole redrafted section — so both
 * collapse to a labeled row with a one-line preview rather than drowning the
 * tool rows inline; the chevron-led button mirrors the settled-turn summary
 * toggle.
 *
 * While the block is the one currently receiving stream deltas it stays
 * expanded so the text is readable as it arrives, then collapses on its own
 * once the stream moves past it — unless the user has toggled it, which always
 * wins.
 *
 * A block with no text is a plain row: there is nothing to disclose, so it gets
 * no button and no chevron. Drafts of tools whose arguments aren't prose stay
 * that way for their whole life.
 *
 * `className` carries the row's colour *and* the matching `--shine`, which have
 * to agree: the sweep is drawn from `--shine`, and the label's own colour is
 * transparent while it runs.
 */
function StreamedTextRow({
  label,
  text,
  streaming,
  className,
  bodyClassName,
  icon: Icon,
}: {
  readonly label: string;
  readonly text: string;
  readonly streaming: boolean;
  readonly className: string;
  readonly bodyClassName?: string;
  readonly icon?: ComponentType<{ className?: string }>;
}) {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const hasText = text.length > 0;
  const expanded = hasText && (userExpanded ?? streaming);
  // Settled rows re-render on every stream delta; strip once per text value.
  const preview = useMemo(() => stripMarkdown(text), [text]);

  const head = (
    <>
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {hasText &&
          (expanded ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          ))}
      </span>
      <span className="flex min-w-0 items-center gap-x-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />}
        {/* The label is the row's identity: it keeps its width and the preview
            beside it gives way, or a label longer than "Thought" wraps. */}
        <span className={cn('shrink-0 whitespace-nowrap font-medium', streaming && TEXT_SHINE)}>
          {label}
        </span>
        {/* nowrap collapses the block's newlines, so the preview is one line. */}
        {hasText && !expanded && <span className="min-w-0 truncate text-gray-400">{preview}</span>}
      </span>
    </>
  );

  return (
    <div className={className}>
      {hasText ? (
        <button
          type="button"
          onClick={() => setUserExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex w-full items-start gap-2 text-left transition-colors"
        >
          {head}
        </button>
      ) : (
        <div className="flex items-start gap-2">{head}</div>
      )}
      {expanded && (
        <div className="mt-1 pl-6">
          <MarkdownMessage content={text} className={bodyClassName} />
        </div>
      )}
    </div>
  );
}

/**
 * Stands in for the streaming row in the moment before the first one arrives:
 * the turn is live and has produced nothing, so there is no row yet to carry
 * the sweep. It also covers the case where the newest stream item is a kind
 * this build can't draw, which would otherwise leave nothing shimmering.
 *
 * It is the reasoning row, built from the same component with nothing to
 * disclose yet — which is what keeps the handoff invisible. Standing outside
 * the feed's columns meant the word hopped 24px right the instant the real row
 * mounted; from the row's own label column it doesn't move at all, and the
 * arriving text just opens a chevron beside it.
 *
 * Deliberately not driven by the backend's phase label: this is a placeholder
 * for a missing row, not a report on what the turn is doing.
 */
export function PendingThinkingRow({ className }: { readonly className?: string }) {
  return (
    // The feed sets this on each `li`; there is no `li` here to inherit it.
    <div aria-live="polite" className={cn('text-sm leading-relaxed', className)}>
      <StreamedTextRow
        label="Thinking"
        text=""
        streaming
        className="text-gray-500 [--shine:theme(colors.gray.500)]"
      />
    </div>
  );
}

/** Item kinds this build draws. A newer backend's is skipped, not left empty. */
const DRAWN_TYPES: ReadonlySet<string> = new Set([
  'narration',
  'thinking',
  'tool_call',
  'tool_draft',
]);

/**
 * Of those, the ones that wear the sweep while they take deltas — the kinds
 * with a label to run it through. Narration has none: it is bare prose, drawn
 * so it reads continuously into the answer it becomes.
 */
const SWEEPING_TYPES: ReadonlySet<string> = new Set(['thinking', 'tool_draft']);

/**
 * Whether this build can draw `item` at all. An item it can't draw is left out
 * of the feed entirely — an empty row would open a gap.
 */
export function drawsAsRow(item: ChatFeedItem): boolean {
  return DRAWN_TYPES.has(item.type);
}

/**
 * Whether `item`, while it is the block taking deltas, says on its own that the
 * turn is still running. Strictly narrower than `drawsAsRow`: streaming
 * narration fills a row and still goes still the moment its text stops
 * arriving, so it needs the placeholder underneath it rather than instead of
 * it. Callers check this, not `drawsAsRow`, before deciding the feed is
 * carrying the live signal.
 */
export function carriesSweep(item: ChatFeedItem): boolean {
  return SWEEPING_TYPES.has(item.type);
}

function ActivityItemBody({
  item,
  streaming,
}: {
  readonly item: ChatFeedItem;
  readonly streaming: boolean;
}) {
  if (item.type === 'narration') {
    // Same renderer as the answer bubble, so the live narration preview and
    // the settled message it becomes read as one continuous surface.
    return (
      <div className="pl-6">
        <MarkdownMessage content={item.text} className="text-gray-500" />
      </div>
    );
  }
  if (item.type === 'thinking') {
    // The icon is the settled row's mark, next to the past-tense word, which
    // puts it in the same shape as the tool rows it sits among. A live block
    // goes without: the sweep needs the word to run through, and an icon beside
    // a shimmering label is a second thing saying the same thing.
    return (
      <StreamedTextRow
        label={streaming ? 'Thinking' : 'Thought'}
        icon={streaming ? undefined : Brain}
        text={item.text}
        streaming={streaming}
        className="text-gray-500 hover:text-gray-700 [--shine:theme(colors.gray.500)]"
        bodyClassName="italic text-gray-500"
      />
    );
  }
  if (item.type === 'tool_draft') {
    // Coloured and iconed like the tool row it becomes, so the draft and the
    // call it turns into read as one step rather than two.
    return (
      <StreamedTextRow
        label={humanizeLabel(item.label)}
        text={item.text}
        streaming={streaming}
        icon={TOOL_ICONS[item.tool] ?? Wrench}
        className="text-gray-800 hover:text-gray-600 [--shine:theme(colors.gray.800)]"
        bodyClassName="text-gray-500"
      />
    );
  }
  if (item.type === 'tool_call') {
    return <ToolCallRow call={item} />;
  }
  return null;
}

interface ActivityFeedProps {
  readonly items: ChatFeedItem[];
  /** Stream id of the item currently receiving deltas, while the turn is live. */
  readonly streamingItemId?: string;
  readonly className?: string;
}

/**
 * The ordered account of what the agent did during a turn: narration prose
 * between tool calls, and one row per tool call with status + citations.
 */
export function ActivityFeed({ items, streamingItemId, className }: ActivityFeedProps) {
  const rows = items.filter(drawsAsRow);
  if (rows.length === 0) return null;

  return (
    <ol className={cn('space-y-4', className)}>
      {rows.map((item, index) => {
        const id = 'id' in item && typeof item.id === 'string' ? item.id : null;
        return (
          // Stream items carry stable ids; durable feed items are append-only,
          // making their fallback index stable within the settled activity list.
          // eslint-disable-next-line react/no-array-index-key
          <li key={id ?? index} className="text-sm leading-relaxed">
            <ActivityItemBody item={item} streaming={id != null && id === streamingItemId} />
          </li>
        );
      })}
    </ol>
  );
}

/** Unique sources across a whole turn, for the Sources tab. */
export function collectSources(items: ChatFeedItem[]): ChatActivitySource[] {
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
