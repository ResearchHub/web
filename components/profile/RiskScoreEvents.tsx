'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useRiskScoreEvents, type RiskScoreEventsFilters } from '@/hooks/useAuthor';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

const EVENT_TYPE_OPTIONS = [
  { label: 'All Events', value: '' },
  { label: 'Work Approved', value: 'WORK_APPROVED' },
  { label: 'Work Declined', value: 'WORK_DECLINED' },
  { label: 'Content Censored', value: 'CONTENT_CENSORED' },
  { label: 'Bounty Awarded', value: 'BOUNTY_AWARDED' },
  { label: 'Peer Review Tipped', value: 'PEER_REVIEW_TIPPED' },
  { label: 'Peer Review Assessed', value: 'PEER_REVIEW_ASSESSED' },
  { label: 'Expert Finder Signup', value: 'EXPERT_FINDER_SIGNUP' },
  { label: 'Edu Email Signup', value: 'EDU_EMAIL_SIGNUP' },
  { label: 'ORCID Verified Edu', value: 'ORCID_VERIFIED_EDU' },
  { label: 'Google Signup', value: 'GOOGLE_SIGNUP' },
  { label: 'Account Age Bonus', value: 'ACCOUNT_AGE_BONUS' },
  { label: 'Persona Verified (Whitelisted)', value: 'PERSONA_VERIFIED_WHITELISTED' },
  { label: 'Persona Verified (Non-Whitelisted)', value: 'PERSONA_VERIFIED_NON_WHITELISTED' },
];

const DELTA_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Penalties only', value: 'true' },
  { label: 'Rewards only', value: 'false' },
];

interface RiskScoreEventsProps {
  userId: string;
}

function formatEventType(eventType: string): string {
  return eventType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function RiskScoreEvents({ userId }: RiskScoreEventsProps) {
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [deltaFilter, setDeltaFilter] = useState<'all' | 'true' | 'false'>('all');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');

  const [{ events, count, page, pageSize, isLoading, error }, fetchEvents] = useRiskScoreEvents(
    userId,
    { pageSize: 10 }
  );

  const totalPages = Math.ceil(count / pageSize);

  const buildFilters = (overrides?: Partial<RiskScoreEventsFilters>): RiskScoreEventsFilters => ({
    page: 1,
    pageSize,
    eventType: eventTypeFilter || undefined,
    deltaPositive: deltaFilter === 'all' ? undefined : deltaFilter === 'true',
    createdDateAfter: dateAfter ? `${dateAfter}T00:00:00Z` : undefined,
    createdDateBefore: dateBefore ? `${dateBefore}T23:59:59Z` : undefined,
    ...overrides,
  });

  const goToPage = (newPage: number) => fetchEvents(buildFilters({ page: newPage }));

  return (
    <div className="flex flex-col gap-3 mt-4 pb-20">
      <h4 className="text-xs font-medium uppercase text-gray-500">Risk Score Events</h4>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={eventTypeFilter}
          onChange={(e) => {
            setEventTypeFilter(e.target.value);
            fetchEvents(buildFilters({ eventType: e.target.value || undefined }));
          }}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700"
        >
          {EVENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={deltaFilter}
          onChange={(e) => {
            const val = e.target.value as 'all' | 'true' | 'false';
            setDeltaFilter(val);
            fetchEvents(
              buildFilters({ deltaPositive: val === 'all' ? undefined : val === 'true' })
            );
          }}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700"
        >
          {DELTA_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateAfter}
          onChange={(e) => {
            setDateAfter(e.target.value);
            fetchEvents(
              buildFilters({
                createdDateAfter: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
              })
            );
          }}
          placeholder="From"
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700"
        />

        <input
          type="date"
          value={dateBefore}
          onChange={(e) => {
            setDateBefore(e.target.value);
            fetchEvents(
              buildFilters({
                createdDateBefore: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
              })
            );
          }}
          placeholder="To"
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {isLoading && events.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="bg-gray-200 rounded h-4 w-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-gray-500">No events found.</p>
      ) : (
        <div className={cn('flex flex-col gap-0.5', isLoading && 'opacity-50 pointer-events-none')}>
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between py-1.5 px-2 rounded text-xs hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {event.delta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-green-500 shrink-0" />
                )}
                <span className="text-gray-700">{formatEventType(event.eventType)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    event.delta > 0 ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  {event.delta > 0 ? '+' : ''}
                  {event.delta}
                </span>
                <span className="text-gray-400 w-24 text-right">
                  {formatTimestamp(event.createdDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {count} total event{count !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="p-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="p-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
