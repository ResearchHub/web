'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, HandCoins, MessageSquare, Star } from 'lucide-react';
import { ActivityCardSkeletonList } from '@/components/Activity/ActivityCardSkeleton';
import {
  getContribution,
  getEntryMeta,
  getFundraiseAmounts,
  getGrantAmount,
  getReviewScore,
  resolveDisplayedContribution,
} from '@/components/Activity/lib/feedEntryAdapters';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgoShort } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { FeedEntry } from '@/types/feed';

type EventKind = 'money' | 'review' | 'update';

const FILTERS: { id: EventKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'money', label: 'Money' },
  { id: 'review', label: 'Reviews' },
  { id: 'update', label: 'Updates' },
];

interface FundingActivityFeedProps {
  /** Entries the viewer holds a position in, newest first. */
  entries: FeedEntry[];
  isLoading: boolean;
}

/**
 * Activity scoped to the viewer's funding.
 *
 * The marketplace feed makes the *actor* the subject — "Jacob Haase funded
 * proposal for $11K" — because you're there to discover people and projects.
 * Once the feed is scoped to money you've already committed, the actor stops
 * being the point: what you need to know is which of your positions moved. So
 * this feed re-anchors on the position and demotes the event to a line
 * underneath it, bundling consecutive events on the same position into one
 * block. Bundling is the single biggest noise reduction available here — one
 * proposal collecting six contributions is one thing that happened, not six.
 */
export function FundingActivityFeed({ entries, isLoading }: FundingActivityFeedProps) {
  const [filter, setFilter] = useState<EventKind | 'all'>('all');

  const groups = useMemo(() => {
    const visible = entries.filter((entry) => filter === 'all' || getEventKind(entry) === filter);
    return groupConsecutiveByPosition(visible);
  }, [entries, filter]);

  if (isLoading) return <ActivityCardSkeletonList />;

  return (
    <div className="py-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((option) => {
          const isActive = filter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors',
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-500">
            {filter === 'all'
              ? 'Nothing has happened on your funding yet.'
              : 'No activity of this kind yet.'}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {groups.map((group, index) => (
            <div key={group.key}>
              {group.dayLabel !== groups[index - 1]?.dayLabel && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {group.dayLabel}
                </p>
              )}
              <PositionGroup group={group} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PositionEventGroup {
  key: string;
  title: string;
  href?: string;
  dayLabel: string;
  isRfp: boolean;
  entries: FeedEntry[];
}

/**
 * Bundles runs of events that share a position while preserving the overall
 * reverse-chronological order, so "newest first" still holds at the block
 * level. Grouping every event by position instead would bury fresh activity
 * under whichever position happened to be listed first.
 */
function groupConsecutiveByPosition(entries: FeedEntry[]): PositionEventGroup[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const groups: PositionEventGroup[] = [];
  for (const entry of sorted) {
    const { title, href } = getEntryMeta(entry);
    if (!title) continue;

    const last = groups[groups.length - 1];
    if (last && last.title === title) {
      last.entries.push(entry);
      continue;
    }

    groups.push({
      key: `${title}-${entry.id}`,
      title,
      href,
      dayLabel: getDayLabel(entry.timestamp),
      isRfp: entry.contentType === 'GRANT',
      entries: [entry],
    });
  }
  return groups;
}

function getDayLabel(timestamp: string): string {
  const then = new Date(timestamp);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const daysAgo = Math.floor((startOfToday.getTime() - then.getTime()) / 86_400_000);
  if (daysAgo < 0) return 'Today';
  if (daysAgo === 0) return 'Yesterday';
  if (daysAgo < 7) return 'This week';
  if (daysAgo < 30) return 'This month';
  return 'Earlier';
}

function PositionGroup({ group }: { group: PositionEventGroup }) {
  const summary = usePositionSummary(group);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <PositionHeader group={group} summary={summary} />
      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {group.entries.map((entry) => (
          <EventLine key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function PositionHeader({
  group,
  summary,
}: {
  group: PositionEventGroup;
  summary: { label: string | null; percent: number | null };
}) {
  const content = (
    <div className="flex items-start gap-3 p-3 transition-colors group-hover:bg-gray-50/60">
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-black/5',
          group.isRfp ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
        )}
      >
        <HandCoins size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {group.isRfp ? 'Your RFP' : 'You backed'}
          </span>
          {summary.label && (
            <span className="font-mono text-[11px] font-semibold text-gray-500">
              {summary.label}
            </span>
          )}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm font-semibold leading-snug text-gray-900">
          {group.title}
        </span>
        {summary.percent !== null && (
          <span className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-gray-100">
            <span
              className="block h-full rounded-full bg-primary-500"
              style={{ width: `${summary.percent}%` }}
            />
          </span>
        )}
      </span>

      {group.href && (
        <ChevronRight
          size={16}
          className="mt-1 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </div>
  );

  if (!group.href) return content;
  return (
    <Link href={group.href} className="group block">
      {content}
    </Link>
  );
}

function usePositionSummary(group: PositionEventGroup) {
  const { showUSD } = useCurrencyPreference();
  const [first] = group.entries;

  if (group.isRfp) {
    const amount = getGrantAmount(first);
    if (!amount) return { label: null, percent: null };
    return {
      label: formatCurrency({
        amount: showUSD ? amount.usd : amount.rsc,
        showUSD,
        exchangeRate: 1,
        skipConversion: true,
        shorten: true,
      }),
      percent: null,
    };
  }

  const { goalUsd, raisedUsd } = getFundraiseAmounts(first);
  if (goalUsd <= 0) return { label: null, percent: null };
  const percent = Math.min(100, Math.round((raisedUsd / goalUsd) * 100));
  return { label: `${percent}% funded`, percent };
}

function getEventKind(entry: FeedEntry): EventKind {
  if (getContribution(entry)) return 'money';
  if (entry.contentType === 'GRANT' || entry.contentType === 'BOUNTY') return 'money';
  if (getReviewScore(entry) != null) return 'review';
  return 'update';
}

const EVENT_ICONS: Record<EventKind, React.ReactNode> = {
  money: <HandCoins size={14} className="text-green-600" />,
  review: <Star size={14} className="fill-amber-400 text-amber-400" />,
  update: <MessageSquare size={14} className="text-gray-400" />,
};

function EventLine({ entry }: { entry: FeedEntry }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const kind = getEventKind(entry);
  const actor = getEntryMeta(entry).author?.fullName;

  let label: string;
  const contribution = getContribution(entry);
  const score = getReviewScore(entry);

  if (contribution) {
    const { amount, inUSD } = resolveDisplayedContribution(contribution, showUSD, exchangeRate);
    const formatted = formatCurrency({
      amount,
      showUSD: inUSD,
      exchangeRate: 1,
      skipConversion: true,
      shorten: true,
    });
    label = `${formatted} contributed`;
  } else if (score != null) {
    label = `Peer reviewed · ${score.toFixed(1)}`;
  } else if (entry.contentType === 'GRANT') {
    label = 'RFP opened';
  } else {
    label = 'New update';
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <span className="shrink-0">{EVENT_ICONS[kind]}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-gray-700">
        <span className="font-semibold text-gray-900">{label}</span>
        {actor && <span className="text-gray-500"> by {actor}</span>}
      </span>
      <span className="shrink-0 text-xs text-gray-400">{formatTimeAgoShort(entry.timestamp)}</span>
    </div>
  );
}
