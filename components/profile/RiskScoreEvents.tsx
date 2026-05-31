'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Minus,
  SlidersHorizontal,
} from 'lucide-react';
import { type RiskScoreEvent, type RiskScoreEventsFilters } from '@/types/user';
import { formatTimestamp } from '@/utils/date';
import { truncateText } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import {
  EVENT_TYPE_OPTIONS,
  formatEventRowLabel,
} from '@/components/profile/riskScoreEvents.utils';

type DeltaFilter = 'all' | 'true' | 'false';

const DELTA_FILTER_OPTIONS: { label: string; value: DeltaFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Penalties only', value: 'true' },
  { label: 'Rewards only', value: 'false' },
];

interface EventFilters {
  eventType: string;
  delta: DeltaFilter;
  dateAfter: string;
  dateBefore: string;
}

const EMPTY_FILTERS: EventFilters = { eventType: '', delta: 'all', dateAfter: '', dateBefore: '' };

const FILTER_INPUT_CLASS =
  'text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-colors';

interface RiskScoreEventsProps {
  events: RiskScoreEvent[];
  count: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters: RiskScoreEventsFilters) => Promise<void>;
}

const startOfDayUtc = (date: string): string | undefined =>
  date ? `${date}T00:00:00Z` : undefined;
const endOfDayUtc = (date: string): string | undefined => (date ? `${date}T23:59:59Z` : undefined);

type DeltaTone = 'penalty' | 'reward' | 'neutral';

const getDeltaTone = (delta: number): DeltaTone => {
  if (delta > 0) return 'penalty';
  if (delta < 0) return 'reward';
  return 'neutral';
};

const DELTA_TONE_STYLES: Record<DeltaTone, { row: string; amount: string }> = {
  penalty: { row: 'border-l-red-400 bg-red-50/40 hover:bg-red-50', amount: 'text-red-600' },
  reward: { row: 'border-l-green-400 bg-green-50/40 hover:bg-green-50', amount: 'text-green-600' },
  neutral: { row: 'border-l-gray-300 bg-gray-50/60 hover:bg-gray-100', amount: 'text-gray-600' },
};

function DeltaIcon({ tone }: Readonly<{ tone: DeltaTone }>) {
  if (tone === 'penalty') return <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" />;
  if (tone === 'reward') return <ArrowUpRight className="w-4 h-4 text-green-500 shrink-0" />;
  return <Minus className="w-4 h-4 text-gray-400 shrink-0" />;
}

export function RiskScoreEvents({
  events,
  count,
  page,
  pageSize,
  isLoading,
  error,
  fetchEvents,
}: Readonly<RiskScoreEventsProps>) {
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(count / pageSize);

  const toRequest = (next: EventFilters, page: number): RiskScoreEventsFilters => ({
    page,
    pageSize,
    eventType: next.eventType || undefined,
    deltaPositive: next.delta === 'all' ? undefined : next.delta === 'true',
    createdDateAfter: startOfDayUtc(next.dateAfter),
    createdDateBefore: endOfDayUtc(next.dateBefore),
  });

  const updateFilters = (partial: Partial<EventFilters>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    fetchEvents(toRequest(next, 1));
  };

  const goToPage = (page: number) => fetchEvents(toRequest(filters, page));

  let eventListBody: ReactNode;
  if (isLoading && events.length === 0) {
    eventListBody = (
      <div className="flex flex-col gap-2 py-3">
        {Array.from({ length: 5 }).map((_, skeletonIndex) => (
          <div key={'event-skeleton-' + skeletonIndex} className="flex items-center gap-3">
            <span className="bg-gray-100 rounded h-10 w-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  } else if (events.length === 0) {
    eventListBody = <p className="text-sm text-gray-400 py-6 text-center">No events found.</p>;
  } else {
    eventListBody = (
      <div className={cn('flex flex-col', isLoading && 'opacity-50 pointer-events-none')}>
        {events.map((event) => {
          const tone = getDeltaTone(event.delta);
          const toneStyle = DELTA_TONE_STYLES[tone];
          const isExpanded = expandedId === event.id;
          const hasDetail = !!event.sourceDetail;

          const rowClassName = cn(
            'w-full flex items-center justify-between py-2.5 px-3 border-l-2 rounded-none rounded-r-md text-sm text-left transition-colors',
            toneStyle.row
          );

          const rowContent = (
            <>
              <div className="flex items-center gap-2.5">
                <DeltaIcon tone={tone} />
                <span className="text-gray-800 font-medium">{formatEventRowLabel(event)}</span>
                {hasDetail && (
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-gray-400 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className={cn('font-semibold tabular-nums', toneStyle.amount)}>
                  {event.delta > 0 ? '+' : ''}
                  {event.delta}
                </span>
                <span className="text-gray-400 text-xs w-24 text-right">
                  {formatTimestamp(event.createdDate)}
                </span>
              </div>
            </>
          );

          return (
            <div key={event.id} className="my-0.5">
              {hasDetail ? (
                <Button
                  variant="ghost"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  className={cn(rowClassName, 'h-auto cursor-pointer')}
                >
                  {rowContent}
                </Button>
              ) : (
                <div className={rowClassName}>{rowContent}</div>
              )}

              {isExpanded && event.sourceDetail && (
                <div className="ml-9 mr-3 mb-1 mt-0.5 rounded-md bg-white border border-gray-100 px-3 py-2.5 text-xs text-gray-600">
                  {event.sourceDetail.title && (
                    <p className="font-medium text-gray-800 mb-1">{event.sourceDetail.title}</p>
                  )}
                  {event.sourceDetail.text && (
                    <p className="text-gray-500 leading-relaxed">
                      {truncateText(event.sourceDetail.text)}
                    </p>
                  )}
                  {event.sourceDetail.url && (
                    <a
                      href={event.sourceDetail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800">Score Events</h4>
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-auto gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md',
              showFilters
                ? 'bg-gray-200 text-gray-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <select
              value={filters.eventType}
              onChange={(e) => updateFilters({ eventType: e.target.value })}
              className={FILTER_INPUT_CLASS}
            >
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.delta}
              onChange={(e) => updateFilters({ delta: e.target.value as DeltaFilter })}
              className={FILTER_INPUT_CLASS}
            >
              {DELTA_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateAfter}
              onChange={(e) => updateFilters({ dateAfter: e.target.value })}
              className={FILTER_INPUT_CLASS}
            />

            <input
              type="date"
              value={filters.dateBefore}
              onChange={(e) => updateFilters({ dateBefore: e.target.value })}
              className={FILTER_INPUT_CLASS}
            />
          </div>
        )}
      </div>

      <div className="px-4 py-2">
        {error && <p className="text-xs text-red-600 py-2">{error}</p>}

        {eventListBody}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            {count} event{count === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-md"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
