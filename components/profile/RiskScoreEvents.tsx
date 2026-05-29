'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { type RiskScoreEventsFilters } from '@/hooks/useAuthor';
import { type RiskScoreEvent, type SourceDetail } from '@/types/user';
import { formatTimestamp } from '@/utils/date';
import { snakeCaseToTitleCase } from '@/utils/stringUtils';
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

const DOCUMENT_LABELS: Record<string, string> = {
  PAPER: 'Paper',
  DISCUSSION: 'Work',
  PREREGISTRATION: 'Proposal',
  GRANT: 'Funding Opportunity',
  QUESTION: 'Question',
  NOTE: 'Note',
  BOUNTY: 'Bounty',
  POSTS: 'Work',
};

const COMMENT_LABELS: Record<string, string> = {
  GENERIC_COMMENT: 'Comment',
  PEER_REVIEW: 'Peer Review',
  REVIEW: 'Community Review',
  ANSWER: 'Answer',
  SUMMARY: 'Summary',
  AUTHOR_UPDATE: 'Author Update',
  REPLICABILITY_COMMENT: 'Replicability Comment',
  INNER_CONTENT_COMMENT: 'Inline Comment',
};

function getSourceLabel(detail: SourceDetail): string {
  if (detail.commentType) return COMMENT_LABELS[detail.commentType] ?? 'Comment';
  if (detail.documentType) return DOCUMENT_LABELS[detail.documentType] ?? 'Document';
  return 'Item';
}

const EVENT_ACTION_LABELS: Record<string, string> = {
  CONTENT_CENSORED: 'Censored',
  WORK_APPROVED: 'Approved',
  WORK_DECLINED: 'Declined',
  BOUNTY_AWARDED: 'Bounty Awarded',
  PEER_REVIEW_TIPPED: 'Tipped',
  PEER_REVIEW_ASSESSED: 'Assessed',
};

function formatEventLabel(event: RiskScoreEvent): string {
  if (!event.sourceDetail) return snakeCaseToTitleCase(event.eventType);
  const source = getSourceLabel(event.sourceDetail);
  const action = EVENT_ACTION_LABELS[event.eventType];
  if (!action) return snakeCaseToTitleCase(event.eventType);
  return `${source} ${action}`;
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
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [deltaFilter, setDeltaFilter] = useState<'all' | 'true' | 'false'>('all');
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
          const isPenalty = event.delta > 0;
          const isExpanded = expandedId === event.id;
          const hasDetail = !!event.sourceDetail;

          const rowClassName = cn(
            'w-full flex items-center justify-between py-2.5 px-3 border-l-2 rounded-none rounded-r-md text-sm text-left transition-colors',
            isPenalty
              ? 'border-l-red-400 bg-red-50/40 hover:bg-red-50'
              : 'border-l-green-400 bg-green-50/40 hover:bg-green-50'
          );

          const rowContent = (
            <>
              <div className="flex items-center gap-2.5">
                {isPenalty ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-green-500 shrink-0" />
                )}
                <span className="text-gray-800 font-medium">{formatEventLabel(event)}</span>
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
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    isPenalty ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  {isPenalty ? '+' : ''}
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
                  {event.sourceDetail.snippet && (
                    <p className="text-gray-500 leading-relaxed">{event.sourceDetail.snippet}</p>
                  )}
                  {event.sourceDetail.url && !isPenalty && (
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
      {/* Header */}
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
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                fetchEvents(buildFilters({ eventType: e.target.value || undefined }));
              }}
              className={FILTER_INPUT_CLASS}
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
              className={FILTER_INPUT_CLASS}
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
              className={FILTER_INPUT_CLASS}
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
              className={FILTER_INPUT_CLASS}
            />
          </div>
        )}
      </div>

      {/* Event List */}
      <div className="px-4 py-2">
        {error && <p className="text-xs text-red-600 py-2">{error}</p>}

        {eventListBody}
      </div>

      {/* Pagination */}
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
