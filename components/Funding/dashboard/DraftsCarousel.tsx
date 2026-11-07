'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ListFilter, Plus, Search, X } from 'lucide-react';
import { DraftMenu } from '@/components/Funding/DraftMenu';
import { FUNDING_KIND_ICON, type FundingKind } from '@/components/Funding/fundingKind';
import { NewDraftMenu } from '@/components/Funding/NewDraftMenu';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { Input } from '@/components/ui/form/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import type { Note } from '@/types/note';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';
import { DashboardSection } from './DashboardSection';

export const DRAFTS_SECTION_ID = 'drafts';

/**
 * Fired by the sidebar when My Funding is already showing, so the section can
 * scroll into view without waiting to mount again. A fresh visit uses the URL
 * hash instead, because this event is gone before the page exists.
 */
export const SHOW_DRAFTS_EVENT = 'my-funding-show-drafts';

const KIND_LABEL: Record<FundingKind, string> = {
  rfp: 'RFP',
  proposal: 'Proposal',
};

const KIND_TONE = {
  rfp: {
    label: 'text-primary-700',
    surface: 'from-primary-400 via-primary-500 to-primary-700',
  },
  proposal: {
    label: 'text-emerald-700',
    surface: 'from-emerald-400 via-emerald-500 to-emerald-700',
  },
} as const;

/** An RFP when the note is a grant, a proposal when it is a preregistration. */
function draftKind(note: Note): FundingKind | null {
  const type = note.documentType?.trim().toUpperCase();
  if (type === 'GRANT') return 'rfp';
  if (type === 'PREREGISTRATION') return 'proposal';
  return null;
}

/** A displayable cover. `image` can be a storage key, which is not one. */
function coverSrc(note: Note): string | null {
  const src = note.previewImage?.trim();
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
  return null;
}

/** One draft in the row: its cover, kind, and last edit. Opening it resumes the draft. */
function DraftCard({ note }: { readonly note: Note }) {
  const { openDraft } = useFundingDrafting();
  const kind = draftKind(note);
  const tone = kind ? KIND_TONE[kind] : null;
  const title = note.title?.trim() || 'Untitled';
  const cover = coverSrc(note);

  return (
    <div className="relative w-[280px] shrink-0 snap-start">
      <Button
        type="button"
        variant="outlined"
        onClick={() => openDraft(note)}
        className={cn(
          'h-full w-full flex-col items-stretch justify-start gap-0 overflow-hidden p-0',
          'rounded-xl border-gray-200 text-left font-normal',
          'hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <span className="relative h-28 shrink-0 bg-gray-100">
          {cover ? (
            <Image src={cover} alt="" fill className="object-cover" sizes="280px" />
          ) : (
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-gradient-to-br text-white',
                tone?.surface ?? 'from-gray-400 via-gray-500 to-gray-600'
              )}
            >
              {kind ? (
                <FontAwesomeIcon icon={FUNDING_KIND_ICON[kind]} className="h-8 w-8 drop-shadow" />
              ) : null}
            </span>
          )}
        </span>
        <span className="px-3.5 pb-3.5 pt-3">
          <span className={cn('block text-[11px] font-semibold', tone?.label ?? 'text-gray-600')}>
            {kind ? KIND_LABEL[kind] : 'Draft'}
            <span className="font-medium text-gray-500">
              {' · Edited '}
              {formatTimeAgo(note.updatedDate)}
            </span>
          </span>
          <span
            className={
              'mt-1 line-clamp-2 block text-[15px] font-semibold leading-snug text-gray-900'
            }
          >
            {title}
          </span>
        </span>
      </Button>
      <div className="absolute right-2 top-2 z-10">
        <DraftMenu
          noteId={note.id}
          title={title}
          align="end"
          triggerClassName="h-7 w-7 bg-white/90 shadow-sm hover:bg-white"
        />
      </div>
    </div>
  );
}

/** The title the card shows, so a blank note still matches a search for "Untitled". */
function draftTitle(note: Note): string {
  return note.title?.trim() || 'Untitled';
}

/**
 * A filter icon that opens a title search, the way a moderator opens the
 * funder search. The notes are already loaded, so the row filters in place.
 */
function DraftFilter({
  query,
  onQueryChange,
}: {
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
}) {
  const active = query.trim().length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Filter drafts"
          title="Filter drafts"
          aria-pressed={active}
          className={cn('h-8 w-8', active ? 'text-primary-600' : 'text-gray-500')}
        >
          <ListFilter className="h-5 w-5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <Input
          autoFocus
          icon={<Search className="h-4 w-4 text-gray-400" />}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search drafts"
          aria-label="Search drafts by title"
          rightElement={
            active ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                onClick={() => onQueryChange('')}
                className="mr-1 h-8 w-8 text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}

interface DraftsCarouselProps {
  /** The user's drafts, latest edit first. Empty renders nothing. */
  readonly drafts: readonly Note[];
}

/**
 * Every draft the user has, on their own My Funding overview. The row scrolls
 * once the cards no longer fit. One draft is the same card, with no arrows.
 * "+" starts another. The filter searches the titles already loaded.
 */
export function DraftsCarousel({ drafts }: DraftsCarouselProps) {
  const { startNew } = useFundingDrafting();
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? drafts.filter((note) => draftTitle(note).toLowerCase().includes(needle))
    : drafts;
  const ref = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);
  // The hash scroll runs once per visit. Deleting a draft must not pull the page back up.
  const scrolledForHash = useRef(false);

  useEffect(() => {
    if (drafts.length === 0) return;
    const show = () => {
      window.requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setArrived(true);
      });
    };
    const onHash = () => {
      if (window.location.hash === `#${DRAFTS_SECTION_ID}`) show();
    };
    if (!scrolledForHash.current && window.location.hash === `#${DRAFTS_SECTION_ID}`) {
      scrolledForHash.current = true;
      show();
    }
    window.addEventListener('hashchange', onHash);
    window.addEventListener(SHOW_DRAFTS_EVENT, show);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener(SHOW_DRAFTS_EVENT, show);
    };
  }, [drafts.length]);

  useEffect(() => {
    if (!arrived) return;
    const timeout = window.setTimeout(() => setArrived(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [arrived]);

  if (drafts.length === 0) return null;

  return (
    <div
      ref={ref}
      id={DRAFTS_SECTION_ID}
      className={cn(
        'scroll-mt-6 rounded-2xl transition-colors duration-700',
        arrived && 'bg-primary-50/70'
      )}
    >
      <DashboardSection
        title="Drafts"
        action={
          <div className="mb-0.5 flex items-center">
            <DraftFilter query={query} onQueryChange={setQuery} />
            <NewDraftMenu
              align="end"
              onSelect={startNew}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="New draft"
                  title="New draft"
                  className="h-8 w-8 text-gray-500"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </Button>
              }
            />
          </div>
        }
      >
        {shown.length > 0 ? (
          <Carousel hideArrowsWhenStatic arrowOffset="inset" keepInset>
            {shown.map((note) => (
              <DraftCard key={note.id} note={note} />
            ))}
          </Carousel>
        ) : (
          <p className="py-6 text-sm text-gray-500">No drafts match “{query.trim()}”.</p>
        )}
      </DashboardSection>
    </div>
  );
}
