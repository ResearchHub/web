'use client';

import Link from 'next/link';
import { ChevronRight, FileText, Files, Plus } from 'lucide-react';
import { NewDraftMenu } from '@/components/Funding/NewDraftMenu';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useFundingNotes } from '@/contexts/FundingNotesContext';
import type { Note } from '@/types/note';
import { formatTimeAgoShort } from '@/utils/date';
import { cn } from '@/utils/styles';
import { YOU_CARD } from './youStyles';

/** Drafts listed here; the rest are in My Funding. */
const DRAFTS_SHOWN = 2;

const ROW =
  'flex min-h-[52px] w-full items-center gap-3 border-t border-gray-100 px-3.5 py-1.5 text-left outline-none transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500';

function kindOf(note: Note): string {
  const type = note.documentType?.toUpperCase();
  if (type === 'GRANT') return 'RFP';
  if (type === 'PREREGISTRATION') return 'Proposal';
  return 'Draft';
}

/** "edited 2h ago", "edited just now", "edited Oct 3". */
function editedLabel(updatedDate: string): string {
  const short = formatTimeAgoShort(updatedDate);
  if (short === 'now') return 'edited just now';
  return /^\d/.test(short) ? `edited ${short} ago` : `edited ${short}`;
}

/**
 * The user's latest drafts, a "+ New" for another, and the way to My Funding.
 * From the documents the app already loaded for the sidebar: no request of its
 * own.
 */
export function YouDraftsCard({ onNavigate }: { readonly onNavigate: () => void }) {
  const { drafts, published, status, refresh } = useFundingNotes();
  const { startNew, openDraft } = useFundingDrafting();

  const startDraft = (intent: FundingIntent) => {
    startNew(intent);
    onNavigate();
  };
  const open = (note: Note) => {
    openDraft(note);
    onNavigate();
  };

  const body = (() => {
    if (status === 'loading' || status === 'off') {
      return (
        <div aria-hidden="true">
          {['w-[62%]', 'w-[48%]'].map((width) => (
            <div
              key={width}
              className="flex min-h-[52px] items-center gap-3 border-t border-gray-100 px-3.5"
            >
              <div className="h-[18px] w-[18px] shrink-0 animate-pulse rounded bg-gray-100" />
              <div className={cn('h-3.5 animate-pulse rounded bg-gray-100', width)} />
            </div>
          ))}
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="flex min-h-[52px] items-center justify-between gap-3 border-t border-gray-100 px-3.5 py-1.5">
          <p className="text-[13px] text-gray-500">Couldn’t load your documents.</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="shrink-0 text-[13px] font-semibold text-primary-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }
    if (drafts.length === 0) {
      return (
        <p className="flex min-h-[52px] items-center border-t border-gray-100 px-3.5 text-[13.5px] text-gray-500">
          No drafts yet
        </p>
      );
    }
    return drafts.slice(0, DRAFTS_SHOWN).map((note) => (
      <button key={note.id} type="button" onClick={() => open(note)} className={ROW}>
        <FileText size={18} className="shrink-0 text-gray-500" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-medium text-gray-900">
            {note.title?.trim() || 'Untitled'}
          </span>
          <span className="block text-xs text-gray-500">
            {kindOf(note)} · {editedLabel(note.updatedDate)}
          </span>
        </span>
      </button>
    ));
  })();

  return (
    <section aria-labelledby="you-drafts-heading" className={cn(YOU_CARD, 'overflow-hidden')}>
      <div className="flex h-[46px] items-center justify-between pl-3.5 pr-2">
        <h2 id="you-drafts-heading" className="text-[15px] font-semibold text-gray-900">
          Drafts
        </h2>
        <NewDraftMenu
          align="end"
          onSelect={startDraft}
          trigger={
            <button
              type="button"
              aria-label="New draft"
              className="flex h-9 items-center gap-[5px] rounded-lg px-2 text-[13.5px] font-semibold text-primary-600 outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-500 data-[state=open]:bg-gray-50"
            >
              <Plus size={15} aria-hidden="true" />
              New
            </button>
          }
        />
      </div>
      {body}
      {/* Always there: everything drafted, published, funded and earned. The count once the listing is in. */}
      <Link href="/my-funding" onClick={onNavigate} className={ROW}>
        <Files size={18} className="shrink-0 text-gray-500" aria-hidden="true" />
        <span className="flex-1 text-[14.5px] font-medium text-gray-900">My Funding</span>
        {status === 'ready' && (
          <span className="text-[13px] text-gray-500">{published.length} published</span>
        )}
        <ChevronRight size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
      </Link>
    </section>
  );
}
